<script setup>
import { ref } from 'vue'
import { useLobby } from './composables/useLobby'
import LobbyView from './views/LobbyView.vue'
import GameView from './views/GameView.vue'
import GameOverView from './views/GameOverView.vue'

const { gameId, playerId, game, createGame, joinGame, startGame, cancelGame, leaveGame } = useLobby()

const joinError = ref(null)

async function handleJoin(id, playerName) {
  joinError.value = null
  try {
    await joinGame(id, playerName)
  } catch (e) {
    joinError.value = e.message
  }
}
</script>

<template>
  <LobbyView
    v-if="!game || game.status === 'lobby'"
    :gameId="gameId"
    :playerId="playerId"
    :game="game"
    :joinError="joinError"
    @create="createGame"
    @join="handleJoin"
    @start="startGame"
    @cancel="cancelGame"
  />

  <GameView
    v-else-if="game.status === 'active'"
    :game="game"
    :gameId="gameId"
    :playerId="playerId"
  />

  <GameOverView
    v-else-if="game.status === 'finished'"
    :game="game"
    :playerId="playerId"
    @leave="leaveGame"
  />
</template>
