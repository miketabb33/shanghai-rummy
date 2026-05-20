<script setup>
import { computed, ref } from 'vue'
import HowToPlayModal from './HowToPlayModal.vue'

const props = defineProps({
  round: Number,
  contractLabel: String,
  activePlayerName: String,
  isMyTurn: Boolean,
  phase: String,
  showScores: Boolean,
  isHost: Boolean,
})
const emit = defineEmits(['toggle-scores', 'end-game'])

const PHASE_LABELS = { draw: 'Draw', play: 'Play', buy_window: 'Buy?' }
const phaseLabel = computed(() => PHASE_LABELS[props.phase] ?? null)

const showHelp = ref(false)

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

    <div class="header-right">
    <button v-if="isHost" class="end-btn" @click="emit('end-game')">End Game</button>
    <button class="scores-btn" :class="{ active: showScores }" @click="emit('toggle-scores')">
      Scores
    </button>
    <button class="help-btn" @click="showHelp = true">?</button>

    <div class="turn-info" :class="{ mine: isMyTurn }">
      <span class="turn-dot" />
      <span class="turn-text">
        <template v-if="isMyTurn">Your turn</template>
        <template v-else>{{ activePlayerName }}'s turn</template>
      </span>
      <span v-if="phaseLabel && isMyTurn" class="phase-pill">{{ phaseLabel }}</span>
    </div>
    </div>
  </header>

  <Transition name="fade">
    <HowToPlayModal v-if="showHelp" @close="showHelp = false" />
  </Transition>
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

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.end-btn {
  padding: 5px 13px;
  border-radius: 14px;
  border: 1.5px solid rgba(192, 57, 43, 0.4);
  background: transparent;
  color: rgba(192, 57, 43, 0.7);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  letter-spacing: 0.03em;
}
.end-btn:hover { border-color: #c0392b; color: #c0392b; background: rgba(192,57,43,0.08); }

.scores-btn {
  padding: 5px 13px;
  border-radius: 14px;
  border: 1.5px solid rgba(255,255,255,0.15);
  background: transparent;
  color: #9090b8;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  letter-spacing: 0.03em;
}
.scores-btn:hover { border-color: rgba(255,255,255,0.3); color: #ccc; }
.scores-btn.active { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.25); color: #fff; }

@media (min-width: 613px) { .scores-btn { display: none; } }

.help-btn {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 1.5px solid rgba(255,255,255,0.2);
  background: transparent;
  color: #9090b8;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.help-btn:hover { border-color: rgba(255,255,255,0.5); color: #fff; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.turn-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  border-radius: 20px;
  background: rgba(255,255,255,0.06);
  transition: background 0.3s, box-shadow 0.3s;
}

.turn-info.mine {
  background: #e8c26a;
  box-shadow: 0 0 0 3px rgba(232,194,106,0.35), 0 0 20px rgba(232,194,106,0.25);
  animation: pulse-turn 2s ease-in-out infinite;
}

@keyframes pulse-turn {
  0%, 100% { box-shadow: 0 0 0 3px rgba(232,194,106,0.35), 0 0 20px rgba(232,194,106,0.2); }
  50%       { box-shadow: 0 0 0 5px rgba(232,194,106,0.5), 0 0 28px rgba(232,194,106,0.35); }
}

.turn-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255,255,255,0.35);
  flex-shrink: 0;
}

.turn-info.mine .turn-dot {
  background: #1a1a2e;
  animation: blink 1.1s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.35; }
}

.turn-text {
  font-size: 0.9rem;
  font-weight: 500;
  color: #ccc;
}

.turn-info.mine .turn-text {
  font-weight: 700;
  color: #1a1a2e;
}

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

.turn-info.mine .phase-pill {
  background: rgba(26,26,46,0.15);
  color: #1a1a2e;
}
</style>
