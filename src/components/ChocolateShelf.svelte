<script lang="ts">
  import { groups } from "d3-array";
  import Bar from "./ChocolateShelf.Bar.svelte";
  import Rack from "./ChocolateShelf.Rack.svelte";
  import HoverTooltip from "./HoverTooltip.svelte";

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
    data,
    rows = 4,
    onhover,
    highlightName,
    highlightParent
  }: {
    data: ChocolateBar[];
    rows?: number;
    onhover?: (event: HoverEvent) => void;
    highlightName?: string;
    highlightParent?: string;
  } = $props();

  // Tooltip state
  let hoveredBar = $state<ChocolateBar | null>(null);
  let cursorX = $state(0);
  let cursorY = $state(0);

  function handleBarHover(event: HoverEvent) {
    hoveredBar = event.detail.bar;
    cursorX = event.detail.x;
    cursorY = event.detail.y;
    // Also propagate to parent if needed
    onhover?.(event);
  }

  // Normalize name for comparison (remove special chars, lowercase)
  function normalizeName(name: string): string {
    return name.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/['']/g, '')
      .replace(/[^a-z0-9]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Check if two chocolate names match
  function namesMatch(name1: string, name2: string): boolean {
    const n1 = normalizeName(name1);
    const n2 = normalizeName(name2);
    const n1First = n1.split(' ')[0];
    const n2First = n2.split(' ')[0];

    // Compare without any spaces (handles "KitKat" vs "Kit Kat")
    const n1NoSpace = n1.replace(/\s+/g, '');
    const n2NoSpace = n2.replace(/\s+/g, '');

    // Check if one name starts with the other (handles "M&M" vs "M&M's")
    const startsWithMatch = n1NoSpace.startsWith(n2NoSpace) || n2NoSpace.startsWith(n1NoSpace);

    // Only match if first words are the same and have reasonable length
    if (n1First.length < 3 || n2First.length < 3) {
      return n1 === n2 || n1NoSpace === n2NoSpace || startsWithMatch;
    }

    return n1 === n2 ||
           n1First === n2First ||
           n1NoSpace === n2NoSpace;
  }

  // this will be set once the layout mounts
  let wallH = $state<number | undefined>(undefined);

  // group chocolates by conglomerate, with highlighted parent first
  let parentGroups = $derived.by(() => {
    const grouped = groups(data, (d) => d.parent);
    if (!highlightParent) return grouped;

    // Sort so highlighted parent comes first
    return [...grouped].sort((a, b) => {
      const aIsHighlighted = a[0].toLowerCase() === highlightParent.toLowerCase();
      const bIsHighlighted = b[0].toLowerCase() === highlightParent.toLowerCase();
      if (aIsHighlighted && !bIsHighlighted) return -1;
      if (!aIsHighlighted && bIsHighlighted) return 1;
      return 0;
    });
  });

  // how many rows of shelves/bars we actually draw
  let effectiveRows = $derived(wallH && wallH > 550 ? 5 : rows);

  // ---- BAR SIZE ----
  // use a default height until wallH is known, then switch to computed
  const DEFAULT_BAR_HEIGHT = 160;

  let barHeight = $derived(
    wallH ? Math.floor(wallH / effectiveRows) : DEFAULT_BAR_HEIGHT
  );
  let barWidth = $derived(Math.floor(barHeight * 0.7));

  // ---- CHUNK WIDTHS (per conglomerate) ----
  // IMPORTANT: this must NOT depend on wallH existing,
  // otherwise nothing renders on first pass.
  let chunkWidths = $derived(
    parentGroups.map(([parent, bars]) => {
      const totalBars = bars.length;
      const columns = Math.max(1, Math.ceil(totalBars / effectiveRows));
      const chunkWidth = columns * barWidth + 16; // + a bit of padding
      return { parent, chunkWidth };
    })
  );

  // one shelf per row
  let shelves = $derived(
    Array.from({ length: effectiveRows }, (_, i) => i)
  );
</script>

<section id="chocolate-wall" class="wall">
  <div class="overflow-wrap">
    {#each parentGroups as [parent, bars]}
      {@const match = chunkWidths.find((d) => d.parent === parent)}
      {#if match}
        <div class="group-column">
          <!-- conglomerate label -->
          <div class="group-label" style={`width:${match.chunkWidth}px;`}>
            <span class="group-name">{bars[0]?.parent_pretty || parent}</span>
            <span class="group-count">{bars.length} brands</span>
          </div>

          <!-- this wrapper defines wallH; shelves + bars share it -->
          <div class="parent-wrapper" bind:clientHeight={wallH}>
            <div
              class="parentChunk"
              id={`chunk-${parent}`}
              style={`width:${match.chunkWidth}px;`}
            >
              <div class="bars">
                {#each bars as bar}
                  <Bar
                    {bar}
                    barHeight={barHeight}
                    barWidth={barWidth}
                    onhover={handleBarHover}
                    highlighted={highlightName ? namesMatch(bar.name, highlightName) : false}
                  />
                {/each}
              </div>
            </div>

            <!-- shelves drawn behind bars, same height/rows -->
            <div class="shelves">
              {#if wallH}
                {#each shelves as _shelf}
                  <Rack
                    shelfW={match.chunkWidth}
                    wallH={wallH}
                    rows={effectiveRows}
                  />
                {/each}
              {/if}
            </div>
          </div>
        </div>
      {/if}
    {/each}
  </div>

  {#if hoveredBar}
    <HoverTooltip
      bar={hoveredBar}
      x={cursorX}
      y={cursorY}
      highlighted={highlightName ? namesMatch(hoveredBar.name, highlightName) : false}
    />
  {/if}
</section>

<style>
  .wall {
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: row;
    height: 100vh;
    z-index: 1;
    position: relative;
    overflow-x: auto;
    width: 100%;
  }

  .overflow-wrap {
    display: flex;
    flex-direction: row;
    padding: 0 5rem;
    gap: 3rem;
    transition: 1.5s ease-in-out;
  }

  .group-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
  }

  .group-label {
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    white-space: nowrap;
    padding: 0.5rem 0 1rem;
    pointer-events: none;
  }

  .group-name {
    font-size: 1rem;
    color: rgba(255, 248, 240, 0.9);
    letter-spacing: 0.08em;
    font-weight: 600;
    text-transform: uppercase;
  }

  .group-count {
    font-size: 0.75rem;
    color: rgba(255, 248, 240, 0.5);
    letter-spacing: 0.05em;
    font-weight: 400;
  }

  /* single source of truth for the wall height */
  .parent-wrapper {
    height: 65vh; /* tweak this if you want shelves higher/lower */
    position: relative;
    pointer-events: none; /* children re-enable as needed */
  }

  .parentChunk {
    margin: 0;
    height: 100%;
  }

  .bars {
    position: absolute;
    top: 47px;
    left: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap; /* fills down then across */
    transform: translate3d(0, 0, 0);
    -webkit-transform: translate3d(0, 0, 0);
    z-index: 2;
    pointer-events: auto; /* bars are hoverable */
  }

  .shelves {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    pointer-events: none;
  }
</style>
