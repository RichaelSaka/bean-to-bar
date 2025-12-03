<script lang="ts">
  interface ChocolateBar {
    id: string;
    name: string;
    parent: string;
    parent_pretty: string;
    image: string;
  }

  interface HoverEvent {
    detail: {
      bar: ChocolateBar | null;
      x: number;
      y: number;
    };
  }

  let {
    bar,
    barHeight = 160,
    barWidth = 112,
    onhover,
    highlighted = false
  }: {
    bar: ChocolateBar;
    barHeight?: number;
    barWidth?: number;
    onhover?: (event: HoverEvent) => void;
    highlighted?: boolean;
  } = $props();

  function handleMouseEnter(e: MouseEvent) {
    onhover?.({ detail: { bar, x: e.clientX, y: e.clientY } });
  }

  function handleMouseMove(e: MouseEvent) {
    onhover?.({ detail: { bar, x: e.clientX, y: e.clientY } });
  }

  function handleMouseLeave() {
    onhover?.({ detail: { bar: null, x: 0, y: 0 } });
  }
</script>

<div
  class="bar"
  class:highlighted
  role="button"
  tabindex="0"
  id={"bar_" + bar.id}
  style={`height: ${barHeight}px; width: ${barWidth}px;`}
  aria-label={`${bar.name} by ${bar.parent_pretty}`}
  onmouseenter={handleMouseEnter}
  onmousemove={handleMouseMove}
  onmouseleave={handleMouseLeave}
>
  <img
    class="bar-img"
    src={bar.image}
    alt={`${bar.name} chocolate bar`}
    loading="lazy"
    draggable="false"
  />
</div>

<style>
  .bar {
    margin: 0;
    padding: 0;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    position: relative;
    pointer-events: auto;
    cursor: pointer;
    overflow: hidden;
  }

  .bar-img {
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
    object-fit: contain;
    object-position: bottom center;
    display: block;
    margin: 0;
    padding: 0;
    transition: transform 0.2s ease-out;
  }

  .bar:hover .bar-img {
    transform: translateY(-3px) scale(1.05);
  }

  /* Highlighted state for selected chocolate */
  .bar.highlighted {
    z-index: 10;
  }

  .bar.highlighted::before {
    content: '';
    position: absolute;
    bottom: 10%;
    left: 50%;
    transform: translateX(-50%);
    width: 80%;
    height: 60%;
    background: radial-gradient(ellipse at center, rgba(212, 175, 55, 0.6) 0%, rgba(212, 175, 55, 0.3) 40%, transparent 70%);
    border-radius: 50%;
    filter: blur(12px);
    animation: circular-glow 2s ease-in-out infinite;
    pointer-events: none;
    z-index: -1;
  }

  .bar.highlighted .bar-img {
    transform: translateY(-5px) scale(1.1);
  }

  .bar.highlighted:hover .bar-img {
    transform: translateY(-8px) scale(1.15);
  }

  @keyframes circular-glow {
    0%, 100% {
      opacity: 0.8;
      transform: translateX(-50%) scale(1);
    }
    50% {
      opacity: 1;
      transform: translateX(-50%) scale(1.15);
    }
  }
</style>
