<script lang="ts">
  import * as d3 from "d3";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import Scrolly from "$components/helpers/Scrolly.svelte";

  // Current scroll step
  let currentStep = $state<number | undefined>(undefined);

  // Viewport dimensions
  let innerWidth = $state(800);
  let innerHeight = $state(600);

  // Data: Ghana tree cover loss by year (hectares)
  const yearlyData = [
    { year: 2001, value: 43676 },
    { year: 2002, value: 78393 },
    { year: 2003, value: 24946 },
    { year: 2004, value: 17628 },
    { year: 2005, value: 41339 },
    { year: 2006, value: 27143 },
    { year: 2007, value: 40184 },
    { year: 2008, value: 37826 },
    { year: 2009, value: 38256 },
    { year: 2010, value: 19476 },
    { year: 2011, value: 36202 },
    { year: 2012, value: 36630 },
    { year: 2013, value: 81203 },
    { year: 2014, value: 120207 },
    { year: 2015, value: 57391 },
    { year: 2016, value: 119243 },
    { year: 2017, value: 115332 },
    { year: 2018, value: 151531 },
    { year: 2019, value: 88265 },
    { year: 2020, value: 136614 },
    { year: 2021, value: 101413 },
    { year: 2022, value: 118644 }
  ];

  // Calculate cumulative values
  let runningTotal = 0;
  const dataWithCumulative = yearlyData.map(d => {
    runningTotal += d.value;
    return {
      ...d,
      cumulative: runningTotal
    };
  });

  const totalLoss = runningTotal;

  // Chart modes
  type ChartMode = "annual" | "cumulative";

  // Scroll step definitions
  const steps: Array<{
    title: string;
    description: string;
    showUntilYear: number;
    highlightYear: number | null;
    mode: ChartMode;
  }> = [
    {
      title: "The Early 2000s",
      description: "Ghana's forests began losing significant tree cover at the turn of the millennium. In 2001, over 43,000 hectares were lost.",
      showUntilYear: 2001,
      highlightYear: 2001,
      mode: "annual"
    },
    {
      title: "A Spike in 2002",
      description: "Just one year later, deforestation nearly doubled. 78,000 hectares vanished—one of the worst years of the early decade.",
      showUntilYear: 2002,
      highlightYear: 2002,
      mode: "annual"
    },
    {
      title: "A Decade of Loss",
      description: "Throughout the 2000s, Ghana lost between 17,000 and 78,000 hectares annually. The pressure on forests was relentless.",
      showUntilYear: 2010,
      highlightYear: null,
      mode: "annual"
    },
    {
      title: "2013: The Turning Point",
      description: "After years of relatively stable loss, 2013 marked a dramatic uptick. Over 81,000 hectares were cleared as cocoa demand surged globally.",
      showUntilYear: 2013,
      highlightYear: 2013,
      mode: "annual"
    },
    {
      title: "2018: The Worst Year",
      description: "2018 holds the grim record: <strong>151,531 hectares</strong> lost in a single year. That's roughly 606 million trees—an area larger than Los Angeles.",
      showUntilYear: 2018,
      highlightYear: 2018,
      mode: "annual"
    },
    {
      title: "Year by Year",
      description: "Each bar represents a year of loss. Some years are worse than others, but the damage never stops.",
      showUntilYear: 2022,
      highlightYear: null,
      mode: "annual"
    },
    {
      title: "The Mounting Total",
      description: "Now let's see what this adds up to. This view shows the <strong>cumulative toll</strong>—each year's loss stacks on top of the last.",
      showUntilYear: 2005,
      highlightYear: null,
      mode: "cumulative"
    },
    {
      title: "Growing Steadily",
      description: "By 2010, Ghana had already lost over <strong>400,000 hectares</strong>. The line keeps climbing as forests vanish year after year.",
      showUntilYear: 2010,
      highlightYear: 2010,
      mode: "cumulative"
    },
    {
      title: "The Acceleration Begins",
      description: "After 2013, the pace quickens. Watch how the curve grows steeper—deforestation is intensifying.",
      showUntilYear: 2013,
      highlightYear: 2013,
      mode: "cumulative"
    },
    {
      title: "Half a Million Gone",
      description: "By 2014, over <strong>500,000 hectares</strong> have been cleared. More than half of the total damage happens in the years ahead.",
      showUntilYear: 2014,
      highlightYear: 2014,
      mode: "cumulative"
    },
    {
      title: "The Steep Climb",
      description: "The line shoots upward as global chocolate demand drives deforestation to new heights.",
      showUntilYear: 2017,
      highlightYear: null,
      mode: "cumulative"
    },
    {
      title: "One Million Hectares",
      description: "By 2018, Ghana has lost over <strong>1 million hectares</strong>—an area larger than Cyprus, gone forever.",
      showUntilYear: 2018,
      highlightYear: 2018,
      mode: "cumulative"
    },
    {
      title: "The Damage Continues",
      description: "Even as awareness grows, the losses continue. Each year adds more to the irreversible total.",
      showUntilYear: 2020,
      highlightYear: 2020,
      mode: "cumulative"
    },
    {
      title: "The Full Picture",
      description: "From 2001 to 2022, Ghana lost over <strong>1.5 million hectares</strong> of tree cover. This area chart shows the irreversible accumulation—what's gone is gone.",
      showUntilYear: 2022,
      highlightYear: null,
      mode: "cumulative"
    }
  ];

  // Chart configuration
  const margin = { top: 80, right: 60, bottom: 80, left: 80 };

  // Reactive chart dimensions based on viewport
  let width = $derived(innerWidth);
  let height = $derived(innerHeight);

  let xScale: d3.ScaleBand<number> | null = $state(null);
  let xScaleLinear: d3.ScaleLinear<number, number> | null = $state(null);
  let yScaleAnnual: d3.ScaleLinear<number, number> | null = $state(null);
  let yScaleCumulative: d3.ScaleLinear<number, number> | null = $state(null);
  let mounted = $state(false);

  // Track previous mode for transitions
  let previousMode = $state<ChartMode>("annual");

  // Hover state for interactivity
  let hoveredYear = $state<number | null>(null);
  let tooltipX = $state(0);
  let tooltipY = $state(0);

  // Get hovered data point
  let hoveredData = $derived(hoveredYear ? dataWithCumulative.find(d => d.year === hoveredYear) : null);

  // Current display state based on scroll step
  let stepIndex = $derived(currentStep ?? 0);
  let showUntilYear = $derived(steps[stepIndex]?.showUntilYear ?? 2022);
  let highlightYear = $derived(steps[stepIndex]?.highlightYear ?? null);
  let chartMode = $derived(steps[stepIndex]?.mode ?? "annual");

  // Only show chart when we're in a valid step
  let chartVisible = $derived(currentStep !== undefined);

  // Filter data to show only years up to the current step
  let visibleData = $derived(dataWithCumulative.filter(d => d.year <= showUntilYear));

  // Generate the cumulative area path
  let cumulativeAreaPath = $derived.by(() => {
    if (!xScaleLinear || !yScaleCumulative || chartMode !== "cumulative") return "";

    const areaGenerator = d3.area<typeof dataWithCumulative[0]>()
      .x(d => xScaleLinear!(d.year))
      .y0(height - margin.top - margin.bottom)
      .y1(d => yScaleCumulative!(d.cumulative))
      .curve(d3.curveMonotoneX);

    return areaGenerator(visibleData) || "";
  });

  // Generate the cumulative line path (top of area)
  let cumulativeLinePath = $derived.by(() => {
    if (!xScaleLinear || !yScaleCumulative || chartMode !== "cumulative") return "";

    const lineGenerator = d3.line<typeof dataWithCumulative[0]>()
      .x(d => xScaleLinear!(d.year))
      .y(d => yScaleCumulative!(d.cumulative))
      .curve(d3.curveMonotoneX);

    return lineGenerator(visibleData) || "";
  });

  function initScales() {
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Band scale for bar chart
    xScale = d3
      .scaleBand<number>()
      .domain(yearlyData.map(d => d.year))
      .range([0, innerWidth])
      .paddingInner(0.15);

    // Linear scale for area chart x-axis
    xScaleLinear = d3
      .scaleLinear()
      .domain([2001, 2022])
      .range([0, innerWidth]);

    // Scale for annual values (bars)
    yScaleAnnual = d3
      .scaleLinear()
      .domain([0, d3.max(yearlyData, d => d.value)!])
      .range([innerHeight, 0])
      .nice();

    // Scale for cumulative values (area chart)
    yScaleCumulative = d3
      .scaleLinear()
      .domain([0, totalLoss])
      .range([innerHeight, 0])
      .nice();
  }

  // Draw axes with D3
  function drawAxes() {
    if (!xScale || !xScaleLinear || !yScaleAnnual || !yScaleCumulative || !mounted) return;

    const svg = d3.select("#ghana-chart-svg");
    const innerWidth = width - margin.left - margin.right;

    // X-axis
    const xAxisG = svg.select<SVGGElement>(".x-axis");
    if (!xAxisG.empty()) {
      if (chartMode === "annual") {
        const xAxis = d3.axisBottom(xScale)
          .tickValues(yearlyData.filter((_, i) => i % 3 === 0).map(d => d.year));
        xAxisG.transition().duration(800).ease(d3.easeCubicInOut).call(xAxis);

        // Highlight current year label
        xAxisG.selectAll(".tick text")
          .classed("highlight-label", (d: any) => d === highlightYear)
          .classed("hide-label", (d: any) => {
            if (d === highlightYear) return false;
            if (highlightYear && Math.abs(d - highlightYear) <= 2 && d !== highlightYear) return true;
            return false;
          });
      } else {
        const xAxis = d3.axisBottom(xScaleLinear)
          .tickValues([2001, 2005, 2010, 2015, 2020, 2022])
          .tickFormat(d => String(d));
        xAxisG.transition().duration(800).ease(d3.easeCubicInOut).call(xAxis);

        xAxisG.selectAll(".tick text")
          .classed("highlight-label", false)
          .classed("hide-label", false);
      }
    }

    // Y-axis
    const yAxisG = svg.select<SVGGElement>(".y-axis");
    if (!yAxisG.empty()) {
      if (chartMode === "annual") {
        const yAxis = d3.axisLeft(yScaleAnnual!)
          .tickSize(-innerWidth)
          .tickFormat((d: any) => `${Math.round(d / 1000)}k`);
        yAxisG.transition().duration(800).ease(d3.easeCubicInOut).call(yAxis);
      } else {
        const yAxis = d3.axisLeft(yScaleCumulative!)
          .tickSize(-innerWidth)
          .tickFormat((d: any) => d >= 1000000 ? `${(d / 1000000).toFixed(1)}M` : `${Math.round(d / 1000)}k`);
        yAxisG.transition().duration(800).ease(d3.easeCubicInOut).call(yAxis);
      }
    }
  }

  // Update previous mode when chart mode changes
  $effect(() => {
    if (chartMode !== previousMode) {
      previousMode = chartMode;
    }
  });

  onMount(() => {
    mounted = true;
    initScales();
  });

  // Reinit scales when dimensions change
  $effect(() => {
    if (mounted && width && height) {
      initScales();
    }
  });

  // Redraw axes when step changes
  $effect(() => {
    if (mounted && xScale && yScaleAnnual && chartVisible) {
      drawAxes();
    }
  });

  // Format large numbers
  function formatHectares(value: number): string {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}k`;
    }
    return value.toLocaleString();
  }

  // Custom transition for smooth bar growth
  function growBar(node: SVGRectElement, { delay = 0, duration = 600 }) {
    const finalHeight = parseFloat(node.getAttribute('height') || '0');
    const finalY = parseFloat(node.getAttribute('y') || '0');
    const baseY = height - margin.top - margin.bottom;

    return {
      delay,
      duration,
      easing: cubicOut,
      css: (t: number) => {
        const currentHeight = finalHeight * t;
        const currentY = baseY - currentHeight;
        return `
          height: ${currentHeight}px;
          y: ${currentY};
          opacity: ${t};
        `;
      }
    };
  }

  // Hover handlers
  function handleMouseEnter(year: number, event: MouseEvent) {
    hoveredYear = year;
    updateTooltipPosition(event);
  }

  function handleMouseMove(event: MouseEvent) {
    updateTooltipPosition(event);
  }

  function handleMouseLeave() {
    hoveredYear = null;
  }

  function updateTooltipPosition(event: MouseEvent) {
    const svgRect = document.getElementById('ghana-chart-svg')?.getBoundingClientRect();
    if (svgRect) {
      tooltipX = event.clientX - svgRect.left;
      tooltipY = event.clientY - svgRect.top;
    }
  }

  // Format number with commas
  function formatNumber(value: number): string {
    return value.toLocaleString();
  }

  // Get comparison text for context
  function getComparisonText(hectares: number): string {
    const trees = Math.round(hectares * 4000); // ~4000 trees per hectare
    if (hectares >= 100000) {
      return `≈ ${(trees / 1000000000).toFixed(1)} billion trees`;
    }
    return `≈ ${(trees / 1000000).toFixed(0)} million trees`;
  }

</script>

<svelte:window bind:innerWidth bind:innerHeight />

<div class="scroll-container">
  <!-- Full-screen sticky chart -->
  <div class="sticky">
    {#if mounted && xScale && xScaleLinear && yScaleAnnual && yScaleCumulative && chartVisible}
      <svg id="ghana-chart-svg" {width} {height} class="chart-svg" in:fade={{ duration: 600, easing: cubicOut }}>
        <defs>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#4a7c59" stop-opacity="0.9" />
            <stop offset="50%" stop-color="#3d6b4a" stop-opacity="0.6" />
            <stop offset="100%" stop-color="#2d5a3d" stop-opacity="0.2" />
          </linearGradient>
        </defs>

        <g transform={`translate(${margin.left}, ${margin.top})`}>
          <!-- Y-axis with grid -->
          <g class="y-axis" />

          <!-- X-axis -->
          <g class="x-axis" transform={`translate(0, ${height - margin.top - margin.bottom})`} />

          <!-- ANNUAL MODE: Bar chart -->
          {#if chartMode === "annual"}
            {#each visibleData as d, i (d.year)}
              <rect
                class="bar"
                class:highlight={d.year === highlightYear}
                class:hovered={d.year === hoveredYear}
                x={xScale(d.year)}
                y={yScaleAnnual!(d.value)}
                width={xScale.bandwidth()}
                height={height - margin.top - margin.bottom - yScaleAnnual!(d.value)}
                in:growBar={{ delay: i * 50, duration: 700 }}
                out:fade={{ duration: 400 }}
                onmouseenter={(e) => handleMouseEnter(d.year, e)}
                onmousemove={handleMouseMove}
                onmouseleave={handleMouseLeave}
                role="img"
                aria-label={`${d.year}: ${formatNumber(d.value)} hectares lost`}
              />
            {/each}

            <!-- Value label for highlighted bar -->
            {#if highlightYear}
              {#each visibleData.filter(d => d.year === highlightYear) as d (d.year)}
                <text
                  class="value-label"
                  x={(xScale(d.year) ?? 0) + xScale.bandwidth() / 2}
                  y={yScaleAnnual!(d.value) - 12}
                  text-anchor="middle"
                  in:fade={{ duration: 400, delay: 200, easing: cubicOut }}
                  out:fade={{ duration: 200 }}
                >
                  {formatHectares(d.value)} ha
                </text>
              {/each}
            {/if}
          {/if}

          <!-- CUMULATIVE MODE: Area chart -->
          {#if chartMode === "cumulative"}
            <!-- Area fill - uses CSS transition for smooth path morphing -->
            {#if cumulativeAreaPath}
              <path
                class="cumulative-area"
                d={cumulativeAreaPath}
                in:fade={{ duration: 800, easing: cubicOut }}
                out:fade={{ duration: 400 }}
              />
            {/if}

            <!-- Line on top - uses CSS transition for smooth path morphing -->
            {#if cumulativeLinePath}
              <path
                class="cumulative-line"
                d={cumulativeLinePath}
                in:fade={{ duration: 800, delay: 100, easing: cubicOut }}
                out:fade={{ duration: 400 }}
              />
            {/if}

            <!-- Dots on the line - simple fade, no staggering -->
            {#each visibleData as d (d.year)}
              <circle
                class="cumulative-dot"
                class:highlight-dot={d.year === highlightYear}
                class:hovered-dot={d.year === hoveredYear}
                cx={xScaleLinear!(d.year)}
                cy={yScaleCumulative!(d.cumulative)}
                r={d.year === highlightYear || d.year === hoveredYear ? 8 : 5}
                in:fade={{ duration: 500, easing: cubicOut }}
                out:fade={{ duration: 300 }}
                onmouseenter={(e) => handleMouseEnter(d.year, e)}
                onmousemove={handleMouseMove}
                onmouseleave={handleMouseLeave}
                role="img"
                aria-label={`${d.year}: ${formatNumber(d.cumulative)} hectares total`}
              />
            {/each}

            <!-- Value label for last visible point or highlighted -->
            {#if visibleData.length > 0}
              {@const labelPoint = highlightYear
                ? visibleData.find(d => d.year === highlightYear)
                : visibleData[visibleData.length - 1]}
              {#if labelPoint}
                {@const isNearEnd = labelPoint.year >= 2020}
                <text
                  class="cumulative-label"
                  x={isNearEnd ? xScaleLinear!(labelPoint.year) - 12 : xScaleLinear!(labelPoint.year) + 12}
                  y={yScaleCumulative!(labelPoint.cumulative) - 12}
                  text-anchor={isNearEnd ? "end" : "start"}
                >
                  {formatHectares(labelPoint.cumulative)} ha total
                </text>
              {/if}
            {/if}
          {/if}

          <!-- Axis labels -->
          <text
            class="axis-label axis-label-y"
            x={-((height - margin.top - margin.bottom) / 2)}
            y={-55}
            transform="rotate(-90)"
            text-anchor="middle"
          >
            {chartMode === "annual" ? "Annual Loss (hectares)" : "Cumulative Loss (hectares)"}
          </text>

          <text
            class="axis-label axis-label-x"
            x={(width - margin.left - margin.right) / 2}
            y={height - margin.top - margin.bottom + 50}
            text-anchor="middle"
          >
            Year
          </text>
        </g>

        <!-- Chart title -->
        <text class="chart-title" x={width / 2} y={40} text-anchor="middle">
          Tree Cover Loss in Ghana
        </text>

        <!-- Mode indicator -->
        <text class="mode-indicator" x={width / 2} y={height - 20} text-anchor="middle">
          {chartMode === "annual" ? "Annual View" : "Cumulative View"}
        </text>
      </svg>

      <!-- Tooltip -->
      {#if hoveredData}
        <div
          class="tooltip"
          style="left: {tooltipX + 15}px; top: {tooltipY - 10}px;"
          in:fade={{ duration: 150 }}
          out:fade={{ duration: 100 }}
        >
          <div class="tooltip-year">{hoveredData.year}</div>
          <div class="tooltip-row">
            <span class="tooltip-label">Annual loss:</span>
            <span class="tooltip-value">{formatNumber(hoveredData.value)} ha</span>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-label">Cumulative:</span>
            <span class="tooltip-value">{formatNumber(hoveredData.cumulative)} ha</span>
          </div>
          <div class="tooltip-context">{getComparisonText(hoveredData.value)}</div>
        </div>
      {/if}
    {/if}
  </div>

  <!-- Scrolly steps floating on top -->
  <Scrolly bind:value={currentStep}>
    {#each steps as step, i}
      <div class="step" class:active={currentStep === i}>
        <p class="step-title">{step.title}</p>
        <p class="step-text">{@html step.description}</p>
      </div>
    {/each}
  </Scrolly>
</div>

<style>
  .scroll-container {
    width: 100%;
    position: relative;
  }

  .sticky {
    position: sticky;
    top: 0;
    width: 100%;
    height: 100vh;
    background: #1a0f0a;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .chart-svg {
    display: block;
  }

  /* Bars (annual mode) */
  .bar {
    fill: #4a7c59;
    cursor: pointer;
    transition: fill 0.2s ease, stroke 0.2s ease, stroke-width 0.2s ease;
  }

  .bar:hover,
  .bar.hovered {
    fill: #5a9c6d;
    stroke: #8fbc8f;
    stroke-width: 2px;
  }

  .bar.highlight {
    fill: #2d5a3d;
    stroke: #8fbc8f;
    stroke-width: 3px;
  }

  /* Area chart (cumulative mode) */
  .cumulative-area {
    fill: url(#areaGradient);
    transition: d 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease;
  }

  .cumulative-line {
    fill: none;
    stroke: #8fbc8f;
    stroke-width: 3px;
    stroke-linecap: round;
    stroke-linejoin: round;
    transition: d 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease;
  }

  .cumulative-dot {
    fill: #4a7c59;
    stroke: rgba(255, 248, 240, 0.8);
    stroke-width: 2px;
    cursor: pointer;
    transition: cx 0.8s cubic-bezier(0.4, 0, 0.2, 1),
                cy 0.8s cubic-bezier(0.4, 0, 0.2, 1),
                r 0.2s ease,
                fill 0.2s ease,
                stroke 0.2s ease,
                stroke-width 0.2s ease,
                opacity 0.5s ease;
  }

  .cumulative-dot:hover,
  .cumulative-dot.hovered-dot {
    fill: #8fbc8f;
    stroke: #fff;
    stroke-width: 2px;
    filter: drop-shadow(0 2px 6px rgba(143, 188, 143, 0.5));
  }

  .cumulative-dot.highlight-dot {
    fill: #8fbc8f;
    stroke: #fff;
    stroke-width: 3px;
    filter: drop-shadow(0 2px 8px rgba(143, 188, 143, 0.7));
  }

  /* Labels */
  .value-label {
    fill: rgba(255, 248, 240, 0.95);
    font-size: 14px;
    font-weight: 700;
    font-family: var(--sans);
  }

  .cumulative-label {
    fill: rgba(255, 248, 240, 0.95);
    font-size: 14px;
    font-weight: 700;
    font-family: var(--sans);
    transition: x 0.8s cubic-bezier(0.4, 0, 0.2, 1),
                y 0.8s cubic-bezier(0.4, 0, 0.2, 1),
                opacity 0.4s ease;
  }

  .axis-label {
    fill: rgba(255, 248, 240, 0.8);
    font-size: 13px;
    font-weight: 600;
    font-family: var(--sans);
    transition: opacity 0.5s ease;
  }

  .chart-title {
    fill: rgba(255, 248, 240, 0.95);
    font-size: 20px;
    font-weight: 700;
    font-family: var(--serif);
  }

  .mode-indicator {
    fill: rgba(255, 248, 240, 0.6);
    font-size: 12px;
    font-weight: 500;
    font-family: var(--sans);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    transition: opacity 0.5s ease;
  }

  /* Axes styling */
  :global(#ghana-chart-svg .x-axis text),
  :global(#ghana-chart-svg .y-axis text) {
    font-family: var(--sans);
    font-size: 12px;
    fill: rgba(255, 248, 240, 0.7);
    transition: fill 0.4s ease, opacity 0.4s ease;
  }

  :global(#ghana-chart-svg .x-axis line),
  :global(#ghana-chart-svg .x-axis path) {
    stroke: rgba(255, 248, 240, 0.3);
    transition: stroke 0.4s ease;
  }

  :global(#ghana-chart-svg .y-axis line) {
    stroke: rgba(255, 248, 240, 0.1);
    transition: stroke 0.4s ease;
  }

  :global(#ghana-chart-svg .y-axis path) {
    display: none;
  }

  :global(#ghana-chart-svg .highlight-label) {
    fill: #8fbc8f !important;
    font-weight: 700 !important;
    font-size: 14px !important;
  }

  :global(#ghana-chart-svg .hide-label) {
    opacity: 0;
  }

  /* Scroll steps - floating cards on the right */
  .step {
    width: 20em;
    max-width: 90vw;
    margin-left: auto;
    margin-right: 2rem;
    margin-bottom: 90vh;
    padding: 1rem 1.5rem;
    background: rgba(10, 6, 4, 0.92);
    border: 1px solid rgba(255, 224, 189, 0.3);
    border-radius: 6px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    opacity: 0.4;
    transition: opacity 0.6s ease;
    z-index: 100;
  }

  .step.active {
    opacity: 1;
  }

  .step-title {
    font-family: var(--serif);
    font-size: 1.1rem;
    font-weight: 600;
    color: rgba(255, 248, 240, 0.95);
    margin: 0 0 0.5rem 0;
    line-height: 1.3;
  }

  .step-text {
    font-family: var(--sans);
    font-size: 0.95rem;
    line-height: 1.6;
    color: rgba(255, 248, 240, 0.8);
    margin: 0;
  }

  :global(.step-text strong) {
    color: #f4c96b;
    font-weight: 600;
  }

  /* First step needs top margin to push it down */
  .step:first-child {
    margin-top: 40vh;
  }

  /* Last step needs extra bottom margin */
  .step:last-child {
    margin-bottom: 120vh;
  }

  @media (max-width: 700px) {
    .step {
      margin-left: auto;
      margin-right: auto;
      margin-bottom: 85vh;
      width: 85vw;
    }

    .step:first-child {
      margin-top: 30vh;
    }

    .step:last-child {
      margin-bottom: 100vh;
    }

    .chart-title {
      font-size: 16px;
    }

    .value-label,
    .cumulative-label {
      font-size: 12px;
    }

    :global(#ghana-chart-svg .x-axis text),
    :global(#ghana-chart-svg .y-axis text) {
      font-size: 10px;
    }

    .tooltip {
      padding: 0.6rem 0.8rem;
      font-size: 0.8rem;
    }
  }

  /* Tooltip styles */
  .tooltip {
    position: absolute;
    background: rgba(10, 6, 4, 0.95);
    border: 1px solid rgba(255, 224, 189, 0.4);
    border-radius: 8px;
    padding: 0.75rem 1rem;
    pointer-events: none;
    z-index: 200;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    min-width: 180px;
    backdrop-filter: blur(8px);
  }

  .tooltip-year {
    font-family: var(--serif);
    font-size: 1.1rem;
    font-weight: 700;
    color: #f4c96b;
    margin-bottom: 0.5rem;
    border-bottom: 1px solid rgba(255, 224, 189, 0.2);
    padding-bottom: 0.4rem;
  }

  .tooltip-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.3rem;
  }

  .tooltip-label {
    font-family: var(--sans);
    font-size: 0.85rem;
    color: rgba(255, 248, 240, 0.7);
  }

  .tooltip-value {
    font-family: var(--sans);
    font-size: 0.9rem;
    font-weight: 600;
    color: rgba(255, 248, 240, 0.95);
  }

  .tooltip-context {
    font-family: var(--sans);
    font-size: 0.8rem;
    color: rgba(143, 188, 143, 0.9);
    margin-top: 0.5rem;
    padding-top: 0.4rem;
    border-top: 1px solid rgba(255, 224, 189, 0.15);
    font-style: italic;
  }
</style>
