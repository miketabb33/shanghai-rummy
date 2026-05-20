import { ref } from 'vue'
import { db } from '../firebase'
import {
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
} from 'firebase/firestore'
import { buildShuffledDeck, dealHands } from './useDeck'
import { cardsForRound } from './useRounds'

const SESSION_GAME_KEY = 'sr_gameId'
const SESSION_PLAYER_KEY = 'sr_playerId'

function generateRoomCode() {
  return Math.random().toString(36).slice(2, 7).toUpperCase()
}

function generatePlayerId() {
  return Math.random().toString(36).slice(2, 10)
}

function saveSession(gid, pid) {
  sessionStorage.setItem(SESSION_GAME_KEY, gid)
  sessionStorage.setItem(SESSION_PLAYER_KEY, pid)
}

function clearSession() {
  sessionStorage.removeItem(SESSION_GAME_KEY)
  sessionStorage.removeItem(SESSION_PLAYER_KEY)
}

export function useLobby() {
  const gameId = ref(null)
  const playerId = ref(null)
  const game = ref(null)
  let unsubscribe = null

  function subscribeToGame(id) {
    unsubscribe?.()
    unsubscribe = onSnapshot(doc(db, 'games', id), (snap) => {
      if (snap.exists()) {
        game.value = snap.data()
      } else {
        // Game was deleted (host cancelled) — reset everything
        game.value = null
        gameId.value = null
        playerId.value = null
        clearSession()
        unsubscribe?.()
      }
    })
  }

  // Restore session on init
  const savedGameId = sessionStorage.getItem(SESSION_GAME_KEY)
  const savedPlayerId = sessionStorage.getItem(SESSION_PLAYER_KEY)
  if (savedGameId && savedPlayerId) {
    gameId.value = savedGameId
    playerId.value = savedPlayerId
    subscribeToGame(savedGameId)
  }

  async function createGame(playerName) {
    const id = generateRoomCode()
    const pid = generatePlayerId()
    playerId.value = pid

    await setDoc(doc(db, 'games', id), {
      status: 'lobby',
      hostId: pid,
      round: 0,
      phase: null,
      activePlayerIndex: 0,
      playerOrder: [pid],
      players: {
        [pid]: { name: playerName, hasBought: false, contractLaid: false },
      },
      hands: {},
      deck: [],
      discard: [],
      melds: {},
      scores: { [pid]: [] },
      buyWindow: null,
      createdAt: serverTimestamp(),
    })

    gameId.value = id
    saveSession(id, pid)
    subscribeToGame(id)
    return id
  }

  async function joinGame(id, playerName) {
    const snap = await getDoc(doc(db, 'games', id))
    if (!snap.exists()) throw new Error('Game not found')
    if (snap.data().status !== 'lobby') throw new Error('Game already started')

    const pid = generatePlayerId()
    playerId.value = pid

    await updateDoc(doc(db, 'games', id), {
      playerOrder: arrayUnion(pid),
      [`players.${pid}`]: { name: playerName, hasBought: false, contractLaid: false },
      [`scores.${pid}`]: [],
    })

    gameId.value = id
    saveSession(id, pid)
    subscribeToGame(id)
  }

  async function startGame() {
    const id = gameId.value
    const playerOrder = game.value.playerOrder
    const deck = buildShuffledDeck()
    const hands = dealHands(deck, playerOrder, cardsForRound(0))

    const topCard = deck.pop()

    await updateDoc(doc(db, 'games', id), {
      status: 'active',
      phase: 'draw',
      deck,
      hands,
      discard: [topCard],
    })
  }

  async function cancelGame() {
    unsubscribe?.()
    await deleteDoc(doc(db, 'games', gameId.value))
    gameId.value = null
    playerId.value = null
    game.value = null
    clearSession()
  }

  function leaveGame() {
    unsubscribe?.()
    gameId.value = null
    playerId.value = null
    game.value = null
    clearSession()
  }

  function cleanup() {
    unsubscribe?.()
  }

  return { gameId, playerId, game, createGame, joinGame, startGame, cancelGame, leaveGame, cleanup }
}
