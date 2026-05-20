import { computed, ref } from 'vue'
import { db } from '../firebase'
import { doc, updateDoc, runTransaction, serverTimestamp } from 'firebase/firestore'
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

  const canBuy = computed(() => {
    if (!game.value || game.value.phase !== 'buy_window') return false
    if (isMyTurn.value) return false
    const nextIndex = (game.value.activePlayerIndex + 1) % game.value.playerOrder.length
    if (game.value.playerOrder[nextIndex] === playerId.value) return false
    return !game.value.players[playerId.value]?.hasBought
  })

  function gameRef() {
    return doc(db, 'games', gameId.value)
  }

  async function drawFromDeck() {
    const deck = [...game.value.deck]
    const card = deck.pop()
    newCardIndices.value = [myHand.value.length]
    await updateDoc(gameRef(), {
      deck,
      [`hands.${playerId.value}`]: [...myHand.value, card],
      phase: 'play',
    })
  }

  async function takeTopDiscard() {
    const discard = [...game.value.discard]
    const card = discard.pop()
    newCardIndices.value = [myHand.value.length]
    await updateDoc(gameRef(), {
      discard,
      [`hands.${playerId.value}`]: [...myHand.value, card],
      phase: 'play',
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
      pid !== playerId.value &&
      pid !== nextPlayerId &&
      !game.value.players[pid].hasBought
    )

    if (eligibleBuyers.length === 0) {
      await updateDoc(gameRef(), {
        [`hands.${playerId.value}`]: hand,
        discard: [...game.value.discard, card],
        activePlayerIndex: nextIndex,
        phase: 'draw',
        buyWindow: null,
      })
      return
    }

    await updateDoc(gameRef(), {
      [`hands.${playerId.value}`]: hand,
      discard: [...game.value.discard, card],
      phase: 'buy_window',
      buyWindow: { openedAt: serverTimestamp() },
    })
  }

  async function buy() {
    const pid = playerId.value
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(gameRef())
      const data = snap.data()
      if (data.phase !== 'buy_window') return
      if (data.players[pid].hasBought) return

      const discard = [...data.discard]
      const topCard = discard.pop()
      const deck = [...data.deck]
      const penaltyCard = deck.pop()

      const currentHandLength = data.hands[pid].length
      newCardIndices.value = [currentHandLength, currentHandLength + 1]

      tx.update(gameRef(), {
        discard,
        deck,
        [`hands.${pid}`]: [...data.hands[pid], topCard, penaltyCard],
        [`players.${pid}.hasBought`]: true,
        activePlayerIndex: (data.activePlayerIndex + 1) % data.playerOrder.length,
        phase: 'draw',
        buyWindow: null,
      })
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

  async function advanceTurn() {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(gameRef())
      const data = snap.data()
      if (data.phase !== 'buy_window') return
      tx.update(gameRef(), {
        activePlayerIndex: (data.activePlayerIndex + 1) % data.playerOrder.length,
        phase: 'draw',
        buyWindow: null,
      })
    })
  }

  return { myHand, newCardIndices, isMyTurn, activePlayerId, canBuy, drawFromDeck, takeTopDiscard, discardCard, buy, advanceTurn, layDownContract, layOff }
}
