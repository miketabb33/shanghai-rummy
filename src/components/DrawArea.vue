<script setup>
import CardTile from './CardTile.vue'

defineProps({
  deckSize: Number,
  topDiscard: Object,
  canDraw: Boolean,
  canTakeDiscard: Boolean,
  canBuy: Boolean,
  isBuyer: Boolean,
})
const emit = defineEmits(['draw', 'take-discard', 'buy'])
</script>

<template>
  <div class="draw-area">
    <div class="pile-slot">
      <button
        class="pile deck"
        :class="{ active: canDraw }"
        :disabled="!canDraw"
        @click="emit('draw')"
      >
        <span class="deck-count">{{ deckSize }}</span>
        <span class="deck-icon">🂠</span>
      </button>
      <span class="pile-label">Draw pile</span>
    </div>

    <div class="pile-slot">
      <div class="discard-wrap">
        <div
          class="pile discard"
          :class="{ active: canTakeDiscard }"
          @click="canTakeDiscard && emit('take-discard')"
        >
          <CardTile v-if="topDiscard" :card="topDiscard" :interactive="false" />
          <span v-else class="empty-label">Empty</span>
        </div>

        <button
          v-if="canBuy"
          class="buy-overlay"
          @click.stop="emit('buy')"
        >
          Buy
        </button>
        <div v-else-if="isBuyer" class="buyer-badge">Buying ✓</div>
      </div>
      <span class="pile-label">Discard</span>
    </div>
  </div>
</template>

<style scoped>
.draw-area {
  display: flex;
  gap: 24px;
  align-items: flex-end;
  justify-content: center;
  padding: 16px 0;
}

.pile-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.discard-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pile {
  width: 68px;
  height: 96px;
  border-radius: 8px;
  border: 2px dashed #d1ccc4;
  background: #f0ebe3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: default;
  transition: border-color 0.15s, transform 0.12s, box-shadow 0.12s;
}

.pile.active {
  border-style: solid;
  border-color: #1a1a2e;
  cursor: pointer;
  background: #fff;
}

.pile.active:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.15);
}

.pile.deck {
  gap: 4px;
  font-family: 'DM Sans', sans-serif;
}

.deck-count {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1a1a2e;
  line-height: 1;
}

.deck-icon {
  font-size: 1.8rem;
  line-height: 1;
}

.pile.discard {
  padding: 0;
  overflow: hidden;
  border-style: solid;
  background: #e8e2d8;
}

.pile.discard.active {
  cursor: pointer;
  background: #fff;
}

.empty-label {
  font-size: 0.7rem;
  color: #bbb;
  font-family: 'DM Sans', sans-serif;
}

.pile-label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #999;
  font-family: 'DM Sans', sans-serif;
}

.buy-overlay {
  position: absolute;
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 14px;
  background: #e8c26a;
  color: #1a1a2e;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  transition: background 0.15s, transform 0.1s;
}
.buy-overlay:hover {
  background: #d4a93c;
  transform: translateX(-50%) translateY(-1px);
}

.buyer-badge {
  position: absolute;
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 10px;
  background: #22c55e;
  color: #fff;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  border-radius: 20px;
  white-space: nowrap;
}
</style>
