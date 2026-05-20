const RANK_ORDER = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
export const rankValue = (rank) => RANK_ORDER.indexOf(rank) + 2

export function isValidSet(cards) {
  const nonJokers = cards.filter(c => c.suit !== 'JK')
  if (nonJokers.length === 0) return cards.length > 0
  const baseRank = nonJokers[0].rank
  return nonJokers.every(c => c.rank === baseRank)
}

export function isValidRun(cards) {
  const nonJokers = cards.filter(c => c.suit !== 'JK')
  if (nonJokers.length === 0) return cards.length > 0

  const suit = nonJokers[0].suit
  if (!nonJokers.every(c => c.suit === suit)) return false

  const jokerCount = cards.length - nonJokers.length
  const values = nonJokers.map(c => rankValue(c.rank)).sort((a, b) => a - b)

  // Reject duplicate ranks
  for (let i = 1; i < values.length; i++) {
    if (values[i] === values[i - 1]) return false
  }

  const span = values[values.length - 1] - values[0] + 1
  const gaps = span - values.length

  // Jokers must cover all gaps, and total span can't exceed group size
  return gaps <= jokerCount && span <= cards.length
}

export function isValidGroup(cards, groupDef) {
  if (cards.length !== groupDef.size) return false
  return groupDef.type === 'set' ? isValidSet(cards) : isValidRun(cards)
}

export function isValidContract(groupCardArrays, contractDef) {
  if (groupCardArrays.length !== contractDef.groups.length) return false
  return groupCardArrays.every((cards, i) => isValidGroup(cards, contractDef.groups[i]))
}
