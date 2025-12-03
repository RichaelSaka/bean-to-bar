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
    highlightName
  }: {
    data: ChocolateBar[];
    rows?: number;
    onhover?: (event: HoverEvent) => void;
    highlightName?: string;
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
    return name.toLowerCase().replace(/['']/g, '').replace(/[^a-z0-9]/g, ' ').trim();
  }

  // Check if two chocolate names match
  function namesMatch(name1: string, name2: string): boolean {
    const n1 = normalizeName(name1);
    const n2 = normalizeName(name2);
    const n1First = n1.split(' ')[0];
    const n2First = n2.split(' ')[0];

    return n1 === n2 ||
           n1.startsWith(n2First) ||
           n2.startsWith(n1First) ||
           n1First === n2First;
  }

  // this will be set once the layout mounts
  let wallH = $state<number | undefined>(undefined);

  // group chocolates by conglomerate
  let parentGroups = $derived(groups(data, (d) => d.parent));

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
            {bars[0]?.parent_pretty || parent}
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
                {#each shelves as shelf}
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
    font-size: 1rem;
    color: rgba(255, 248, 240, 0.9);
    letter-spacing: 0.08em;
    font-weight: 600;
    text-transform: uppercase;
    white-space: nowrap;
    padding: 0.5rem 0 1rem;
    pointer-events: none;
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
