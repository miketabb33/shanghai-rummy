<script setup>
defineEmits(['close'])

const ROUNDS = [
  '2 sets of 3', '1 set of 3 + 1 run of 4', '2 runs of 4',
  '3 sets of 3', '2 sets of 3 + 1 run of 4', '1 set of 3 + 2 runs of 4',
  '3 runs of 4', '3 sets of 4', '2 sets of 4 + 1 run of 5',
  '1 set of 4 + 2 runs of 5', '3 runs of 5',
]
</script>

<template>
  <div class="htp-backdrop" @click.self="$emit('close')">
    <div class="htp-modal">
      <button class="htp-close" @click="$emit('close')">✕</button>
      <h2>How to Play</h2>
      <p class="htp-intro">Shanghai Rummy is played over <strong>11 rounds</strong>. Each round has a contract you must lay down before going out. <strong>Lowest score wins.</strong></p>

      <div class="htp-section">
        <div class="htp-label">On your turn</div>
        <ol>
          <li>Draw a card from the deck or take the top discard.</li>
          <li>Optionally lay down your contract or lay off on others' melds (contract must be laid first).</li>
          <li>Discard one card to end your turn.</li>
        </ol>
        <p style="padding-left:0; font-size:0.8rem; color:#888; margin-top:4px;">Drag cards in your hand to reorder them.</p>
      </div>

      <div class="htp-section">
        <div class="htp-label">Buying <span class="htp-label-note">(3+ players)</span></div>
        <p>After each discard, there is a <strong>brief window</strong> where non-next players can register a buy by tapping the discard card. The next player is blocked during this window, then chooses to take the discard (free) or draw from the deck. If they draw, the first player who registered a buy receives the discard plus a penalty card from the deck. You can buy any number of times per round.</p>
      </div>

      <div class="htp-section">
        <div class="htp-label">Contracts</div>
        <div class="htp-contracts">
          <div v-for="(r, i) in ROUNDS" :key="i" class="htp-round">
            <span class="htp-rnum">R{{ i + 1 }}</span>
            <span>{{ r }}</span>
          </div>
        </div>
      </div>

      <div class="htp-section">
        <div class="htp-label">Scoring</div>
        <p>Cards left in hand when someone goes out count against you. <strong>Jokers = 20 pts, Aces = 15, Face cards = 10, Numbers = face value.</strong></p>
      </div>

      <div class="htp-suits">
        <span class="red">♥</span><span>♠</span><span class="red">♦</span><span>♣</span>
        <span class="joker">★ Jokers are wild</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.htp-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(26,26,46,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 16px;
}

.htp-modal {
  background: #fff;
  border-radius: 16px;
  padding: 28px 24px;
  width: min(480px, 100%);
  max-height: 85vh;
  overflow-y: auto;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 24px 64px rgba(0,0,0,0.25);
}

.htp-close {
  position: absolute;
  top: 14px;
  right: 14px;
  background: none;
  border: none;
  font-size: 1rem;
  color: #aaa;
  cursor: pointer;
}
.htp-close:hover { color: #333; }

.htp-modal h2 {
  font-family: 'DM Serif Display', serif;
  font-size: 1.4rem;
  color: #1a1a2e;
  margin: 0;
}

.htp-intro { font-size: 0.88rem; color: #555; line-height: 1.6; margin: 0; }

.htp-section { display: flex; flex-direction: column; gap: 6px; }

.htp-label {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: #aaa;
}

.htp-label-note {
  font-weight: 500;
  letter-spacing: 0.04em;
  color: #c8c0b0;
}

.htp-section ol, .htp-section p {
  font-size: 0.85rem;
  color: #444;
  line-height: 1.6;
  margin: 0;
  padding-left: 18px;
}
.htp-section p { padding-left: 0; }

.htp-contracts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 12px;
}

.htp-round {
  display: flex;
  gap: 6px;
  font-size: 0.78rem;
  color: #444;
  align-items: baseline;
}

.htp-rnum {
  font-weight: 700;
  color: #e8c26a;
  font-size: 0.7rem;
  flex-shrink: 0;
  width: 22px;
}

.htp-suits {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  padding-top: 4px;
  border-top: 1px solid #f0ebe3;
}
.htp-suits .red { color: #c0392b; }
.htp-suits .joker {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: #888;
  text-transform: uppercase;
  margin-left: 4px;
}
</style>
