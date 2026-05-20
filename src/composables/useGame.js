import { computed } from 'vue'
import { db } from '../firebase'
import { doc, updateDoc, runTransaction, serverTimestamp } from 'firebase/firestore'

export const BUY_WINDOW_MS = 6000

export function useGame(game, gameId, playerId) {
  const myHand = computed(() => game.value?.hands?.[playerId.value] ?? [])

  const activePlayerId = computed(() =>
    game.value ? game.value.playerOrder[game.value.activePlayerIndex] : null
  )

  const isMyTurn = computed(() => activePlayerId.value === playerId.value)

  const canBuy = computed(() => {
    if (!game.value || game.value.phase !== 'buy_window') return false
    if (isMyTurn.value) return false
    return !game.value.players[playerId.value]?.hasBought
  })

  function gameRef() {
    return doc(db, 'games', gameId.value)
  }

  async function drawFromDeck() {
    const deck = [...game.value.deck]
    const card = deck.pop()
    await updateDoc(gameRef(), {
      deck,
      [`hands.${playerId.value}`]: [...myHand.value, card],
      phase: 'play',
    })
  }

  async function takeTopDiscard() {
    const discard = [...game.value.discard]
    const card = discard.pop()
    await updateDoc(gameRef(), {
      discard,
      [`hands.${playerId.value}`]: [...myHand.value, card],
      phase: 'play',
    })
  }

  async function discardCard(cardIndex) {
    const hand = [...myHand.value]
    const [card] = hand.splice(cardIndex, 1)
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

  return { myHand, isMyTurn, activePlayerId, canBuy, drawFromDeck, takeTopDiscard, discardCard, buy, advanceTurn }
}
