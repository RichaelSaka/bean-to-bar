<script lang="ts">
  import { onMount } from "svelte";
  import { fade, scale } from "svelte/transition";
  import { elasticOut } from "svelte/easing";

  // Game state
  let userGuess = $state(0);
  let hasRevealed = $state(false);
  let isAnimating = $state(false);

  // The correct answer: ~10 pounds per year
  const CORRECT_ANSWER = 10;
  const MAX_GUESS = 20;

  // Calculate how close the guess is
  let guessDifference = $derived(Math.abs(userGuess - CORRECT_ANSWER));

  // Feedback messages
  let feedbackMessage = $derived.by(() => {
    if (!hasRevealed) return "";
    if (guessDifference === 0) return "Spot on! You nailed it!";
    if (guessDifference <= 2) return "So close! Great guess!";
    if (userGuess < CORRECT_ANSWER) return "Americans eat even more chocolate than you thought!";
    return "That's a lot of chocolate!";
  });

  function addPod() {
    if (hasRevealed || userGuess >= MAX_GUESS) return;
    isAnimating = true;
    userGuess++;
    setTimeout(() => isAnimating = false, 300);
  }

  function removePod() {
    if (hasRevealed || userGuess <= 0) return;
    userGuess--;
  }

  function revealAnswer() {
    if (userGuess === 0) return;
    hasRevealed = true;
  }

  function resetGame() {
    hasRevealed = false;
    userGuess = 0;
  }
</script>

<section class="guess-game">
  <div class="game-container">
    <!-- Left side: Question and interaction -->
    <div class="game-left">
      <h2 class="game-title">How Much Chocolate?</h2>
      <p class="game-question">
        How many pounds of chocolate do you think the average American eats per year?
      </p>

      <div class="interaction-area">
        <button
          class="pod-button"
          class:disabled={hasRevealed || userGuess >= MAX_GUESS}
          onclick={addPod}
          disabled={hasRevealed || userGuess >= MAX_GUESS}
        >
          <img
            src="/assets/cocoapod.png"
            alt="Cocoa pod"
            class="pod-image"
            class:bounce={isAnimating}
          />
        </button>

        <p class="click-instruction">Click to add pounds</p>

        {#if userGuess > 0 && !hasRevealed}
          <button class="remove-btn" onclick={removePod}>
            Remove
          </button>
        {/if}
      </div>
    </div>

    <!-- Right side: Visualization -->
    <div class="game-right">
      <div class="guess-visual">
        <!-- Cocoa pods grid -->
        <div class="pods-grid">
          {#each Array(userGuess) as _, i (i)}
            <div
              class="pod-item"
              in:scale={{ duration: 300, easing: elasticOut, start: 0.3 }}
            >
              <img src="/assets/cocoapod.png" alt="" />
            </div>
          {/each}
        </div>

        <!-- Number display -->
        <div class="guess-number-display">
          <span class="big-number">{userGuess}</span>
          <span class="unit">lbs</span>
        </div>
      </div>

      <!-- Action area -->
      <div class="action-area">
        {#if !hasRevealed}
          <button
            class="reveal-btn"
            onclick={revealAnswer}
            disabled={userGuess === 0}
            class:disabled={userGuess === 0}
          >
            Reveal Answer
          </button>
        {:else}
          <div class="result-card" in:fade={{ duration: 400 }}>
            <p class="result-answer">
              The average American eats <span class="highlight">{CORRECT_ANSWER} pounds</span> of chocolate per year.
            </p>
            <p class="result-feedback">{feedbackMessage}</p>
            <p class="result-context">
              That's roughly 120 chocolate bars annually.
            </p>
            <button class="try-again-btn" onclick={resetGame}>
              Try Again
            </button>
          </div>
        {/if}
      </div>
    </div>
  </div>
</section>

<style>
  .guess-game {
    background: #1a1a1a;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
  }

  .game-container {
    max-width: 1000px;
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    align-items: center;
  }

  /* Left side */
  .game-left {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .game-title {
    font-family: "gopher", Georgia, serif;
    font-size: 2.5rem;
    font-weight: 700;
    color: #fffaf0;
    margin: 0;
    line-height: 1.2;
  }

  .game-question {
    font-family: "Courier New", Courier, monospace;
    font-size: 1.1rem;
    color: rgba(255, 250, 240, 0.8);
    line-height: 1.6;
    margin: 0;
  }

  .interaction-area {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    margin-top: 1rem;
  }

  .pod-button {
    background: transparent;
    border: 2px dashed rgba(255, 250, 240, 0.3);
    border-radius: 12px;
    padding: 1.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .pod-button:hover:not(.disabled) {
    border-color: tomato;
    background: rgba(255, 99, 71, 0.1);
  }

  .pod-button.disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .pod-image {
    width: 100px;
    height: auto;
    display: block;
    transition: transform 0.2s ease;
  }

  .pod-image.bounce {
    animation: pod-bounce 0.3s ease;
  }

  @keyframes pod-bounce {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }

  .click-instruction {
    font-family: "Courier New", Courier, monospace;
    font-size: 0.9rem;
    color: rgba(255, 250, 240, 0.5);
    margin: 0;
    font-style: italic;
  }

  .remove-btn {
    background: transparent;
    border: 1px solid rgba(255, 250, 240, 0.3);
    color: rgba(255, 250, 240, 0.6);
    font-family: "Courier New", Courier, monospace;
    font-size: 0.85rem;
    padding: 0.4rem 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .remove-btn:hover {
    border-color: rgba(255, 250, 240, 0.5);
    color: rgba(255, 250, 240, 0.8);
  }

  /* Right side */
  .game-right {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .guess-visual {
    background: #fffaf0;
    border-radius: 8px;
    padding: 2rem;
    min-height: 280px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .pods-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
    max-width: 280px;
    min-height: 100px;
  }

  .pod-item {
    width: 40px;
    height: 40px;
  }

  .pod-item img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .guess-number-display {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    margin-top: 1.5rem;
  }

  .big-number {
    font-family: "gopher", Georgia, serif;
    font-size: 4rem;
    font-weight: 700;
    color: #1a1a1a;
    line-height: 1;
  }

  .unit {
    font-family: "Courier New", Courier, monospace;
    font-size: 1.2rem;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  /* Action area */
  .action-area {
    text-align: center;
  }

  .reveal-btn {
    background: tomato;
    border: none;
    color: #fffaf0;
    font-family: "Courier New", Courier, monospace;
    font-size: 1rem;
    font-weight: 600;
    padding: 0.9rem 2.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .reveal-btn:hover:not(.disabled) {
    background: #ff5533;
    transform: translateY(-2px);
  }

  .reveal-btn.disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  /* Results */
  .result-card {
    background: #fffaf0;
    padding: 2rem;
    border-radius: 8px;
    text-align: center;
  }

  .result-answer {
    font-family: "Courier New", Courier, monospace;
    font-size: 1.1rem;
    color: #1a1a1a;
    line-height: 1.6;
    margin: 0 0 1rem 0;
  }

  .result-answer .highlight {
    color: tomato;
    font-weight: 700;
  }

  .result-feedback {
    font-family: "gopher", Georgia, serif;
    font-size: 1.3rem;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 0.75rem 0;
  }

  .result-context {
    font-family: "Courier New", Courier, monospace;
    font-size: 0.9rem;
    color: #666;
    margin: 0 0 1.5rem 0;
    font-style: italic;
  }

  .try-again-btn {
    background: transparent;
    border: 2px solid #1a1a1a;
    color: #1a1a1a;
    font-family: "Courier New", Courier, monospace;
    font-size: 0.9rem;
    padding: 0.6rem 1.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .try-again-btn:hover {
    background: #1a1a1a;
    color: #fffaf0;
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .game-container {
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    .game-title {
      font-size: 2rem;
    }

    .guess-visual {
      min-height: 220px;
      padding: 1.5rem;
    }

    .big-number {
      font-size: 3rem;
    }

    .pods-grid {
      max-width: 220px;
    }

    .pod-item {
      width: 32px;
      height: 32px;
    }
  }
</style>
