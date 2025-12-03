<script lang="ts">
  interface ChocolateBar {
    id: string;
    name: string;
    parent: string;
    parent_pretty: string;
    image: string;
  }

  let {
    bar,
    x,
    y,
    highlighted = false
  }: {
    bar: ChocolateBar;
    x: number;
    y: number;
    highlighted?: boolean;
  } = $props();

  // Offset tooltip to the side of the cursor
  const OFFSET_X = 20;
  const TOOLTIP_WIDTH = 110;

  // Calculate position - always to the right, or left if no room
  let tooltipX = $derived(() => {
    let posX = x + OFFSET_X;
    // If tooltip would go off right edge, show on left side
    if (posX + TOOLTIP_WIDTH > window.innerWidth - 10) {
      posX = x - TOOLTIP_WIDTH - OFFSET_X;
    }
    // Clamp to viewport
    if (posX < 10) posX = 10;
    return posX;
  });

  let tooltipY = $derived(() => {
    // Center vertically with the cursor
    let posY = y - 60;
    // Clamp to viewport
    if (posY < 10) posY = 10;
    if (posY + 150 > window.innerHeight - 10) {
      posY = window.innerHeight - 160;
    }
    return posY;
  });
</script>

<div
  class="tooltip"
  class:highlighted
  style="left: {tooltipX()}px; top: {tooltipY()}px;"
>
  <div class="tooltip-image">
    <img src={bar.image} alt={bar.name} />
  </div>
  <div class="tooltip-info">
    <h4 class="tooltip-name">{bar.name}</h4>
    <p class="tooltip-owner">{bar.parent_pretty}</p>
  </div>
</div>

<style>
  .tooltip {
    position: fixed;
    z-index: 9999;
    pointer-events: none;
    width: 110px;
    background: rgba(20, 12, 8, 0.92);
    border-radius: 8px;
    border: 1px solid rgba(212, 175, 55, 0.4);
    padding: 0.5rem;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(10px);
    transform: translateZ(0);
    will-change: left, top;
    overflow: visible;
  }

  .tooltip-image {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 0.25rem;
    overflow: visible;
  }

  .tooltip-image img {
    max-height: 140px;
    max-width: 180%;
    width: auto;
    height: auto;
    object-fit: contain;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  }

  .tooltip-info {
    text-align: center;
  }

  .tooltip-name {
    margin: 0 0 0.1rem;
    color: #d4af37;
    font-size: 0.7rem;
    font-weight: 600;
    line-height: 1.1;
  }

  .tooltip-owner {
    margin: 0;
    font-size: 0.6rem;
    color: rgba(255, 248, 240, 0.8);
    line-height: 1.2;
  }

  /* Highlighted tooltip for selected chocolate */
  .tooltip.highlighted {
    border: 2px solid rgba(212, 175, 55, 0.9);
    box-shadow:
      0 0 20px rgba(212, 175, 55, 0.5),
      0 8px 32px rgba(0, 0, 0, 0.5);
  }

  .tooltip.highlighted::after {
    content: 'Your pick!';
    position: absolute;
    top: -8px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #d4af37, #f0d060);
    color: #1a1410;
    font-size: 0.5rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    padding: 1px 6px;
    border-radius: 3px;
    white-space: nowrap;
  }
</style>
