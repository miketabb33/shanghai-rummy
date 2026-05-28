const SUITS = ['H', 'D', 'C', 'S']
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']

function makeDeck() {
  const cards = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push({ suit, rank })
    }
  }
  cards.push({ suit: 'JK', rank: 'JK' })
  cards.push({ suit: 'JK', rank: 'JK' })
  return cards
}

function shuffle(cards) {
  const a = [...cards]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function buildShuffledDeck() {
  return shuffle([...makeDeck(), ...makeDeck()])
}

export function dealHands(deck, playerIds, cardsPerPlayer = 11) {
  const hands = {}
  for (const id of playerIds) hands[id] = []
  for (let i = 0; i < cardsPerPlayer; i++) {
    for (const id of playerIds) {
      hands[id].push(deck.pop())
    }
  }
  return hands
}

export const SUIT_SYMBOL = { H: '♥', D: '♦', S: '♠', C: '♣', JK: '★' }
export const isRed = (card) => card.suit === 'H' || card.suit === 'D'
export const displayRank = (card) => card.rank === 'JK' ? 'W' : card.rank

export function cardPoints(card) {
  if (card.rank === 'JK') return 20
  if (card.rank === 'A') return 15
  if (['J', 'Q', 'K'].includes(card.rank)) return 10
  return parseInt(card.rank)
}
