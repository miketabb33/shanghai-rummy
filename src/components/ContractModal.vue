<script setup>
import { ref, computed } from 'vue'
import CardTile from './CardTile.vue'
import ContractGroup from './ContractGroup.vue'
import { isValidGroup, isValidContract, rankValue } from '../composables/useContractValidator'

const SUIT_ORDER = { S: 0, H: 1, D: 2, C: 3, JK: 4 }

const props = defineProps({
  hand: Array,
  contractDef: Object, // { label, groups: [{ type, size }] }
})
const emit = defineEmits(['confirm', 'close'])

// groupAssignments[i] = array of hand indices assigned to group i
const groupAssignments = ref(props.contractDef.groups.map(() => []))
const activeGroupIndex = ref(0)

const assignedIndices = computed(() => new Set(groupAssignments.value.flat()))

const sortedHand = computed(() =>
  props.hand
    .map((card, originalIndex) => ({ card, originalIndex }))
    .sort((a, b) => {
      const rankDiff = rankValue(b.card.rank) - rankValue(a.card.rank)
      if (rankDiff !== 0) return rankDiff
      return SUIT_ORDER[a.card.suit] - SUIT_ORDER[b.card.suit]
    })
)

const groupCards = computed(() =>
  groupAssignments.value.map(indices => indices.map(i => props.hand[i]))
)

const groupValidity = computed(() =>
  groupCards.value.map((cards, i) => isValidGroup(cards, props.contractDef.groups[i]))
)

const contractValid = computed(() => isValidContract(groupCards.value, props.contractDef))

function clickHandCard(idx) {
  if (assignedIndices.value.has(idx)) return

  const group = groupAssignments.value[activeGroupIndex.value]
  const groupDef = props.contractDef.groups[activeGroupIndex.value]
  if (group.length >= groupDef.size) return

  group.push(idx)

  // Auto-advance to next incomplete group
  if (group.length === groupDef.size) {
    const next = groupAssignments.value.findIndex(
      (g, i) => i !== activeGroupIndex.value && g.length < props.contractDef.groups[i].size
    )
    if (next !== -1) activeGroupIndex.value = next
  }
}

function removeFromGroup(groupIdx, pos) {
  groupAssignments.value[groupIdx].splice(pos, 1)
  activeGroupIndex.value = groupIdx
}

function confirm() {
  // Emit hand indices per group so GameView can do the Firestore update
  emit('confirm', groupAssignments.value.map(indices => [...indices]))
}
</script>

<template>
  <div class="overlay" @click.self="emit('close')">
    <div class="modal">
      <div class="modal-header">
        <div>
          <h2 class="title">Lay Down Contract</h2>
          <p class="subtitle">{{ contractDef.label }}</p>
        </div>
        <button class="close-btn" @click="emit('close')">✕</button>
      </div>

      <div class="groups-area">
        <ContractGroup
          v-for="(groupDef, i) in contractDef.groups"
          :key="i"
          :groupDef="groupDef"
          :cards="groupCards[i]"
          :isActive="activeGroupIndex === i"
          :isValid="groupValidity[i]"
          @activate="activeGroupIndex = i"
          @remove="removeFromGroup(i, $event)"
        />
      </div>

      <div class="hand-area">
        <p class="hand-hint">Click cards to assign to the active group</p>
        <div class="hand-cards">
          <div
            v-for="{ card, originalIndex } in sortedHand"
            :key="originalIndex"
            class="hand-card-wrap"
            :class="{ assigned: assignedIndices.has(originalIndex) }"
          >
            <CardTile
              :card="card"
              :interactive="!assignedIndices.has(originalIndex)"
              small
              @click="clickHandCard(originalIndex)"
            />
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-cancel" @click="emit('close')">Cancel</button>
        <button class="btn-confirm" :disabled="!contractValid" @click="confirm">
          Lay Down
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 16px;
}

.modal {
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 540px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px 20px 0;
}

.title {
  font-family: 'DM Serif Display', serif;
  font-size: 1.3rem;
  color: #1a1a2e;
  margin: 0 0 2px;
}

.subtitle {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  color: #888;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1rem;
  color: #aaa;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
}
.close-btn:hover { color: #555; }

.groups-area {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px 20px;
}

.hand-area {
  padding: 0 20px 16px;
  border-top: 1px solid #f0ebe3;
  padding-top: 14px;
}

.hand-hint {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.75rem;
  color: #aaa;
  margin: 0 0 10px;
  font-style: italic;
}

.hand-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.hand-card-wrap {
  transition: opacity 0.15s;
}

.hand-card-wrap.assigned {
  opacity: 0.25;
  pointer-events: none;
}

.modal-footer {
  display: flex;
  gap: 8px;
  padding: 0 20px 20px;
  justify-content: flex-end;
}

.btn-cancel {
  padding: 10px 20px;
  background: transparent;
  border: 1.5px solid #e5e5e5;
  border-radius: 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  color: #888;
  cursor: pointer;
}
.btn-cancel:hover { border-color: #bbb; color: #555; }

.btn-confirm {
  padding: 10px 24px;
  background: #1a1a2e;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-confirm:hover:not(:disabled) { background: #2d2d50; }
.btn-confirm:disabled { opacity: 0.35; cursor: not-allowed; }
</style>
