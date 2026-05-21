import { ref, computed, watch, onUnmounted } from 'vue'

export function useTurnTimer(turnStartedAtRef) {
  const elapsed = ref(0)
  let interval = null

  function start(ts) {
    clearInterval(interval)
    if (!ts) { elapsed.value = 0; return }
    const startMs = ts.toMillis ? ts.toMillis() : ts.seconds * 1000
    const tick = () => { elapsed.value = Math.floor((Date.now() - startMs) / 1000) }
    tick()
    interval = setInterval(tick, 1000)
  }

  watch(turnStartedAtRef, start, { immediate: true })
  onUnmounted(() => clearInterval(interval))

  const formattedTime = computed(() => {
    const s = Math.max(0, elapsed.value)
    const m = Math.floor(s / 60)
    return `${m}:${String(s % 60).padStart(2, '0')}`
  })

  return { elapsed, formattedTime }
}
