<script setup>
import { ref, computed } from 'vue'
import { useGame } from '../composables/useGame'
import { getRound } from '../composables/useRounds'
import GameHeader from '../components/GameHeader.vue'
import DrawArea from '../components/DrawArea.vue'
import PlayerHand from '../components/PlayerHand.vue'
import OpponentList from '../components/OpponentList.vue'
import BuyWindow from '../components/BuyWindow.vue'

const props = defineProps({
  game: Object,
  gameId: String,
  playerId: String,
})

const { myHand, isMyTurn, activePlayerId, canBuy, drawFromDeck, takeTopDiscard, discardCard, buy, advanceTurn } =
  useGame(
    computed(() => props.game),
    computed(() => props.gameId),
    computed(() => props.playerId),
  )

const selectedIndex = ref(null)

const topDiscard = computed(() => {
  const d = props.game.discard
  return d.length ? d[d.length - 1] : null
})

const activePlayerName = computed(() => {
  const pid = activePlayerId.value
  return props.game.players[pid]?.name ?? ''
})

const roundDef = computed(() => getRound(props.game.round))

function handleDiscard(idx) {
  discardCard(idx)
  selectedIndex.value = null
}

function handleBuy() {
  buy()
}
</script>

<template>
  <div class="game-view">
    <GameHeader
      :round="game.round"
      :contractLabel="roundDef.label"
      :activePlayerName="activePlayerName"
      :isMyTurn="isMyTurn"
      :phase="game.phase"
    />

    <BuyWindow
      :buyWindow="game.buyWindow"
      :canBuy="canBuy"
      @buy="handleBuy"
      @advance="advanceTurn"
    />

    <div class="table">
      <OpponentList :game="game" :playerId="playerId" />

      <DrawArea
        :deckSize="game.deck.length"
        :topDiscard="topDiscard"
        :canDraw="isMyTurn && game.phase === 'draw'"
        :canTakeDiscard="isMyTurn && game.phase === 'draw' && !!topDiscard"
        @draw="drawFromDeck"
        @take-discard="takeTopDiscard"
      />
    </div>

    <PlayerHand
      :cards="myHand"
      :selectedIndex="selectedIndex"
      :phase="game.phase"
      :isMyTurn="isMyTurn"
      @select="selectedIndex = $event"
      @discard="handleDiscard"
    />
  </div>
</template>

<style scoped>
.game-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5efe6;
  font-family: 'DM Sans', sans-serif;
}

.table {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
}
</style>
