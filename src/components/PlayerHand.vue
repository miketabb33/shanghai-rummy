<script setup>
import CardTile from './CardTile.vue'
import Draggable from 'vuedraggable'

const props = defineProps({
  cards: Array,
  selectedIndex: { type: Number, default: null },
  phase: String,
  isMyTurn: Boolean,
  contractLaid: Boolean,
  newCardIndices: { type: Array, default: () => [] },
})
const emit = defineEmits(['select', 'discard', 'lay-contract', 'reorder'])

const canSelect = () => props.isMyTurn && props.phase === 'play'

function handleCardClick(i) {
  if (!canSelect()) return
  emit('select', props.selectedIndex === i ? null : i)
}

function handleReorder(evt) {
  emit('reorder', { from: evt.oldIndex, to: evt.newIndex })
}
</script>

<template>
  <div class="hand-area">
    <div class="hand-label">
      Your hand <span class="count">({{ cards.length }})</span>
    </div>

    <Draggable
      :list="cards"
      item-key="_key"
      class="hand-cards"
      ghost-class="card-ghost"
      chosen-class="card-chosen"
      animation="150"
      @end="handleReorder"
    >
      <template #item="{ element: card, index: i }">
        <div class="card-wrap">
          <CardTile
            :card="card"
            :selected="selectedIndex === i"
            :interactive="canSelect()"
            :class="{ 'just-drawn': newCardIndices.includes(i) }"
            @click="handleCardClick(i)"
          />
          <span v-if="newCardIndices.includes(i)" class="drawn-label">new</span>
        </div>
      </template>
    </Draggable>

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
  cursor: grab;
}

.card-wrap:active {
  cursor: grabbing;
}

:global(.card-ghost) {
  opacity: 0.3;
}

:global(.card-chosen) {
  cursor: grabbing;
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
