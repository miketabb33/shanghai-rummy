<script setup>
import { computed } from 'vue'
import CardTile from './CardTile.vue'

const props = defineProps({
  game: Object,
})

const meldRows = computed(() =>
  props.game.playerOrder
    .filter(pid => props.game.melds[pid]?.length)
    .map(pid => ({
      pid,
      name: props.game.players[pid].name,
      groups: props.game.melds[pid],
    }))
)
</script>

<template>
  <div v-if="meldRows.length" class="meld-display">
    <div v-for="row in meldRows" :key="row.pid" class="meld-row">
      <span class="player-label">{{ row.name }}</span>
      <div class="groups">
        <div v-for="(group, gi) in row.groups" :key="gi" class="meld-group">
          <CardTile
            v-for="(card, ci) in group"
            :key="ci"
            :card="card"
            :interactive="false"
            small
          />
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
  gap: 3px;
  padding: 4px;
  background: #fff;
  border: 1px solid #e5e0d8;
  border-radius: 6px;
}
</style>
