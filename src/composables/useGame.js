import { computed, ref } from 'vue'
import { db } from '../firebase'
import { doc, updateDoc, runTransaction, serverTimestamp, arrayUnion } from 'firebase/firestore'
import { endRound } from './useRoundEnd'
import { getRound } from './useRounds'

export const BUY_WINDOW_MS = 6000

export function useGame(game, gameId, playerId) {
  const myHand = computed(() => game.value?.hands?.[playerId.value] ?? [])
  const newCardIndices = ref([])

  const activePlayerId = computed(() =>
    game.value ? game.value.playerOrder[game.value.activePlayerIndex] : null
  )

  const isMyTurn = computed(() => activePlayerId.value === playerId.value)

  // true when this player can register buy intent (no one has yet, and they're eligible)
  const canBuy = computed(() => {
    if (!game.value?.canBuyDiscard) return false
    if (game.value.buyerId) return false  // someone already claimed it
    if (isMyTurn.value) return false
    const discarderIndex = (game.value.activePlayerIndex - 1 + game.value.playerOrder.length) % game.value.playerOrder.length
    if (game.value.playerOrder[discarderIndex] === playerId.value) return false
    return true
  })

  const isBuyer = computed(() => game.value?.buyerId === playerId.value)

  function gameRef() {
    return doc(db, 'games', gameId.value)
  }

  async function drawFromDeck() {
    const pid = playerId.value
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(gameRef())
      const data = snap.data()

      const deck = [...data.deck]
      const drawnCard = deck.pop()

      const updates = {
        [`hands.${pid}`]: [...data.hands[pid], drawnCard],
        phase: 'play',
        buyWindow: null,
        canBuyDiscard: false,
        buyerId: null,
      }

      if (data.buyerId) {
        const buyerPid = data.buyerId
        const discard = [...data.discard]
        const boughtCard = discard.pop()
        const penaltyCard = deck.pop()
        updates.discard = discard
        updates[`hands.${buyerPid}`] = [...data.hands[buyerPid], boughtCard, penaltyCard]
      }

      updates.deck = deck
      newCardIndices.value = [data.hands[pid].length]
      tx.update(gameRef(), updates)
    })
  }

  async function takeTopDiscard() {
    const pid = playerId.value
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(gameRef())
      const data = snap.data()
      if (data.phase !== 'draw') return
      if (!data.discard.length) return

      const discard = [...data.discard]
      const card = discard.pop()
      newCardIndices.value = [data.hands[pid].length]

      tx.update(gameRef(), {
        discard,
        [`hands.${pid}`]: [...data.hands[pid], card],
        phase: 'play',
        buyWindow: null,
        canBuyDiscard: false,
        buyerId: null,
      })
    })
  }

  async function discardCard(cardIndex) {
    const hand = [...myHand.value]
    const [card] = hand.splice(cardIndex, 1)

    if (hand.length === 0) {
      await endRound(game.value, gameId.value, playerId.value)
      return
    }

    const nextIndex = (game.value.activePlayerIndex + 1) % game.value.playerOrder.length
    const nextPlayerId = game.value.playerOrder[nextIndex]
    const eligibleBuyers = game.value.playerOrder.filter(pid =>
      pid !== playerId.value && pid !== nextPlayerId
    )

    if (eligibleBuyers.length === 0) {
      await updateDoc(gameRef(), {
        [`hands.${playerId.value}`]: hand,
        discard: [...game.value.discard, card],
        activePlayerIndex: nextIndex,
        phase: 'draw',
        buyWindow: null,
        canBuyDiscard: false,
        buyerId: null,
      })
      return
    }

    await updateDoc(gameRef(), {
      [`hands.${playerId.value}`]: hand,
      discard: [...game.value.discard, card],
      activePlayerIndex: nextIndex,
      phase: 'buy_window',
      buyWindow: { openedAt: serverTimestamp() },
      canBuyDiscard: true,
      buyerId: null,
    })
  }

  // Register intent to buy — first click wins, button hides for everyone else
  async function buy() {
    const pid = playerId.value
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(gameRef())
      const data = snap.data()
      if (!data.canBuyDiscard) return
      if (!['buy_window', 'draw'].includes(data.phase)) return
      if (data.buyerId) return  // someone already registered

      tx.update(gameRef(), { buyerId: pid })
    })
  }

  async function layDownContract(groupIndices) {
    const pid = playerId.value
    const hand = myHand.value
    const allIndices = new Set(groupIndices.flat())
    const roundGroups = getRound(game.value.round).groups
    const melds = groupIndices.map((indices, i) => ({
      type: roundGroups[i].type,
      cards: indices.map(idx => hand[idx]),
    }))
    const newHand = hand.filter((_, i) => !allIndices.has(i))

    await updateDoc(gameRef(), {
      [`hands.${pid}`]: newHand,
      [`melds.${pid}`]: melds,
      [`players.${pid}.contractLaid`]: true,
    })
  }

  async function layOff(handIndex, targetPid, groupIndex) {
    const pid = playerId.value
    const hand = [...myHand.value]
    const [card] = hand.splice(handIndex, 1)

    const melds = game.value.melds[targetPid].map((group, i) =>
      i === groupIndex ? { ...group, cards: [...group.cards, card] } : group
    )

    await updateDoc(gameRef(), {
      [`hands.${pid}`]: hand,
      [`melds.${targetPid}`]: melds,
    })
  }

  // Timer expired: unblock next player, buying intent still valid
  async function advanceTurn() {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(gameRef())
      const data = snap.data()
      if (data.phase !== 'buy_window') return
      tx.update(gameRef(), { phase: 'draw', buyWindow: null })
    })
  }

  async function endGame() {
    await updateDoc(gameRef(), { status: 'finished' })
  }

  async function sendMessage(text) {
    const name = game.value?.players[playerId.value]?.name ?? 'Player'
    await updateDoc(gameRef(), {
      chat: arrayUnion({ pid: playerId.value, name, text, at: Date.now() }),
    })
  }

  return { myHand, newCardIndices, isMyTurn, activePlayerId, canBuy, isBuyer, drawFromDeck, takeTopDiscard, discardCard, buy, advanceTurn, layDownContract, layOff, endGame, sendMessage }
}
