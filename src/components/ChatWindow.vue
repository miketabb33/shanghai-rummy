<script setup>
import { ref, watch, nextTick, computed } from 'vue'

const props = defineProps({
  messages: { type: Array, default: () => [] },
  playerId: String,
  players: Object,
})
const emit = defineEmits(['send'])

const open = ref(false)
const text = ref('')
const listEl = ref(null)
const unread = ref(0)

function submit() {
  const t = text.value.trim()
  if (!t) return
  emit('send', t)
  text.value = ''
}

function toggle() {
  open.value = !open.value
  if (open.value) unread.value = 0
}

watch(() => props.messages.length, async () => {
  if (!open.value) {
    unread.value++
  } else {
    await nextTick()
    listEl.value?.scrollTo({ top: listEl.value.scrollHeight, behavior: 'smooth' })
  }
})

watch(open, async (val) => {
  if (val) {
    unread.value = 0
    await nextTick()
    listEl.value?.scrollTo({ top: listEl.value.scrollHeight })
  }
})

const sorted = computed(() => [...props.messages].sort((a, b) => a.at - b.at))
</script>

<template>
  <div class="chat" :class="{ open }">
    <button class="chat-header" :class="{ 'has-unread': !open && unread > 0 }" @click="toggle">
      <span class="chat-title">Chat</span>
      <span v-if="!open && unread > 0" class="unread-badge">{{ unread }}</span>
      <span class="chevron">{{ open ? '▾' : '▴' }}</span>
    </button>

    <Transition name="chat-slide">
      <div v-if="open" class="chat-body">
        <div class="message-list" ref="listEl">
          <div
            v-for="(msg, i) in sorted"
            :key="i"
            class="message"
            :class="{ mine: msg.pid === playerId }"
          >
            <span v-if="msg.pid !== playerId" class="msg-name">{{ msg.name }}</span>
            <span class="msg-text">{{ msg.text }}</span>
          </div>
          <div v-if="sorted.length === 0" class="empty">No messages yet</div>
        </div>

        <form class="chat-input" @submit.prevent="submit">
          <input
            v-model="text"
            placeholder="Say something…"
            maxlength="200"
            autocomplete="off"
          />
          <button type="submit">↑</button>
        </form>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.chat {
  position: fixed;
  bottom: 0;
  left: 16px;
  width: 260px;
  z-index: 35;
  display: flex;
  flex-direction: column;
  border-radius: 12px 12px 0 0;
  overflow: hidden;
  box-shadow: 0 -4px 24px rgba(0,0,0,0.15);
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #1a1a2e;
  border: none;
  cursor: pointer;
  width: 100%;
  text-align: left;
}

.chat-title {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  color: #e8c26a;
  flex: 1;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.unread-badge {
  background: #e8c26a;
  color: #1a1a2e;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.65rem;
  font-weight: 800;
  border-radius: 10px;
  padding: 1px 6px;
  min-width: 18px;
  text-align: center;
  animation: badge-pulse 2s ease-in-out infinite;
}

@keyframes badge-pulse {
  0%, 100% { transform: scale(1); box-shadow: none; }
  50% { transform: scale(1.18); box-shadow: 0 0 8px rgba(232, 194, 106, 0.7); }
}

.chat-header.has-unread {
  box-shadow: inset 0 -2px 0 #e8c26a;
}

.chevron {
  font-size: 0.7rem;
  color: #666;
}

.chat-body {
  background: #f5efe6;
  display: flex;
  flex-direction: column;
  border: 1.5px solid #e5e0d8;
  border-top: none;
  border-radius: 0 0 0 0;
}

.message-list {
  height: 200px;
  overflow-y: auto;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.empty {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.75rem;
  color: #bbb;
  font-style: italic;
  text-align: center;
  margin-top: 60px;
}

.message {
  display: flex;
  flex-direction: column;
  gap: 1px;
  align-items: flex-start;
  max-width: 90%;
}

.message.mine {
  align-self: flex-end;
  align-items: flex-end;
}

.msg-name {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.62rem;
  font-weight: 700;
  color: #aaa;
  letter-spacing: 0.03em;
}

.msg-text {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.82rem;
  color: #1a1a2e;
  background: #fff;
  border-radius: 10px 10px 10px 2px;
  padding: 6px 10px;
  line-height: 1.4;
  word-break: break-word;
  border: 1px solid #e5e0d8;
}

.message.mine .msg-text {
  background: #1a1a2e;
  color: #f5efe6;
  border-radius: 10px 10px 2px 10px;
  border-color: #1a1a2e;
}

.chat-input {
  display: flex;
  border-top: 1.5px solid #e5e0d8;
  background: #fff;
}

.chat-input input {
  flex: 1;
  border: none;
  outline: none;
  padding: 10px 12px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.82rem;
  background: transparent;
  color: #1a1a2e;
}

.chat-input input::placeholder { color: #bbb; }

.chat-input button {
  padding: 0 14px;
  background: #1a1a2e;
  color: #e8c26a;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  font-weight: 700;
  transition: background 0.15s;
}
.chat-input button:hover { background: #2d2d50; }

.chat-slide-enter-active,
.chat-slide-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.chat-slide-enter-from,
.chat-slide-leave-to { opacity: 0; transform: translateY(8px); }
</style>
