import { db } from '../firebase'
import { doc, updateDoc } from 'firebase/firestore'
import { cardPoints } from './useDeck'
import { buildShuffledDeck, dealHands } from './useDeck'
import { cardsForRound } from './useRounds'

function scoreHands(game) {
  const roundScores = {}
  for (const pid of game.playerOrder) {
    roundScores[pid] = (game.hands[pid] ?? []).reduce(
      (sum, card) => sum + cardPoints(card),
      0,
    )
  }
  return roundScores
}

export async function endRound(game, gameId, lastDiscard) {
  const ref = doc(db, 'games', gameId)
  const roundScores = scoreHands(game)

  const scoreUpdates = {}
  for (const pid of game.playerOrder) {
    scoreUpdates[`scores.${pid}`] = [...game.scores[pid], roundScores[pid]]
  }

  if (game.round >= 10) {
    await updateDoc(ref, { ...scoreUpdates, status: 'finished' })
    return
  }

  const nextRound = game.round + 1
  const deck = buildShuffledDeck()
  const hands = dealHands(deck, game.playerOrder, cardsForRound(nextRound))
  const topCard = deck.pop()

  const playerResets = {}
  for (const pid of game.playerOrder) {
    playerResets[`players.${pid}.hasBought`] = false
    playerResets[`players.${pid}.contractLaid`] = false
  }

  // Rotate who goes first each round
  const nextFirst = (game.activePlayerIndex + 1) % game.playerOrder.length

  await updateDoc(ref, {
    ...scoreUpdates,
    ...playerResets,
    round: game.round + 1,
    phase: 'draw',
    activePlayerIndex: nextFirst,
    deck,
    hands,
    discard: [topCard],
    melds: {},
    buyWindow: null,
  })
}
