<script setup>
import { useLobby } from './composables/useLobby'
import LobbyView from './views/LobbyView.vue'
import GameView from './views/GameView.vue'

const { gameId, playerId, game, createGame, joinGame, startGame, cancelGame } = useLobby()
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

  <GameView
    v-else-if="game.status === 'active'"
    :game="game"
    :gameId="gameId"
    :playerId="playerId"
  />
</template>
