<script setup>
import { ref, computed } from 'vue'
import { useGame } from '../composables/useGame'
import { getRound } from '../composables/useRounds'
import GameHeader from '../components/GameHeader.vue'
import DrawArea from '../components/DrawArea.vue'
import PlayerHand from '../components/PlayerHand.vue'
import OpponentList from '../components/OpponentList.vue'
import BuyWindow from '../components/BuyWindow.vue'
import ContractModal from '../components/ContractModal.vue'
import MeldDisplay from '../components/MeldDisplay.vue'

const props = defineProps({
  game: Object,
  gameId: String,
  playerId: String,
})

const {
  myHand, newCardIndices, isMyTurn, activePlayerId, canBuy,
  drawFromDeck, takeTopDiscard, discardCard,
  buy, advanceTurn, layDownContract, layOff,
} = useGame(
  computed(() => props.game),
  computed(() => props.gameId),
  computed(() => props.playerId),
)

const selectedIndex = ref(null)
const showContractModal = ref(false)

const topDiscard = computed(() => {
  const d = props.game.discard
  return d.length ? d[d.length - 1] : null
})

const activePlayerName = computed(() =>
  props.game.players[activePlayerId.value]?.name ?? ''
)

const roundDef = computed(() => getRound(props.game.round))

const myContractLaid = computed(() =>
  props.game.players[props.playerId]?.contractLaid ?? false
)

const selectedCard = computed(() =>
  selectedIndex.value !== null ? myHand.value[selectedIndex.value] : null
)

const canAttemptLayOff = computed(() =>
  isMyTurn.value && props.game.phase === 'play' && myContractLaid.value
)

async function handleLayOff({ pid, groupIndex }) {
  await layOff(selectedIndex.value, pid, groupIndex)
  selectedIndex.value = null
}

function handleDiscard(idx) {
  discardCard(idx)
  selectedIndex.value = null
  newCardIndices.value = []
}

async function handleContractConfirm(groupIndices) {
  showContractModal.value = false
  await layDownContract(groupIndices)
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
      @buy="buy"
      @advance="advanceTurn"
    />

    <div class="table">
      <OpponentList :game="game" :playerId="playerId" />

      <MeldDisplay
        :game="game"
        :selectedCard="selectedCard"
        :canAttemptLayOff="canAttemptLayOff"
        @lay-off="handleLayOff"
      />

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
      :contractLaid="myContractLaid"
      :newCardIndices="newCardIndices"
      @select="(i) => { selectedIndex = i; newCardIndices.value = [] }"
      @discard="handleDiscard"
      @lay-contract="showContractModal = true"
    />

    <ContractModal
      v-if="showContractModal"
      :hand="myHand"
      :contractDef="roundDef"
      @confirm="handleContractConfirm"
      @close="showContractModal = false"
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
