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
import RoundEndOverlay from '../components/RoundEndOverlay.vue'
import ScoreBoard from '../components/ScoreBoard.vue'

const props = defineProps({
  game: Object,
  gameId: String,
  playerId: String,
})

const {
  myHand, newCardIndices, isMyTurn, activePlayerId, canBuy,
  drawFromDeck, takeTopDiscard, discardCard,
  buy, advanceTurn, layDownContract, layOff, endGame,
} = useGame(
  computed(() => props.game),
  computed(() => props.gameId),
  computed(() => props.playerId),
)

const selectedIndex = ref(null)
const showContractModal = ref(false)
const showScores = ref(false)
const confirmEndGame = ref(false)

const isHost = computed(() => props.game.hostId === props.playerId)

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
      :showScores="showScores"
      @toggle-scores="showScores = !showScores"
    />

    <BuyWindow
      :buyWindow="game.buyWindow"
      :canBuy="canBuy"
      :hasBought="game.players[playerId]?.hasBought ?? false"
      @buy="buy"
      @advance="advanceTurn"
    />

    <!-- Desktop: table + side scoreboard -->
    <div class="table-area">
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

      <!-- Non-mobile: floating side card -->
      <div class="side-scoreboard">
        <ScoreBoard :game="game" :playerId="playerId" />
      </div>
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

    <RoundEndOverlay
      v-if="game.phase === 'round_end'"
      :game="game"
      :gameId="gameId"
      :playerId="playerId"
    />

    <!-- Host: end game -->
    <Transition name="fade">
      <div v-if="confirmEndGame" class="end-backdrop" @click.self="confirmEndGame = false">
        <div class="end-dialog">
          <p>End the game for everyone?</p>
          <div class="end-actions">
            <button class="end-confirm" @click="endGame">End Game</button>
            <button class="end-cancel" @click="confirmEndGame = false">Cancel</button>
          </div>
        </div>
      </div>
    </Transition>

    <button v-if="isHost" class="end-game-btn" @click="confirmEndGame = true">End Game</button>

    <!-- Mobile only: bottom sheet -->
    <Transition name="fade">
      <div v-if="showScores" class="drawer-backdrop" @click="showScores = false" />
    </Transition>

    <Transition name="sheet">
      <div v-if="showScores" class="score-sheet">
        <div class="sheet-handle" @click="showScores = false" />
        <ScoreBoard :game="game" :playerId="playerId" />
      </div>
    </Transition>
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

.table-area {
  flex: 1;
  display: flex;
  position: relative;
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

/* Non-mobile (tablet + desktop): side card always visible */
.side-scoreboard {
  position: absolute;
  top: 50%;
  right: 16px;
  transform: translateY(-50%);
}

/* Mobile phones: hide side card */
@media (max-width: 612px) {
  .side-scoreboard { display: none; }
}

/* Non-mobile: hide sheet elements entirely */
.drawer-backdrop,
.score-sheet {
  display: none;
}

/* Mobile phones: show sheet */
@media (max-width: 612px) {
  .drawer-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(26, 26, 46, 0.4);
    z-index: 40;
  }

  .score-sheet {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 41;
    background: #f5efe6;
    border-radius: 20px 20px 0 0;
    padding: 12px 20px 32px;
    box-shadow: 0 -8px 32px rgba(0,0,0,0.18);
    flex-direction: column;
    align-items: stretch;
  }

  .sheet-handle {
    width: 40px;
    height: 4px;
    background: #d5cfc7;
    border-radius: 2px;
    margin: 0 auto 16px;
    cursor: pointer;
  }

  :deep(.score-sheet .scoreboard) {
    width: 100%;
    box-sizing: border-box;
    border: none;
    background: transparent;
    padding: 0;
  }
}

.end-game-btn {
  position: fixed;
  bottom: 16px;
  left: 16px;
  padding: 7px 14px;
  background: transparent;
  border: 1.5px solid rgba(192, 57, 43, 0.35);
  border-radius: 10px;
  color: rgba(192, 57, 43, 0.6);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  z-index: 30;
  transition: all 0.15s;
}
.end-game-btn:hover {
  border-color: #c0392b;
  color: #c0392b;
  background: #fdf0ee;
}

.end-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(26,26,46,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 110;
}

.end-dialog {
  background: #fff;
  border-radius: 14px;
  padding: 28px 28px 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: min(320px, 90vw);
  box-shadow: 0 16px 48px rgba(0,0,0,0.2);
}

.end-dialog p {
  font-family: 'DM Serif Display', serif;
  font-size: 1.15rem;
  color: #1a1a2e;
  margin: 0;
  text-align: center;
}

.end-actions {
  display: flex;
  gap: 10px;
}

.end-confirm {
  flex: 1;
  padding: 10px;
  background: #c0392b;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}
.end-confirm:hover { background: #a93226; }

.end-cancel {
  flex: 1;
  padding: 10px;
  background: #f5efe6;
  color: #555;
  border: none;
  border-radius: 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}
.end-cancel:hover { background: #ede8e0; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }

.sheet-enter-active, .sheet-leave-active { transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1); }
.sheet-enter-from, .sheet-leave-to       { transform: translateY(100%); }
</style>
