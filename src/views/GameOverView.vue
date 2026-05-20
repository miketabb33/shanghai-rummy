<script setup>
import { computed } from 'vue'

const props = defineProps({
  game: Object,
  playerId: String,
})
const emit = defineEmits(['leave'])

const standings = computed(() => {
  return props.game.playerOrder
    .map(pid => ({
      pid,
      name: props.game.players[pid].name,
      total: props.game.scores[pid].reduce((s, n) => s + n, 0),
      rounds: props.game.scores[pid],
      isYou: pid === props.playerId,
    }))
    .sort((a, b) => a.total - b.total)
})

const winner = computed(() => standings.value[0])
</script>

<template>
  <div class="game-over">
    <div class="card">
      <div class="trophy">🏆</div>
      <h1 class="winner-name">{{ winner.name }} wins!</h1>
      <p class="subtitle">Final Scores — lowest wins</p>

      <div class="standings">
        <div
          v-for="(player, i) in standings"
          :key="player.pid"
          class="standing-row"
          :class="{ winner: i === 0, you: player.isYou }"
        >
          <span class="rank-num">{{ i + 1 }}</span>
          <span class="player-name">
            {{ player.name }}
            <span v-if="player.isYou" class="you-tag">you</span>
          </span>
          <span class="total">{{ player.total }} pts</span>
        </div>
      </div>

      <details class="round-breakdown">
        <summary>Round breakdown</summary>
        <table>
          <thead>
            <tr>
              <th>Round</th>
              <th v-for="p in standings" :key="p.pid">{{ p.name }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(_, ri) in standings[0].rounds" :key="ri">
              <td>{{ ri + 1 }}</td>
              <td v-for="p in standings" :key="p.pid">{{ p.rounds[ri] }}</td>
            </tr>
          </tbody>
        </table>
      </details>

      <button class="btn-leave" @click="emit('leave')">Back to Lobby</button>
    </div>
  </div>
</template>

<style scoped>
.game-over {
  min-height: 100vh;
  background: #f5efe6;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  font-family: 'DM Sans', sans-serif;
}

.card {
  background: #fff;
  border-radius: 16px;
  padding: 36px 32px;
  max-width: 440px;
  width: 100%;
  box-shadow: 0 12px 40px rgba(0,0,0,0.12);
  text-align: center;
}

.trophy { font-size: 3rem; margin-bottom: 8px; }

.winner-name {
  font-family: 'DM Serif Display', serif;
  font-size: 2rem;
  color: #1a1a2e;
  margin: 0 0 4px;
}

.subtitle {
  font-size: 0.85rem;
  color: #aaa;
  margin: 0 0 24px;
}

.standings {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
}

.standing-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 8px;
  background: #faf8f5;
  border: 1.5px solid #f0ebe3;
}

.standing-row.winner {
  background: #fffdf0;
  border-color: #e8c26a;
}

.standing-row.you { border-color: #c8d8f0; }

.rank-num {
  font-size: 0.9rem;
  font-weight: 700;
  color: #bbb;
  width: 20px;
  text-align: center;
}

.standing-row.winner .rank-num { color: #e8c26a; }

.player-name {
  flex: 1;
  font-weight: 600;
  color: #1a1a2e;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 6px;
}

.you-tag {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: #e8f0fe;
  color: #3355aa;
  padding: 2px 6px;
  border-radius: 4px;
}

.total {
  font-weight: 700;
  color: #1a1a2e;
}

.btn-leave {
  width: 100%;
  padding: 12px;
  margin-bottom: 20px;
  background: #1a1a2e;
  color: #e8c26a;
  border: none;
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-leave:hover { background: #2d2d50; }

.round-breakdown {
  text-align: left;
  font-size: 0.85rem;
  color: #888;
}

.round-breakdown summary {
  cursor: pointer;
  font-weight: 600;
  color: #999;
  margin-bottom: 10px;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
}

th, td {
  padding: 5px 8px;
  text-align: center;
  border-bottom: 1px solid #f0ebe3;
}

th { color: #aaa; font-weight: 600; }
td:first-child { color: #bbb; }
</style>
