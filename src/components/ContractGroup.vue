<script setup>
import CardTile from './CardTile.vue'

defineProps({
  groupDef: Object,   // { type, size }
  cards: Array,       // card objects assigned so far
  isActive: Boolean,
  isValid: Boolean,
})
const emit = defineEmits(['activate', 'remove'])
</script>

<template>
  <div
    class="contract-group"
    :class="{ active: isActive, valid: isValid }"
    @click="emit('activate')"
  >
    <div class="group-header">
      <span class="group-type">{{ groupDef.type === 'set' ? 'Set' : 'Run' }} of {{ groupDef.size }}</span>
      <span v-if="isValid" class="status valid-icon">✓</span>
      <span v-else class="status pending">{{ cards.length }}/{{ groupDef.size }}</span>
    </div>

    <div class="slots">
      <template v-for="i in groupDef.size" :key="i">
        <div v-if="cards[i - 1]" class="filled-slot" @click.stop="emit('remove', i - 1)">
          <CardTile :card="cards[i - 1]" :interactive="false" small />
          <span class="remove-hint">×</span>
        </div>
        <div v-else class="empty-slot" />
      </template>
    </div>
  </div>
</template>

<style scoped>
.contract-group {
  border: 2px solid #e5e0d8;
  border-radius: 10px;
  padding: 10px 12px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  background: #faf8f5;
}

.contract-group.active {
  border-color: #1a1a2e;
  background: #fff;
}

.contract-group.valid {
  border-color: #22c55e;
  background: #f0fdf4;
}

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  font-family: 'DM Sans', sans-serif;
}

.group-type {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #555;
}

.status { font-size: 0.8rem; font-weight: 600; }
.valid-icon { color: #22c55e; }
.pending { color: #aaa; }

.slots {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.filled-slot {
  position: relative;
  cursor: pointer;
}

.remove-hint {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 16px;
  height: 16px;
  background: #1a1a2e;
  color: #fff;
  border-radius: 50%;
  font-size: 0.65rem;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.15s;
}

.filled-slot:hover .remove-hint { opacity: 1; }

.empty-slot {
  width: 42px;
  height: 60px;
  border: 1.5px dashed #d1ccc4;
  border-radius: 6px;
  background: #f0ebe3;
}
</style>
