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
      <div class="contract-wrap">
        <span class="contract-label">{{ contractLabel }}</span>
        <div class="tooltip">
          <div class="tooltip-group">
            <span class="tooltip-title">Set</span>
            <span class="tooltip-rule">Same rank, any suit</span>
            <span class="tooltip-example">7♥  7♦  7♣</span>
          </div>
          <div class="tooltip-group">
            <span class="tooltip-title">Run</span>
            <span class="tooltip-rule">Consecutive ranks, same suit</span>
            <span class="tooltip-example">4♥  5♥  6♥  7♥</span>
          </div>
          <span class="tooltip-note">★ Jokers are wild</span>
        </div>
      </div>
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

.contract-wrap { position: relative; display: inline-block; }

.contract-label {
  font-size: 0.85rem;
  color: #9090b8;
  cursor: default;
  border-bottom: 1px dashed #4a4a6a;
  padding-bottom: 1px;
}

.tooltip {
  display: none;
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  background: #fff;
  color: #1a1a2e;
  border-radius: 10px;
  padding: 14px 16px;
  min-width: 230px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.25);
  z-index: 50;
  flex-direction: column;
  gap: 10px;
}

.contract-wrap:hover .tooltip { display: flex; }

.tooltip::before {
  content: '';
  position: absolute;
  top: -5px;
  left: 16px;
  width: 10px;
  height: 10px;
  background: #fff;
  transform: rotate(45deg);
  border-radius: 2px;
}

.tooltip-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tooltip-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: #1a1a2e;
}

.tooltip-rule {
  font-size: 0.75rem;
  color: #888;
}

.tooltip-example {
  font-size: 0.82rem;
  color: #555;
  letter-spacing: 0.06em;
}

.tooltip-note {
  font-size: 0.7rem;
  color: #aaa;
  font-style: italic;
  border-top: 1px solid #f0ebe3;
  padding-top: 8px;
}

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
