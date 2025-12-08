<script lang="ts">
  import { onMount } from "svelte";
  import { fade, fly, scale } from "svelte/transition";
  import { cubicOut, elasticOut } from "svelte/easing";

  // Game state
  let userGuess = $state(0);
  let hasRevealed = $state(false);
  let isAnimating = $state(false);
  let mounted = $state(false);

  // The correct answer: ~10 pounds per year
  const CORRECT_ANSWER = 10;
  const MAX_GUESS = 20;

  // Calculate how close the guess is
  let guessDifference = $derived(Math.abs(userGuess - CORRECT_ANSWER));
  let guessAccuracy = $derived(
    userGuess === 0 ? "" :
    guessDifference === 0 ? "exact" :
    guessDifference <= 2 ? "close" :
    guessDifference <= 4 ? "warm" :
    "far"
  );

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

  // Generate bar segments for visualization
  let barSegments = $derived(
    Array.from({ length: MAX_GUESS }, (_, i) => ({
      index: i,
      filled: i < userGuess,
      isCorrect: i < CORRECT_ANSWER,
      isUserGuess: i < userGuess
    }))
  );

  onMount(() => {
    mounted = true;
  });
</script>

<section class="guess-game" aria-label="Chocolate consumption guessing game">
  <div class="game-container">
    <header class="game-header">
      <h2 class="game-title">How Much Chocolate?</h2>
      <p class="game-subtitle">
        How many pounds of chocolate do you think the average American eats per year?
      </p>
      <p class="game-instruction">
        Click the cocoa pod to add to your guess
      </p>
    </header>

    <div class="game-content">
      <!-- Clickable cocoa pod -->
      <div class="pod-area">
        <button
          class="pod-button"
          class:disabled={hasRevealed || userGuess >= MAX_GUESS}
          onclick={addPod}
          aria-label="Add one pound to your guess"
          disabled={hasRevealed || userGuess >= MAX_GUESS}
        >
          <img
            src="/assets/cocoapod.png"
            alt="Cocoa pod - click to add"
            class="pod-image"
            class:bounce={isAnimating}
          />
          {#if !hasRevealed && userGuess < MAX_GUESS}
            <span class="pod-hint">+1 lb</span>
          {/if}
        </button>

        {#if userGuess > 0 && !hasRevealed}
          <button
            class="remove-button"
            onclick={removePod}
            aria-label="Remove one pound from your guess"
          >
            -1 lb
          </button>
        {/if}
      </div>

      <!-- Bar chart visualization -->
      <div class="chart-area">
        <div class="chart-label-left">0 lbs</div>

        <div class="bar-container">
          <!-- Background bar showing scale -->
          <div class="bar-background">
            {#each barSegments as segment (segment.index)}
              <div
                class="bar-segment"
                class:filled={segment.filled && !hasRevealed}
                class:correct={hasRevealed && segment.isCorrect}
                class:over-guess={hasRevealed && segment.isUserGuess && !segment.isCorrect}
                class:under-guess={hasRevealed && segment.isCorrect && !segment.isUserGuess}
              ></div>
            {/each}
          </div>

          <!-- Animated pods on the bar -->
          <div class="pods-on-bar">
            {#each Array(userGuess) as _, i (i)}
              <div
                class="pod-on-bar"
                style="left: {((i + 0.5) / MAX_GUESS) * 100}%"
                in:scale={{ duration: 300, easing: elasticOut, start: 0.5 }}
              >
                <img src="/assets/cocoapod.png" alt="" />
              </div>
            {/each}
          </div>

          <!-- Correct answer marker (shown after reveal) -->
          {#if hasRevealed}
            <div
              class="correct-marker"
              style="left: {(CORRECT_ANSWER / MAX_GUESS) * 100}%"
              in:fly={{ y: -20, duration: 500, easing: cubicOut }}
            >
              <span class="marker-label">{CORRECT_ANSWER} lbs</span>
              <div class="marker-line"></div>
            </div>
          {/if}

          <!-- User guess marker -->
          {#if userGuess > 0}
            <div
              class="guess-marker"
              style="left: {(userGuess / MAX_GUESS) * 100}%"
            >
              <div class="marker-line guess-line"></div>
              <span class="guess-label">{userGuess} lbs</span>
            </div>
          {/if}
        </div>

        <div class="chart-label-right">{MAX_GUESS} lbs</div>
      </div>

      <!-- Current guess display -->
      <div class="guess-display">
        <span class="guess-number">{userGuess}</span>
        <span class="guess-unit">pounds</span>
      </div>

      <!-- Action buttons -->
      <div class="action-area">
        {#if !hasRevealed}
          <button
            class="reveal-button"
            onclick={revealAnswer}
            disabled={userGuess === 0}
            class:disabled={userGuess === 0}
          >
            Reveal the Answer
          </button>
        {:else}
          <div class="result-area" in:fade={{ duration: 400 }}>
            <p class="result-text">
              The average American eats about <strong>{CORRECT_ANSWER} pounds</strong> of chocolate per year!
            </p>
            <p class="feedback-text" class:exact={guessAccuracy === 'exact'} class:close={guessAccuracy === 'close'}>
              {feedbackMessage}
            </p>
            <p class="context-text">
              That's roughly equivalent to 120 standard chocolate bars annually, or one bar every 3 days.
            </p>
            <button class="reset-button" onclick={resetGame}>
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
    min-height: 100vh;
    background: #1a0f0a;
    color: rgba(255, 248, 240, 0.94);
    padding: 4rem 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .game-container {
    max-width: 800px;
    width: 100%;
    margin: 0 auto;
  }

  .game-header {
    text-align: center;
    margin-bottom: 2.5rem;
  }

  .game-title {
    font-family: var(--serif);
    font-size: clamp(1.8rem, 5vw, 2.5rem);
    font-weight: 700;
    color: rgba(255, 248, 240, 0.95);
    margin: 0 0 1rem 0;
  }

  .game-subtitle {
    font-family: var(--sans);
    font-size: 1.1rem;
    line-height: 1.6;
    color: rgba(255, 248, 240, 0.8);
    margin: 0 0 0.75rem 0;
  }

  .game-instruction {
    font-family: var(--sans);
    font-size: 0.95rem;
    color: #f4c96b;
    margin: 0;
  }

  .game-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
  }

  /* Pod clicking area */
  .pod-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .pod-button {
    background: rgba(255, 248, 240, 0.05);
    border: 2px dashed rgba(255, 224, 189, 0.3);
    border-radius: 20px;
    padding: 1.5rem 2rem;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
  }

  .pod-button:hover:not(.disabled) {
    background: rgba(255, 248, 240, 0.1);
    border-color: rgba(255, 224, 189, 0.5);
    transform: scale(1.05);
  }

  .pod-button:active:not(.disabled) {
    transform: scale(0.98);
  }

  .pod-button.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .pod-image {
    width: 120px;
    height: auto;
    display: block;
    transition: transform 0.2s ease;
  }

  .pod-image.bounce {
    animation: pod-bounce 0.3s ease;
  }

  @keyframes pod-bounce {
    0% { transform: scale(1); }
    50% { transform: scale(1.15); }
    100% { transform: scale(1); }
  }

  .pod-hint {
    position: absolute;
    bottom: -0.5rem;
    right: -0.5rem;
    background: #4a7c59;
    color: white;
    font-size: 0.8rem;
    font-weight: 600;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-family: var(--sans);
  }

  .remove-button {
    background: rgba(180, 90, 90, 0.3);
    border: 1px solid rgba(180, 90, 90, 0.5);
    color: rgba(255, 200, 200, 0.9);
    font-size: 0.85rem;
    font-weight: 600;
    padding: 0.4rem 0.8rem;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: var(--sans);
  }

  .remove-button:hover {
    background: rgba(180, 90, 90, 0.5);
  }

  /* Chart area */
  .chart-area {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0 1rem;
  }

  .chart-label-left,
  .chart-label-right {
    font-family: var(--sans);
    font-size: 0.85rem;
    color: rgba(255, 248, 240, 0.6);
    white-space: nowrap;
  }

  .bar-container {
    flex: 1;
    height: 80px;
    position: relative;
  }

  .bar-background {
    display: flex;
    height: 40px;
    background: rgba(255, 248, 240, 0.1);
    border-radius: 8px;
    overflow: hidden;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 100%;
  }

  .bar-segment {
    flex: 1;
    border-right: 1px solid rgba(255, 248, 240, 0.1);
    transition: background-color 0.3s ease;
  }

  .bar-segment:last-child {
    border-right: none;
  }

  .bar-segment.filled {
    background: linear-gradient(180deg, #6b4423 0%, #4a2f18 100%);
  }

  .bar-segment.correct {
    background: linear-gradient(180deg, #4a7c59 0%, #3d6b4a 100%);
  }

  .bar-segment.over-guess {
    background: linear-gradient(180deg, #8b5a3c 0%, #6b4423 100%);
  }

  .bar-segment.under-guess {
    background: linear-gradient(180deg, #4a7c59 0%, #3d6b4a 100%);
    opacity: 0.5;
  }

  /* Pods on bar */
  .pods-on-bar {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .pod-on-bar {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 30px;
    height: 30px;
  }

  .pod-on-bar img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  /* Markers */
  .correct-marker,
  .guess-marker {
    position: absolute;
    top: 0;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .correct-marker {
    top: -5px;
  }

  .guess-marker {
    bottom: -5px;
    top: auto;
  }

  .marker-label {
    font-family: var(--sans);
    font-size: 0.85rem;
    font-weight: 700;
    color: #4a7c59;
    background: rgba(10, 6, 4, 0.9);
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    white-space: nowrap;
  }

  .marker-line {
    width: 2px;
    height: 15px;
    background: #4a7c59;
  }

  .guess-label {
    font-family: var(--sans);
    font-size: 0.8rem;
    font-weight: 600;
    color: #f4c96b;
    background: rgba(10, 6, 4, 0.9);
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    white-space: nowrap;
  }

  .guess-line {
    background: #f4c96b;
    order: -1;
  }

  /* Guess display */
  .guess-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .guess-number {
    font-family: var(--serif);
    font-size: 3.5rem;
    font-weight: 700;
    color: #f4c96b;
    line-height: 1;
  }

  .guess-unit {
    font-family: var(--sans);
    font-size: 1rem;
    color: rgba(255, 248, 240, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  /* Action buttons */
  .action-area {
    width: 100%;
    text-align: center;
  }

  .reveal-button {
    background: linear-gradient(180deg, #6b4423 0%, #4a2f18 100%);
    border: 2px solid rgba(255, 224, 189, 0.4);
    color: rgba(255, 248, 240, 0.95);
    font-family: var(--sans);
    font-size: 1.1rem;
    font-weight: 600;
    padding: 0.9rem 2rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .reveal-button:hover:not(.disabled) {
    background: linear-gradient(180deg, #7d5030 0%, #5a3a20 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  }

  .reveal-button.disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* Results */
  .result-area {
    max-width: 500px;
    margin: 0 auto;
    padding: 1.5rem;
    background: rgba(10, 6, 4, 0.8);
    border: 1px solid rgba(255, 224, 189, 0.3);
    border-radius: 12px;
  }

  .result-text {
    font-family: var(--sans);
    font-size: 1.15rem;
    line-height: 1.6;
    color: rgba(255, 248, 240, 0.95);
    margin: 0 0 1rem 0;
  }

  .result-text strong {
    color: #f4c96b;
  }

  .feedback-text {
    font-family: var(--sans);
    font-size: 1rem;
    color: rgba(255, 248, 240, 0.8);
    margin: 0 0 1rem 0;
  }

  .feedback-text.exact {
    color: #8fbc8f;
    font-weight: 600;
  }

  .feedback-text.close {
    color: #8fbc8f;
  }

  .context-text {
    font-family: var(--sans);
    font-size: 0.9rem;
    color: rgba(255, 248, 240, 0.6);
    margin: 0 0 1.5rem 0;
    font-style: italic;
  }

  .reset-button {
    background: transparent;
    border: 1px solid rgba(255, 224, 189, 0.4);
    color: rgba(255, 248, 240, 0.8);
    font-family: var(--sans);
    font-size: 0.95rem;
    font-weight: 500;
    padding: 0.6rem 1.5rem;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .reset-button:hover {
    background: rgba(255, 248, 240, 0.1);
    border-color: rgba(255, 224, 189, 0.6);
  }

  @media (max-width: 600px) {
    .guess-game {
      padding: 3rem 1rem;
    }

    .pod-image {
      width: 100px;
    }

    .guess-number {
      font-size: 2.5rem;
    }

    .chart-area {
      flex-direction: column;
      gap: 0.5rem;
    }

    .chart-label-left,
    .chart-label-right {
      display: none;
    }

    .bar-container {
      width: 100%;
    }

    .pod-on-bar {
      width: 20px;
      height: 20px;
    }
  }
</style>
