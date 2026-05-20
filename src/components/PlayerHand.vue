<script setup>
import { computed } from 'vue'
import CardTile from './CardTile.vue'
import { rankValue } from '../composables/useContractValidator'

const SUIT_ORDER = { S: 0, H: 1, D: 2, C: 3, JK: 4 }

const props = defineProps({
  cards: Array,
  selectedIndex: { type: Number, default: null },
  phase: String,
  isMyTurn: Boolean,
  contractLaid: Boolean,
  newCardIndices: { type: Array, default: () => [] },
})
const emit = defineEmits(['select', 'discard', 'lay-contract'])

// Sort high→low by rank, suit as tiebreaker, jokers last.
const sortedHand = computed(() =>
  props.cards
    .map((card, originalIndex) => ({ card, originalIndex }))
    .sort((a, b) => {
      const rankDiff = rankValue(b.card.rank) - rankValue(a.card.rank)
      if (rankDiff !== 0) return rankDiff
      return SUIT_ORDER[a.card.suit] - SUIT_ORDER[b.card.suit]
    })
)

const canSelect = () => props.isMyTurn && props.phase === 'play'

function handleCardClick(originalIndex) {
  if (!canSelect()) return
  emit('select', props.selectedIndex === originalIndex ? null : originalIndex)
}
</script>

<template>
  <div class="hand-area">
    <div class="hand-label">
      Your hand <span class="count">({{ cards.length }})</span>
    </div>

    <div class="hand-cards">
      <div
        v-for="{ card, originalIndex } in sortedHand"
        :key="originalIndex"
        class="card-wrap"
      >
        <CardTile
          :card="card"
          :selected="selectedIndex === originalIndex"
          :interactive="canSelect()"
          :class="{ 'just-drawn': newCardIndices.includes(originalIndex) }"
          @click="handleCardClick(originalIndex)"
        />
        <span v-if="newCardIndices.includes(originalIndex)" class="drawn-label">new</span>
      </div>
    </div>

    <div v-if="isMyTurn && phase === 'play'" class="action-bar">
      <button
        v-if="!contractLaid"
        class="btn-lay"
        @click="emit('lay-contract')"
      >
        Lay Down Contract
      </button>
      <button
        v-if="selectedIndex !== null"
        class="btn-discard"
        @click="emit('discard', selectedIndex)"
      >
        Discard
      </button>
    </div>

    <div v-else-if="isMyTurn && phase === 'draw'" class="hint">
      Draw a card to start your turn
    </div>

    <div v-else-if="isMyTurn && phase === 'play'" class="hint">
      Select a card to discard
    </div>
  </div>
</template>

<style scoped>
.hand-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255,255,255,0.6);
  border-top: 1.5px solid #e5e0d8;
}

.hand-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #888;
}

.count { color: #bbb; font-weight: 400; }

.hand-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
  padding-bottom: 8px;
}

.card-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.drawn-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #e8c26a;
  margin-top: 3px;
  line-height: 1;
}

:deep(.just-drawn) {
  border-color: #e8c26a;
  box-shadow: 0 0 0 2px #e8c26a44, 0 4px 12px rgba(0,0,0,0.15);
}

.action-bar {
  display: flex;
  gap: 10px;
}

.btn-lay {
  padding: 10px 24px;
  background: #1a1a2e;
  color: #e8c26a;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-lay:hover { background: #2d2d50; }

.btn-discard {
  padding: 10px 24px;
  background: #c0392b;
  color: #fff;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
}
.btn-discard:hover  { background: #a93226; }
.btn-discard:active { transform: scale(0.97); }

.hint {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  color: #aaa;
  font-style: italic;
}
</style>
