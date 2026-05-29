<script setup>
import { computed } from 'vue'
import { useTurnTimer } from '../composables/useTurnTimer'

const props = defineProps({
  game: Object,
  playerId: String,
  lastDrawSource: { type: String, default: null },
  layingContractPid: { type: String, default: null },
})

const turnStartedAt = computed(() => props.game.turnStartedAt ?? null)
const { formattedTime } = useTurnTimer(turnStartedAt)

const opponents = computed(() =>
  props.game.playerOrder
    .filter((pid) => pid !== props.playerId)
    .map((pid) => ({
      pid,
      name: props.game.players[pid].name,
      cardCount: props.game.hands[pid]?.length ?? 0,
      contractLaid: props.game.players[pid].contractLaid,
      hasBought: props.game.players[pid].hasBought,
      isActive: props.game.playerOrder[props.game.activePlayerIndex] === pid,
    }))
)
</script>

<template>
  <div class="opponent-list">
    <div
      v-for="op in opponents"
      :key="op.pid"
      class="opponent"
      :class="{ active: op.isActive }"
    >
      <span class="avatar">{{ op.name[0].toUpperCase() }}</span>
      <div class="info">
        <span class="name">{{ op.name }}</span>
        <div class="tags">
          <span v-if="op.isActive" class="tag turn">their turn</span>
          <span v-if="op.isActive && game.phase === 'play' && lastDrawSource" class="tag draw-source">
            {{ lastDrawSource === 'deck' ? 'drew deck' : 'took discard' }}
          </span>
          <span v-if="layingContractPid === op.pid && !op.contractLaid" class="tag laying">laying contract…</span>
          <span v-if="op.contractLaid" class="tag contract">contract laid</span>
          <span v-if="op.hasBought" class="tag bought">bought</span>
        </div>
      </div>
      <div class="right-col">
        <span class="card-count">{{ op.cardCount }} cards</span>
        <span v-if="op.isActive" class="turn-timer">{{ formattedTime }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.opponent-list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 16px;
  justify-content: center;
}

.opponent {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  background: #fff;
  border: 1.5px solid #eee;
  border-radius: 10px;
  min-width: 160px;
  transition: border-color 0.2s;
}

.opponent.active {
  border-color: #e8c26a;
  background: #fffdf5;
}

.avatar {
  width: 32px;
  height: 32px;
  background: #1a1a2e;
  color: #e8c26a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'DM Serif Display', serif;
  font-size: 0.95rem;
  flex-shrink: 0;
}

.info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
}

.name {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1a1a2e;
}

.tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.tag {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 4px;
}

.tag.turn        { background: #fef3cd; color: #8a6800; }
.tag.draw-source { background: #e0e7ff; color: #3730a3; }
.tag.laying      { background: #fdf4ff; color: #7e22ce; }
.tag.contract    { background: #d1fae5; color: #065f46; }
.tag.bought      { background: #fee2e2; color: #991b1b; }

.right-col {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.card-count {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.8rem;
  color: #aaa;
  white-space: nowrap;
}

.turn-timer {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.72rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: #c8952a;
  letter-spacing: 0.03em;
}
</style>
