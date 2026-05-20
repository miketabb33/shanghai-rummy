<script setup>
import { computed } from 'vue'
import CardTile from './CardTile.vue'
import { canLayOffOnGroup } from '../composables/useContractValidator'

const props = defineProps({
  game: Object,
  selectedCard: { type: Object, default: null },
  canAttemptLayOff: { type: Boolean, default: false },
})
const emit = defineEmits(['lay-off'])

const meldRows = computed(() =>
  props.game.playerOrder
    .filter(pid => props.game.melds[pid]?.length)
    .map(pid => ({
      pid,
      name: props.game.players[pid].name,
      groups: props.game.melds[pid].map((group, groupIndex) => ({
        ...group,
        groupIndex,
        isTarget: props.selectedCard && props.canAttemptLayOff
          ? canLayOffOnGroup(props.selectedCard, group)
          : false,
      })),
    }))
)
</script>

<template>
  <div v-if="meldRows.length" class="meld-display">
    <div v-for="row in meldRows" :key="row.pid" class="meld-row">
      <span class="player-label">{{ row.name }}</span>
      <div class="groups">
        <div
          v-for="group in row.groups"
          :key="group.groupIndex"
          class="meld-group"
          :class="{ target: group.isTarget }"
          @click="group.isTarget && emit('lay-off', { pid: row.pid, groupIndex: group.groupIndex })"
        >
          <CardTile
            v-for="(card, ci) in group.cards"
            :key="ci"
            :card="card"
            :interactive="false"
            small
          />
          <div v-if="group.isTarget" class="add-hint">+</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.meld-display {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(255,255,255,0.5);
  border-radius: 10px;
}

.meld-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex-wrap: wrap;
}

.player-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #999;
  min-width: 60px;
  padding-top: 6px;
}

.groups {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.meld-group {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 4px;
  background: #fff;
  border: 1.5px solid #e5e0d8;
  border-radius: 6px;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.meld-group.target {
  border-color: #22c55e;
  box-shadow: 0 0 0 2px #bbf7d0;
  cursor: pointer;
}

.meld-group.target:hover {
  background: #f0fdf4;
}

.add-hint {
  width: 24px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: 700;
  color: #22c55e;
  flex-shrink: 0;
}
</style>
