<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { BUY_WINDOW_MS } from '../composables/useGame'

const props = defineProps({
  buyWindow: Object,
  canBuy: Boolean,
  isBuyer: Boolean,
})
const emit = defineEmits(['buy', 'advance'])

const secondsLeft = ref(0)
let timer = null
let ticker = null

function clearTimers() {
  clearTimeout(timer)
  clearInterval(ticker)
}

watch(() => props.buyWindow, (bw) => {
  clearTimers()
  if (!bw?.openedAt) return

  const openedMs = bw.openedAt.toMillis?.() ?? Date.now()
  const elapsed = Date.now() - openedMs
  const remaining = Math.max(0, BUY_WINDOW_MS - elapsed)

  secondsLeft.value = Math.ceil(remaining / 1000)

  ticker = setInterval(() => {
    secondsLeft.value = Math.max(0, secondsLeft.value - 1)
  }, 1000)

  timer = setTimeout(() => {
    clearInterval(ticker)
    emit('advance')
  }, remaining)
}, { immediate: true })

onUnmounted(clearTimers)
</script>

<template>
  <Transition name="buy-slide">
    <div v-if="buyWindow || canBuy || isBuyer" class="buy-banner">
      <div class="buy-info">
        <span class="buy-title">{{ buyWindow ? 'Deciding…' : 'Buy opportunity' }}</span>
        <span v-if="buyWindow" class="buy-timer">{{ secondsLeft }}s</span>
      </div>
      <button v-if="canBuy" class="btn-buy" @click="emit('buy')">
        Buy
      </button>
      <span v-else-if="isBuyer" class="queued">Buying if drawn ✓</span>
    </div>
  </Transition>
</template>

<style scoped>
.buy-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  background: #1a1a2e;
  gap: 16px;
}

.buy-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.buy-title {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  color: #e8c26a;
}

.buy-timer {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  color: #888;
  min-width: 24px;
}

.btn-buy {
  padding: 7px 20px;
  background: #e8c26a;
  color: #1a1a2e;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-buy:hover { background: #d4a93c; }

.queued {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  color: #e8c26a;
}

.buy-slide-enter-active,
.buy-slide-leave-active { transition: all 0.25s ease; }
.buy-slide-enter-from   { opacity: 0; transform: translateY(-8px); }
.buy-slide-leave-to     { opacity: 0; transform: translateY(-8px); }
</style>
