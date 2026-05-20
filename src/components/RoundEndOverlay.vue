<script setup>
import { computed } from 'vue'
import { dealNextRound } from '../composables/useRoundEnd'
import { getRound } from '../composables/useRounds'

const props = defineProps({
  game: Object,
  gameId: String,
  playerId: String,
})

const isHost = computed(() => props.game.hostId === props.playerId)

const winnerName = computed(() =>
  props.game.players[props.game.roundWinner]?.name ?? 'Someone'
)

const roundLabel = computed(() => getRound(props.game.round).label)

const standings = computed(() =>
  props.game.playerOrder.map(pid => ({
    pid,
    name: props.game.players[pid]?.name ?? pid,
    roundScore: props.game.lastRoundScores?.[pid] ?? 0,
    total: (props.game.scores[pid] ?? []).reduce((s, n) => s + n, 0),
  })).sort((a, b) => a.total - b.total)
)

async function handleNextRound() {
  await dealNextRound(props.game, props.gameId)
}
</script>

<template>
  <div class="overlay">
    <div class="panel">
      <div class="round-badge">Round {{ game.round + 1 }} Complete</div>
      <div class="contract-label">{{ roundLabel }}</div>

      <div class="went-out">
        <span class="went-out-label">Went out</span>
        <span class="went-out-name">{{ winnerName }}</span>
      </div>

      <table class="score-table">
        <thead>
          <tr>
            <th>Player</th>
            <th>This round</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in standings" :key="row.pid" :class="{ leader: i === 0 }">
            <td class="name-cell">
              <span class="rank-badge">{{ i + 1 }}</span>
              {{ row.name }}
            </td>
            <td class="score-cell">+{{ row.roundScore }}</td>
            <td class="score-cell total">{{ row.total }}</td>
          </tr>
        </tbody>
      </table>

      <div class="footer">
        <button v-if="isHost" class="btn-next" @click="handleNextRound">
          Next Round →
        </button>
        <span v-else class="waiting-hint">Waiting for host to deal…</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(26, 26, 46, 0.72);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.panel {
  background: #f5efe6;
  border-radius: 16px;
  padding: 36px 40px;
  width: min(480px, 92vw);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  box-shadow: 0 24px 64px rgba(0,0,0,0.35);
}

.round-badge {
  font-family: 'DM Serif Display', serif;
  font-size: 1.6rem;
  color: #1a1a2e;
  text-align: center;
}

.contract-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #888;
  margin-top: -12px;
}

.went-out {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #1a1a2e;
  border-radius: 8px;
  padding: 10px 20px;
  width: 100%;
  justify-content: center;
}

.went-out-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #888;
}

.went-out-name {
  font-family: 'DM Serif Display', serif;
  font-size: 1.1rem;
  color: #e8c26a;
}

.score-table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.88rem;
}

.score-table thead th {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #aaa;
  padding: 6px 8px;
  border-bottom: 1.5px solid #e5e0d8;
  text-align: right;
}

.score-table thead th:first-child { text-align: left; }

.score-table tbody tr {
  border-bottom: 1px solid #ede8e0;
}

.score-table tbody tr.leader td.name-cell {
  font-weight: 700;
  color: #1a1a2e;
}

.score-table tbody tr.leader td.total {
  color: #2e7d32;
  font-weight: 700;
}

.name-cell {
  padding: 10px 8px;
  color: #333;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 8px;
}

.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #e5e0d8;
  font-size: 0.7rem;
  font-weight: 700;
  color: #888;
  flex-shrink: 0;
}

.leader .rank-badge {
  background: #e8c26a;
  color: #1a1a2e;
}

.score-cell {
  padding: 10px 8px;
  text-align: right;
  color: #555;
}

.score-cell.total {
  font-weight: 600;
  color: #333;
}

.footer {
  margin-top: 4px;
  width: 100%;
  display: flex;
  justify-content: center;
}

.btn-next {
  padding: 12px 36px;
  background: #1a1a2e;
  color: #e8c26a;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
  letter-spacing: 0.02em;
}
.btn-next:hover  { background: #2d2d50; }
.btn-next:active { transform: scale(0.97); }

.waiting-hint {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  color: #aaa;
  font-style: italic;
}
</style>
