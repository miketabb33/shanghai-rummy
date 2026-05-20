<script setup>
const props = defineProps({
  card: Object,
  selected: { type: Boolean, default: false },
  interactive: { type: Boolean, default: true },
  small: { type: Boolean, default: false },
})
const emit = defineEmits(['click'])

const SUIT_SYMBOL = { H: '♥', D: '♦', S: '♠', C: '♣', JK: '★' }
const isRed = (c) => c.suit === 'H' || c.suit === 'D'
const isJoker = (c) => c.suit === 'JK'
const displayRank = (c) => c.rank === 'JK' ? 'W' : c.rank
</script>

<template>
  <button
    class="card-tile"
    :class="{
      selected,
      red: isRed(card),
      joker: isJoker(card),
      small,
      'no-interact': !interactive,
    }"
    :disabled="!interactive"
    @click="emit('click')"
  >
    <span class="top-rank">{{ displayRank(card) }}</span>
    <span class="suit-center">{{ SUIT_SYMBOL[card.suit] }}</span>
    <span class="bot-rank">{{ displayRank(card) }}</span>
  </button>
</template>

<style scoped>
.card-tile {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  width: 58px;
  height: 82px;
  background: #fff;
  border: 1.5px solid #ddd;
  border-radius: 7px;
  padding: 4px 5px;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 0.8rem;
  color: #1a1a2e;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  transition: transform 0.12s, box-shadow 0.12s, border-color 0.12s;
  flex-shrink: 0;
}

.card-tile:hover:not(:disabled) {
  transform: translateY(-6px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.15);
}

.card-tile.selected {
  border-color: #1a1a2e;
  transform: translateY(-10px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.2);
}

.card-tile.red { color: #c0392b; }
.card-tile.joker { color: #7c3aed; border-color: #c4b5fd; background: #faf5ff; }

.card-tile.small {
  width: 42px;
  height: 60px;
  font-size: 0.7rem;
  padding: 3px 4px;
}

.card-tile.no-interact { cursor: default; pointer-events: none; }

.top-rank { align-self: flex-start; line-height: 1; }
.bot-rank { align-self: flex-end; transform: rotate(180deg); line-height: 1; }
.suit-center { font-size: 1.3rem; line-height: 1; }

.small .suit-center { font-size: 1rem; }
</style>
