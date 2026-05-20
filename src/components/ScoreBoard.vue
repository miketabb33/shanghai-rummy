<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  game: Object,
  playerId: String,
})

const historyOpen = ref(false)

const rows = computed(() => {
  const sorted = [...props.game.playerOrder]
    .map(pid => ({
      pid,
      name: props.game.players[pid]?.name ?? pid,
      total: (props.game.scores[pid] ?? []).reduce((s, n) => s + n, 0),
      roundScores: props.game.scores[pid] ?? [],
    }))
    .sort((a, b) => a.total - b.total)
  return sorted
})

const activeId = computed(() =>
  props.game.playerOrder[props.game.activePlayerIndex]
)

const completedRounds = computed(() =>
  rows.value[0]?.roundScores.length ?? 0
)
</script>

<template>
  <div class="scoreboard">
    <div class="sb-header">
      <span class="sb-title">Scores</span>
      <span class="sb-subtitle">lowest wins</span>
    </div>

    <div class="sb-rows">
      <div
        v-for="(row, i) in rows"
        :key="row.pid"
        class="sb-row"
        :class="{
          active: row.pid === activeId,
          me: row.pid === playerId,
          leader: i === 0,
        }"
      >
        <span class="sb-rank">{{ i + 1 }}</span>
        <span class="sb-name">{{ row.name }}</span>
        <span class="sb-total">{{ row.total }}</span>
      </div>
    </div>

    <button
      v-if="completedRounds > 0"
      class="history-toggle"
      @click="historyOpen = !historyOpen"
    >
      Round history
      <span class="chevron" :class="{ open: historyOpen }">›</span>
    </button>

    <Transition name="expand">
      <div v-if="historyOpen && completedRounds > 0" class="sb-history">
        <div class="history-scroll">
          <table class="history-table">
            <thead>
              <tr>
                <th class="ht-name"></th>
                <th v-for="r in completedRounds" :key="r">R{{ r }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in rows"
                :key="row.pid"
                :class="{ me: row.pid === playerId }"
              >
                <td class="ht-name">{{ row.name }}</td>
                <td
                  v-for="(score, idx) in row.roundScores"
                  :key="idx"
                  :class="{ zero: score === 0 }"
                >{{ score }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.scoreboard {
  width: 175px;
  flex-shrink: 0;
  background: rgba(255,255,255,0.72);
  border: 1.5px solid #e5e0d8;
  border-radius: 12px;
  padding: 14px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sb-header {
  display: flex;
  align-items: baseline;
  gap: 7px;
}

.sb-title {
  font-family: 'DM Serif Display', serif;
  font-size: 1.05rem;
  color: #1a1a2e;
  line-height: 1;
}

.sb-subtitle {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #ccc;
}

.sb-rows {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sb-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 7px;
  border-radius: 7px;
  background: transparent;
}

.sb-row.active {
  background: rgba(232, 194, 106, 0.15);
}

.sb-rank {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.65rem;
  font-weight: 700;
  color: #ccc;
  width: 13px;
  text-align: center;
  flex-shrink: 0;
}

.sb-row.leader .sb-rank { color: #e8c26a; }

.sb-name {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.78rem;
  color: #444;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sb-row.me .sb-name { font-weight: 700; color: #1a1a2e; }

.sb-total {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.88rem;
  font-weight: 700;
  color: #1a1a2e;
  flex-shrink: 0;
}

.sb-row.leader .sb-total { color: #2e7d32; }

.history-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 5px 0 0;
  border: none;
  border-top: 1px solid #e5e0d8;
  background: none;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #aaa;
  transition: color 0.15s;
}
.history-toggle:hover { color: #666; }

.chevron {
  font-size: 0.9rem;
  display: inline-block;
  transition: transform 0.2s ease;
  transform: rotate(0deg);
}
.chevron.open { transform: rotate(90deg); }

.sb-history {
  overflow: hidden;
}

.history-scroll {
  overflow-x: auto;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.72rem;
}

.history-table thead th {
  color: #bbb;
  font-weight: 600;
  text-align: right;
  padding: 2px 3px;
  white-space: nowrap;
}

.history-table .ht-name {
  text-align: left;
  color: #555;
  padding-right: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 70px;
}

.history-table tbody tr.me .ht-name {
  font-weight: 700;
  color: #1a1a2e;
}

.history-table tbody td {
  text-align: right;
  padding: 3px 3px;
  color: #555;
}

.history-table tbody td.zero {
  color: #2e7d32;
  font-weight: 700;
}

.expand-enter-active,
.expand-leave-active { transition: opacity 0.2s ease; }
.expand-enter-from,
.expand-leave-to     { opacity: 0; }
</style>
