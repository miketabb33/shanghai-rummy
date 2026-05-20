<script setup>
import { computed } from 'vue'

const props = defineProps({
  round: Number,
  contractLabel: String,
  activePlayerName: String,
  isMyTurn: Boolean,
  phase: String,
})

const PHASE_LABELS = { draw: 'Draw', play: 'Play', buy_window: 'Buy?' }
const phaseLabel = computed(() => PHASE_LABELS[props.phase] ?? props.phase)
</script>

<template>
  <header class="game-header">
    <div class="round-info">
      <span class="round-badge">Round {{ round + 1 }} / 11</span>
      <span class="contract-label">{{ contractLabel }}</span>
    </div>

    <div class="turn-info" :class="{ mine: isMyTurn }">
      <span class="turn-dot" />
      <span class="turn-text">
        <template v-if="isMyTurn">Your turn</template>
        <template v-else>{{ activePlayerName }}'s turn</template>
      </span>
      <span class="phase-pill">{{ phaseLabel }}</span>
    </div>
  </header>
</template>

<style scoped>
.game-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: #1a1a2e;
  color: #fff;
  font-family: 'DM Sans', sans-serif;
  gap: 16px;
  flex-wrap: wrap;
}

.round-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.round-badge {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #e8c26a;
}

.contract-label { font-size: 0.85rem; color: #9090b8; }

.turn-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 20px;
  background: rgba(255,255,255,0.06);
}

.turn-info.mine { background: rgba(232,194,106,0.15); }

.turn-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #555;
  flex-shrink: 0;
}

.turn-info.mine .turn-dot {
  background: #e8c26a;
  box-shadow: 0 0 6px #e8c26a;
}

.turn-text { font-size: 0.9rem; font-weight: 500; }

.phase-pill {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 10px;
  background: rgba(255,255,255,0.1);
  color: #ccc;
}
</style>
