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
    width: 130px;
    background: #f5e6d3;
    border: none;
    border-radius: 0;
    padding: 15px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    transform: translateZ(0);
    will-change: left, top;
    overflow: visible;
  }

  .tooltip-image {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 0.5rem;
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
    border-top: 2px solid #1a1a1a;
    padding-top: 0.5rem;
  }

  .tooltip-name {
    margin: 0 0 0.25rem;
    color: #1a1a1a;
    font-family: "gopher", Georgia, serif;
    font-size: 0.8rem;
    font-weight: 700;
    line-height: 1.2;
    font-style: italic;
  }

  .tooltip-owner {
    margin: 0;
    font-family: "Courier New", Courier, monospace;
    font-size: 0.65rem;
    font-weight: 500;
    color: #1a1a1a;
    line-height: 1.3;
  }

  /* Highlighted tooltip for selected chocolate */
  .tooltip.highlighted {
    box-shadow:
      0 0 0 3px tomato,
      0 8px 32px rgba(0, 0, 0, 0.5);
  }

  .tooltip.highlighted::after {
    content: 'Your pick!';
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    background: tomato;
    color: #ffffff;
    font-family: "Courier New", Courier, monospace;
    font-size: 0.55rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    padding: 2px 8px;
    border-radius: 0;
    white-space: nowrap;
  }
</style>
