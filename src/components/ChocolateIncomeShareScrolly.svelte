<script lang="ts">
  import * as d3 from "d3";
  import { onMount } from "svelte";

  let container: HTMLDivElement | null = null;
  let svgContainer: HTMLDivElement | null = null;

  // Price of the chosen chocolate bar in dollars
  let { price = 1 } = $props();

  // Current scroll step (0-indexed)
  let currentStep = $state(0);

  // Base stakeholder shares as fractions of the final price
  const baseShares = [
    { name: "Retailers", share: 0.442, group: "retailers" },
    { name: "Manufacturers", share: 0.352, group: "manufacturers" },
    { name: "Processing", share: 0.076, group: "middlemen" },
    { name: "Farmers", share: 0.066, group: "farmers" },
    { name: "Marketing", share: 0.042, group: "manufacturers" },
    { name: "Port of arrival costs", share: 0.011, group: "middlemen" },
    { name: "Inland transport", share: 0.005, group: "middlemen" },
    { name: "International traders", share: 0.002, group: "middlemen" },
    { name: "International transport", share: 0.003, group: "middlemen" }
  ];

  // Scroll step definitions
  const steps = [
    {
      title: "The Chocolate Bar",
      description: "This is your chocolate bar, broken down by who gets paid what. Every piece represents a share of the final price.",
      highlight: null // Show all
    },
    {
      title: "Retailers Take the Biggest Bite",
      description: "Retailers—supermarkets and shops—take 44.2% of the price. They profit the most from selling chocolate, even though they don't make it.",
      highlight: "retailers"
    },
    {
      title: "Manufacturers & Marketing",
      description: "Chocolate manufacturers like Mars, Nestlé, and Hershey's take about 39% combined. They turn cocoa into candy and spend heavily on advertising.",
      highlight: "manufacturers"
    },
    {
      title: "The Middlemen",
      description: "Processing plants, traders, and transport take nearly 10% combined. These are the steps between farm and factory.",
      highlight: "middlemen"
    },
    {
      title: "Farmers Get the Smallest Piece",
      description: "Cocoa farmers receive only 6.6% of the final price. They do the hardest work—growing, harvesting, fermenting—yet earn the least.",
      highlight: "farmers"
    },
    {
      title: "The Pressure to Expand",
      description: "When farmers earn so little, they clear more forest to plant more cocoa just to survive. This cycle drives deforestation across West Africa.",
      highlight: "farmers"
    }
  ];

  const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  });

  // Chocolate color scale
  const colorScale = d3
    .scaleOrdinal<string, string>()
    .domain(baseShares.map((d) => d.name))
    .range([
      "#5b3013",
      "#7a3c17",
      "#6a3415",
      "#7f4421",
      "#623018",
      "#6d371b",
      "#5a2914",
      "#774021",
      "#683119"
    ]);

  let svg: d3.Selection<SVGGElement, unknown, null, undefined> | null = null;
  let nodes: d3.Selection<SVGGElement, d3.HierarchyRectangularNode<any>, SVGGElement, unknown> | null = null;
  let tooltip: d3.Selection<HTMLDivElement, unknown, null, undefined> | null = null;

  function draw() {
    if (!svgContainer) return;

    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const bounds = svgContainer.getBoundingClientRect();
    const fullWidth = Math.min(bounds.width || 640, 720);
    const width = fullWidth - margin.left - margin.right;
    const height = (fullWidth * 2) / 3 - margin.top - margin.bottom;

    const rootSelection = d3.select(svgContainer);
    rootSelection.selectAll("*").remove();

    const data = baseShares.map((d) => ({
      name: d.name,
      share: d.share,
      value: d.share * price,
      percent: d.share * 100,
      group: d.group
    }));

    const rootData = {
      name: "Chocolate bar",
      children: data
    };

    const svgEl = rootSelection
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    svg = svgEl
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Defs for gradient and shadow
    const defs = svg.append("defs");

    const gradient = defs
      .append("linearGradient")
      .attr("id", "chunkGradientScrolly")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#8b4a20");
    gradient.append("stop").attr("offset", "100%").attr("stop-color", "#4b2510");

    const dropShadow = defs
      .append("filter")
      .attr("id", "barShadowScrolly")
      .attr("height", "130%");

    dropShadow
      .append("feGaussianBlur")
      .attr("in", "SourceAlpha")
      .attr("stdDeviation", 4)
      .attr("result", "blur");

    dropShadow
      .append("feOffset")
      .attr("in", "blur")
      .attr("dx", 0)
      .attr("dy", 6)
      .attr("result", "offsetBlur");

    const feMerge = dropShadow.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "offsetBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Treemap layout
    const root = d3
      .hierarchy(rootData as any)
      .sum((d: any) => d.value)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const treemapLayout = d3
      .treemap<any>()
      .size([width, height])
      .paddingInner(2)
      .round(true);

    treemapLayout(root);

    const barGroup = svg.append("g").attr("filter", "url(#barShadowScrolly)");

    nodes = barGroup
      .selectAll("g.chunk")
      .data(root.leaves())
      .enter()
      .append("g")
      .attr("class", "chunk")
      .attr("transform", (d: any) => `translate(${d.x0},${d.y0})`);

    const isSmallRect = (d: any) => {
      const w = d.x1 - d.x0;
      const h = d.y1 - d.y0;
      return w < 80 || h < 40;
    };

    // Tooltip
    tooltip = rootSelection
      .append("div")
      .attr("class", "income-tooltip")
      .style("position", "fixed")
      .style("pointer-events", "none")
      .style("opacity", "0")
      .style("padding", "0.5rem 0.75rem")
      .style("background", "rgba(15, 8, 4, 0.96)")
      .style("border-radius", "4px")
      .style("border", "1px solid rgba(255, 224, 189, 0.6)")
      .style("color", "#fdf5e6")
      .style("font-size", "0.8rem")
      .style("box-shadow", "0 8px 20px rgba(0, 0, 0, 0.6)")
      .style("max-width", "260px")
      .style("z-index", "999");

    // Base rectangles
    nodes
      .append("rect")
      .attr("class", "chunk-rect")
      .attr("width", (d: any) => d.x1 - d.x0)
      .attr("height", (d: any) => d.y1 - d.y0)
      .attr("rx", 6)
      .attr("ry", 6)
      .attr("fill", (d: any) => colorScale(d.data.name))
      .attr("stroke", "#2d1509")
      .attr("stroke-width", 1.2)
      .style("transition", "opacity 0.8s ease, stroke 0.8s ease, stroke-width 0.8s ease");

    // Gradient overlay
    nodes
      .append("rect")
      .attr("class", "chunk-gradient")
      .attr("width", (d: any) => d.x1 - d.x0)
      .attr("height", (d: any) => d.y1 - d.y0)
      .attr("rx", 6)
      .attr("ry", 6)
      .attr("fill", "url(#chunkGradientScrolly)")
      .attr("opacity", 0.55)
      .style("transition", "opacity 0.8s ease");

    // Labels
    nodes
      .append("text")
      .attr("class", "chunk-label-name")
      .attr("x", 8)
      .attr("y", 18)
      .attr("fill", "#fdf1dd")
      .attr("font-size", 11)
      .attr("font-weight", 600)
      .style("pointer-events", "none")
      .style("transition", "opacity 0.4s ease")
      .text((d: any) => (isSmallRect(d) ? "" : d.data.name));

    nodes
      .append("text")
      .attr("class", "chunk-label-value")
      .attr("x", 8)
      .attr("y", (d: any) => (isSmallRect(d) ? 18 : 34))
      .attr("fill", "#fdf5e6")
      .attr("font-size", 11)
      .style("pointer-events", "none")
      .style("transition", "opacity 0.4s ease")
      .text((d: any) => (isSmallRect(d) ? "" : currency.format(d.data.value)));

    // Tooltip interactions
    nodes
      .on("mouseover", function (event: MouseEvent, d: any) {
        const name = d.data.name as string;
        const pct = d.data.percent.toFixed(1);
        const dollars = currency.format(d.data.value);

        let extra = "";
        if (name === "Farmers") {
          extra = " Farmers grow the cocoa but receive only 6.6% of the final bar.";
        }

        tooltip!
          .style("opacity", "1")
          .html(
            `<strong>${name}</strong>  ${pct}% of the final chocolate price (${dollars})` +
              (extra ? `<br/><span>${extra}</span>` : "")
          );
      })
      .on("mousemove", function (event: MouseEvent) {
        tooltip!
          .style("left", `${event.clientX + 12}px`)
          .style("top", `${event.clientY + 12}px`);
      })
      .on("mouseleave", function () {
        tooltip!.style("opacity", "0");
      });

    // Apply initial highlight
    updateHighlight();
  }

  function updateHighlight() {
    if (!nodes) return;

    const step = steps[currentStep];
    const highlightGroup = step.highlight;

    nodes.each(function (d: any) {
      const group = d3.select(this);
      const dataGroup = d.data.group;

      if (highlightGroup === null) {
        // Show all with full opacity, no highlight outline
        group.selectAll("rect").style("opacity", 1);
        group.selectAll("text").style("opacity", 1);
        group.selectAll(".chunk-rect")
          .attr("stroke", "#2d1509")
          .attr("stroke-width", 1.2);
      } else if (dataGroup === highlightGroup) {
        // Highlight this group with yellow outline
        group.selectAll(".chunk-rect")
          .style("opacity", 1)
          .attr("stroke", "#f4c96b")
          .attr("stroke-width", 2.5);
        group.selectAll(".chunk-gradient").style("opacity", 0.55);
        group.selectAll("text").style("opacity", 1);
      } else {
        // Dim other groups, remove highlight outline
        group.selectAll(".chunk-rect")
          .style("opacity", 0.25)
          .attr("stroke", "#2d1509")
          .attr("stroke-width", 1.2);
        group.selectAll(".chunk-gradient").style("opacity", 0.15);
        group.selectAll("text").style("opacity", 0.3);
      }
    });
  }

  // Set up Intersection Observer for scroll steps
  onMount(() => {
    draw();

    if (!container) return;

    const stepElements = container.querySelectorAll(".scroll-step");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const stepIndex = parseInt(entry.target.getAttribute("data-step") || "0");
            currentStep = stepIndex;
            updateHighlight();
          }
        });
      },
      {
        root: null,
        rootMargin: "-40% 0px -40% 0px",
        threshold: 0
      }
    );

    stepElements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  });

  // Redraw on price change
  $effect(() => {
    if (price) {
      draw();
    }
  });
</script>

<div class="scrolly-container" bind:this={container}>
  <!-- Sticky visualization -->
  <div class="sticky-viz">
    <div class="svg-wrapper" bind:this={svgContainer}></div>
  </div>

  <!-- Scroll steps -->
  <div class="scroll-steps">
    {#each steps as step, i}
      <div class="scroll-step" data-step={i} class:active={currentStep === i}>
        <div class="step-content">
          <h3 class="step-title">{step.title}</h3>
          <p class="step-description">{step.description}</p>
          {#if i === 4}
            <div class="farmer-callout">
              <span class="callout-amount">{currency.format(price * 0.066)}</span>
              <span class="callout-label">of your {currency.format(price)} bar goes to farmers</span>
            </div>
          {/if}
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .scrolly-container {
    position: relative;
    display: flex;
    gap: 2rem;
  }

  .sticky-viz {
    position: sticky;
    top: 20vh;
    height: fit-content;
    flex: 1;
    min-width: 0;
    max-width: 55%;
    align-self: flex-start;
  }

  .svg-wrapper {
    position: relative;
    width: 100%;
  }

  .svg-wrapper :global(svg) {
    display: block;
    border-radius: 10px;
    overflow: visible;
    width: 100%;
    height: auto;
  }

  .scroll-steps {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0;
    padding: 20vh 0;
    min-width: 280px;
  }

  .scroll-step {
    min-height: 80vh;
    display: flex;
    align-items: center;
    padding: 2rem 0;
    opacity: 0.3;
    transition: opacity 0.8s ease;
  }

  .scroll-step.active {
    opacity: 1;
  }

  .step-content {
    background: #fffaf0;
    padding: 20px;
    width: 450px;
    max-width: 100%;
  }

  .step-title {
    color: #000000;
    font-family: "Courier New", courier-std, monospace;
    font-style: normal;
    font-weight: 800;
    font-size: 14px;
    margin: 0 0 10px 0;
    line-height: 1.3;
  }

  .step-description {
    color: #000000;
    font-family: "Courier New", courier-std, monospace;
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: 1.6;
    margin: 0;
  }

  :global(.step-description b),
  :global(.step-description strong) {
    color: tomato;
    font-weight: 800;
  }

  .farmer-callout {
    margin-top: 1rem;
    padding: 1rem;
    background: transparent;
    border: none;
    text-align: center;
  }

  .callout-amount {
    display: block;
    font-family: "gopher", sans-serif;
    font-size: 2rem;
    font-weight: 800;
    color: tomato;
    line-height: 1.2;
  }

  .callout-label {
    display: block;
    font-family: "Courier New", courier-std, monospace;
    font-size: 12px;
    color: #000000;
    margin-top: 0.25rem;
  }

  /* Mobile layout: stack vertically */
  @media (max-width: 900px) {
    .scrolly-container {
      flex-direction: column;
    }

    .sticky-viz {
      position: sticky;
      top: 10vh;
      max-width: 100%;
      z-index: 1;
    }

    .scroll-steps {
      padding: 10vh 0;
    }

    .scroll-step {
      min-height: 70vh;
    }

    .step-content {
      background: rgba(10, 6, 4, 0.95);
    }
  }

  @media (max-width: 600px) {
    .step-title {
      font-size: 1.1rem;
    }

    .step-description {
      font-size: 0.95rem;
    }

    .callout-amount {
      font-size: 1.6rem;
    }

    .scroll-step {
      min-height: 60vh;
    }
  }
</style>
