import { db } from '../firebase'
import { doc, updateDoc, runTransaction, serverTimestamp } from 'firebase/firestore'
import { cardPoints, buildShuffledDeck, dealHands } from './useDeck'
import { cardsForRound } from './useRounds'

function scoreHands(game, winnerId) {
  const scores = {}
  for (const pid of game.playerOrder) {
    scores[pid] = pid === winnerId
      ? 0
      : (game.hands[pid] ?? []).reduce((sum, card) => sum + cardPoints(card), 0)
  }
  return scores
}

export async function endRound(game, gameId, winnerId) {
  const ref = doc(db, 'games', gameId)
  const roundScores = scoreHands(game, winnerId)

  const scoreUpdates = {}
  for (const pid of game.playerOrder) {
    scoreUpdates[`scores.${pid}`] = [...game.scores[pid], roundScores[pid]]
  }

  if (game.round >= 10) {
    await updateDoc(ref, { ...scoreUpdates, status: 'finished' })
    return
  }

  await updateDoc(ref, {
    ...scoreUpdates,
    phase: 'round_end',
    roundWinner: winnerId,
    lastRoundScores: roundScores,
  })
}

export async function dealNextRound(game, gameId) {
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(doc(db, 'games', gameId))
    const data = snap.data()
    if (data.phase !== 'round_end') return

    const nextRound = data.round + 1
    const deck = buildShuffledDeck()
    const hands = dealHands(deck, data.playerOrder, cardsForRound(nextRound))
    const topCard = deck.pop()

    const playerResets = {}
    for (const pid of data.playerOrder) {
      playerResets[`players.${pid}.contractLaid`] = false
    }

    const nextFirst = (data.activePlayerIndex + 1) % data.playerOrder.length

    tx.update(doc(db, 'games', gameId), {
      ...playerResets,
      round: nextRound,
      phase: 'draw',
      activePlayerIndex: nextFirst,
      turnStartedAt: serverTimestamp(),
      deck,
      hands,
      discard: [topCard],
      melds: {},
      buyWindow: null,
      canBuyDiscard: false,
      buyerId: null,
      roundWinner: null,
      lastRoundScores: null,
    })
  })
}
