<script setup>
import CardTile from './CardTile.vue'

const props = defineProps({
  cards: Array,
  selectedIndex: { type: Number, default: null },
  phase: String,
  isMyTurn: Boolean,
})
const emit = defineEmits(['select', 'discard'])

const canSelect = (idx) => props.isMyTurn && props.phase === 'play'

function handleCardClick(idx) {
  if (!canSelect(idx)) return
  if (props.selectedIndex === idx) {
    emit('select', null)
  } else {
    emit('select', idx)
  }
}
</script>

<template>
  <div class="hand-area">
    <div class="hand-label">
      Your hand <span class="count">({{ cards.length }})</span>
    </div>

    <div class="hand-cards">
      <CardTile
        v-for="(card, idx) in cards"
        :key="idx"
        :card="card"
        :selected="selectedIndex === idx"
        :interactive="canSelect(idx)"
        @click="handleCardClick(idx)"
      />
    </div>

    <div v-if="isMyTurn && phase === 'play' && selectedIndex !== null" class="action-bar">
      <button class="btn-discard" @click="emit('discard', selectedIndex)">
        Discard selected card
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

.action-bar {
  display: flex;
  gap: 10px;
}

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
