<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { BUY_WINDOW_MS } from '../composables/useGame'

const props = defineProps({
  buyWindow: Object,
})
const emit = defineEmits(['advance'])

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
    <div v-if="buyWindow" class="buy-banner">
      <span class="buy-title">Deciding…</span>
      <span class="buy-timer">{{ secondsLeft }}s</span>
    </div>
  </Transition>
</template>

<style scoped>
.buy-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 8px 20px;
  background: #1a1a2e;
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

.buy-slide-enter-active,
.buy-slide-leave-active { transition: all 0.25s ease; }
.buy-slide-enter-from   { opacity: 0; transform: translateY(-8px); }
.buy-slide-leave-to     { opacity: 0; transform: translateY(-8px); }
</style>
