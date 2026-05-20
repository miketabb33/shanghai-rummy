<script setup>
import { ref } from 'vue'
import HowToPlayModal from '../components/HowToPlayModal.vue'

const props = defineProps({
  gameId: String,
  playerId: String,
  game: Object,
  joinError: String,
})

const emit = defineEmits(['create', 'join', 'start', 'cancel'])

const playerName = ref('')
const roomCode = ref('')
const mode = ref(null)
const showHowToPlay = ref(false)

function submitCreate() {
  if (playerName.value.trim()) emit('create', playerName.value.trim())
}

function submitJoin() {
  if (playerName.value.trim() && roomCode.value.trim()) {
    emit('join', roomCode.value.trim().toUpperCase(), playerName.value.trim())
  }
}

const isHost = () => props.game?.hostId === props.playerId
</script>

<template>
  <div class="page">
    <div class="suit-bg" aria-hidden="true">
      <span>♠</span><span>♥</span><span>♦</span><span>♣</span>
      <span>♥</span><span>♠</span><span>♣</span><span>♦</span>
      <span>♦</span><span>♣</span><span>♠</span><span>♥</span>
    </div>

    <div class="panel">
      <div class="panel-inner">

        <header>
          <div class="pip red">♥</div>
          <h1>Shanghai<br><em>Rummy</em></h1>
          <div class="pip">♠</div>
          <button class="how-btn" @click="showHowToPlay = true">?</button>
        </header>

        <!-- Home screen -->
        <template v-if="!gameId">
          <div v-if="!mode" class="content fade-in">
            <p class="tagline">Gather the table. Deal the cards.</p>
            <div class="btn-group">
              <button class="btn-primary" @click="mode = 'create'">Create Game</button>
              <button class="btn-secondary" @click="mode = 'join'">Join Game</button>
            </div>
          </div>

          <form v-else-if="mode === 'create'" class="content fade-in" @submit.prevent="submitCreate">
            <label class="field">
              <span class="label">Your name</span>
              <input v-model="playerName" placeholder="Enter your name" autofocus />
            </label>
            <div class="btn-group">
              <button class="btn-primary" type="submit">Create Table</button>
              <button class="btn-ghost" type="button" @click="mode = null">Back</button>
            </div>
          </form>

          <form v-else-if="mode === 'join'" class="content fade-in" @submit.prevent="submitJoin">
            <label class="field">
              <span class="label">Your name</span>
              <input v-model="playerName" placeholder="Enter your name" autofocus />
            </label>
            <label class="field">
              <span class="label">Room code</span>
              <input v-model="roomCode" placeholder="e.g. K8X2F" class="mono" maxlength="5" />
            </label>
            <div v-if="joinError" class="join-error">{{ joinError }}</div>
            <div class="btn-group">
              <button class="btn-primary" type="submit">Join Table</button>
              <button class="btn-ghost" type="button" @click="mode = null">Back</button>
            </div>
          </form>
        </template>

        <!-- Waiting room -->
        <template v-else-if="game?.status === 'lobby'">
          <div class="content fade-in">
            <div class="code-block">
              <div class="code-label">Room Code</div>
              <div class="code-value">{{ gameId }}</div>
            </div>

            <div class="player-list">
              <div
                v-for="pid in game.playerOrder"
                :key="pid"
                class="player"
                :class="{ you: pid === playerId }"
              >
                <span class="avatar">{{ game.players[pid].name[0].toUpperCase() }}</span>
                <span class="name">{{ game.players[pid].name }}</span>
                <span v-if="pid === game.hostId" class="badge host">host</span>
                <span v-if="pid === playerId" class="badge you">you</span>
              </div>
            </div>

            <div class="btn-group">
              <button
                v-if="isHost() && game.playerOrder.length >= 2"
                class="btn-primary"
                @click="emit('start')"
              >
                Start Game
              </button>
              <p v-else-if="isHost()" class="waiting">Waiting for more players…</p>
              <p v-else class="waiting">Waiting for host to start…</p>

              <button class="btn-ghost danger" @click="emit('cancel')">
                {{ isHost() ? 'Cancel Game' : 'Leave Game' }}
              </button>
            </div>
          </div>
        </template>

      </div>
    </div>

    <!-- How to Play modal -->
    <Transition name="fade">
      <HowToPlayModal v-if="showHowToPlay" @close="showHowToPlay = false" />
    </Transition>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600&display=swap');

.page {
  min-height: 100vh;
  background: #f5efe6;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  font-family: 'DM Sans', sans-serif;
}

.suit-bg {
  position: fixed;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(3, 1fr);
  pointer-events: none;
  user-select: none;
}

.suit-bg span {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(60px, 10vw, 120px);
  color: #e8ddd0;
  opacity: 0.5;
}

.suit-bg span:nth-child(even) {
  color: #d4b8a8;
  opacity: 0.35;
}

.panel {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  margin: 24px;
}

.panel-inner {
  background: #fff;
  border-radius: 16px;
  box-shadow:
    0 2px 4px rgba(0,0,0,0.04),
    0 12px 40px rgba(0,0,0,0.12),
    0 0 0 1px rgba(0,0,0,0.04);
  overflow: hidden;
}

header {
  background: #1a1a2e;
  padding: 36px 32px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  position: relative;
}

.pip {
  font-size: 28px;
  color: #4a4a7a;
  opacity: 0.6;
  line-height: 1;
  flex-shrink: 0;
}

.pip.red { color: #c0392b; opacity: 0.7; }

h1 {
  font-family: 'DM Serif Display', serif;
  font-size: 2.1rem;
  color: #fff;
  margin: 0;
  line-height: 1.1;
  text-align: center;
  letter-spacing: -0.01em;
  flex: 1;
}

h1 em {
  font-style: italic;
  color: #e8c26a;
}

.content {
  padding: 28px 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.fade-in {
  animation: fadeIn 0.25s ease both;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.tagline {
  margin: 0;
  color: #888;
  font-size: 0.95rem;
  text-align: center;
  font-style: italic;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #999;
}

input {
  padding: 11px 14px;
  font-size: 1rem;
  font-family: 'DM Sans', sans-serif;
  border: 1.5px solid #e5e5e5;
  border-radius: 8px;
  outline: none;
  color: #1a1a2e;
  background: #fafafa;
  transition: border-color 0.15s;
}

input:focus {
  border-color: #1a1a2e;
  background: #fff;
}

input::placeholder { color: #bbb; }
input.mono { letter-spacing: 0.2em; font-weight: 600; font-size: 1.1rem; }

.btn-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn-primary {
  padding: 13px;
  background: #1a1a2e;
  color: #fff;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
}
.btn-primary:hover  { background: #2d2d50; }
.btn-primary:active { transform: scale(0.98); }

.btn-secondary {
  padding: 13px;
  background: #f0ebe3;
  color: #1a1a2e;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-secondary:hover { background: #e5dfd6; }

.btn-ghost {
  padding: 11px;
  background: transparent;
  color: #999;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  border: 1.5px solid #e5e5e5;
  border-radius: 8px;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}
.btn-ghost:hover { color: #555; border-color: #bbb; }
.btn-ghost.danger { color: #c0392b; border-color: transparent; }
.btn-ghost.danger:hover { background: #fdf0ee; border-color: #f0b8b0; }

.code-block {
  background: #1a1a2e;
  border-radius: 10px;
  padding: 18px 20px;
  text-align: center;
}

.code-label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #7070a0;
  margin-bottom: 6px;
}

.code-value {
  font-family: 'DM Serif Display', serif;
  font-size: 2.2rem;
  letter-spacing: 0.25em;
  color: #e8c26a;
}

.player-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.player {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #fafafa;
  border-radius: 8px;
  border: 1.5px solid #f0f0f0;
  transition: border-color 0.15s;
}

.player.you {
  border-color: #c8d8f0;
  background: #f4f8ff;
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
  font-size: 1rem;
  flex-shrink: 0;
}

.name {
  flex: 1;
  font-weight: 500;
  color: #1a1a2e;
  font-size: 0.95rem;
}

.badge {
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 4px;
}

.badge.host { background: #fef3cd; color: #8a6800; }
.badge.you  { background: #e8f0fe; color: #3355aa; }

.waiting {
  margin: 0;
  text-align: center;
  color: #aaa;
  font-size: 0.9rem;
  font-style: italic;
  padding: 6px 0;
}

.join-error {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.82rem;
  color: #c0392b;
  background: #fdf0ee;
  border: 1px solid #f0b8b0;
  border-radius: 8px;
  padding: 8px 12px;
  text-align: center;
}

/* How to play button */
.how-btn {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1.5px solid #ddd;
  background: transparent;
  color: #aaa;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}
.how-btn:hover { border-color: #1a1a2e; color: #1a1a2e; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
