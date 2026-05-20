<script setup>
import { useLobby } from './composables/useLobby'
import LobbyView from './views/LobbyView.vue'

const { gameId, playerId, game, createGame, joinGame, startGame, cancelGame, cleanup } = useLobby()
</script>

<template>
  <LobbyView
    v-if="!game || game.status === 'lobby'"
    :gameId="gameId"
    :playerId="playerId"
    :game="game"
    @create="createGame"
    @join="joinGame"
    @start="startGame"
    @cancel="cancelGame"
  />
  <div v-else>
    <!-- GameView goes here next -->
    <pre>{{ JSON.stringify(game, null, 2) }}</pre>
  </div>
</template>
