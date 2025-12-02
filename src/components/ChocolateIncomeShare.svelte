<script lang="ts">
  import * as d3 from "d3";

  let container: HTMLDivElement | null = null;

  // Price of the chosen chocolate bar in dollars (defaults to $1 if nothing passed)
  let { price = 1 } = $props();

  // Base stakeholder shares as fractions of the final price
  const baseShares = [
    { name: "Retailers", share: 0.442 },
    { name: "Manufacturers", share: 0.352 },
    { name: "Processing", share: 0.076 },
    { name: "Farmers", share: 0.066 },
    { name: "Marketing", share: 0.042 },
    { name: "Port of arrival costs", share: 0.011 },
    { name: "Inland transport", share: 0.005 },
    { name: "International traders", share: 0.002 },
    { name: "International transport", share: 0.003 }
  ];

  const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  });

  function draw() {
    if (!container) return;

    const margin = { top: 10, right: 10, bottom: 10, left: 10 };

    // Use container width to keep a bar-like aspect ratio (about 3:2)
    const bounds = container.getBoundingClientRect();
    const fullWidth = bounds.width || 640;
    const width = fullWidth - margin.left - margin.right;
    const height = (fullWidth * 2) / 3 - margin.top - margin.bottom;

    const rootSelection = d3.select(container);

    // Clear any existing contents (for prop changes or re-mounts)
    rootSelection.selectAll("*").remove();

    // Turn shares into dollar values and percentages for this specific price
    const data = baseShares.map((d) => ({
      name: d.name,
      share: d.share,
      value: d.share * price,
      percent: d.share * 100
    }));

    const rootData = {
      name: "Chocolate bar",
      children: data
    };

    const svg = rootSelection
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // --- Chocolate styling defs (gradient + drop shadow) ---
    const defs = svg.append("defs");

    const gradient = defs
      .append("linearGradient")
      .attr("id", "chunkGradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#8b4a20"); // highlight at top

    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#4b2510"); // deeper tone at bottom

    const dropShadow = defs
      .append("filter")
      .attr("id", "barShadow")
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

    // Chocolate color scale for variation between chunks
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

    // --- Build hierarchy & treemap layout ---
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

    // Group with drop shadow applied to whole bar
    const barGroup = svg.append("g").attr("filter", "url(#barShadow)");

    const nodes = barGroup
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

    // Tooltip div (fixed to viewport, follows the cursor)
    const tooltip = rootSelection
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
      .attr("stroke", (d: any) => (d.data.name === "Farmers" ? "#f4c96b" : "#2d1509"))
      .attr("stroke-width", (d: any) => (d.data.name === "Farmers" ? 2 : 1.2));

    // Gradient overlay for beveled effect
    nodes
      .append("rect")
      .attr("class", "chunk-gradient")
      .attr("width", (d: any) => d.x1 - d.x0)
      .attr("height", (d: any) => d.y1 - d.y0)
      .attr("rx", 6)
      .attr("ry", 6)
      .attr("fill", "url(#chunkGradient)")
      .attr("opacity", 0.55);

    // Labels: stakeholder name (if space) + percentage
    nodes
      .append("text")
      .attr("class", "chunk-label-name")
      .attr("x", 8)
      .attr("y", 18)
      .attr("fill", "#fdf1dd")
      .attr("font-size", 11)
      .attr("font-weight", 600)
      .style("pointer-events", "none")
      .text((d: any) => (isSmallRect(d) ? "" : d.data.name));

    nodes
      .append("text")
      .attr("class", "chunk-label-value")
      .attr("x", 8)
      .attr("y", (d: any) => (isSmallRect(d) ? 18 : 34))
      .attr("fill", "#fdf5e6")
      .attr("font-size", 11)
      .style("pointer-events", "none")
      // For very small rectangles, skip the in-bar dollar label and rely on tooltip only
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

        tooltip
          .style("opacity", "1")
          .html(
            `<strong>${name}</strong>  ${pct}% of the final chocolate price (${dollars})` +
              (extra ? `<br/><span>${extra}</span>` : "")
          );
      })
      .on("mousemove", function (event: MouseEvent) {
        tooltip
          .style("left", `${event.clientX + 12}px`)
          .style("top", `${event.clientY + 12}px`);
      })
      .on("mouseleave", function () {
        tooltip.style("opacity", "0");
      });
  }

  // Redraw whenever the container is ready or the price changes
  $effect(() => {
    draw();
  });
</script>

<div
  class="income-share-viz"
  bind:this={container}
  aria-label="Chocolate bar income share treemap"
></div>

<style>
  .income-share-viz {
    position: relative;
    max-width: 720px;
    margin: 0 auto;
  }

  .income-share-viz svg {
    display: block;
    border-radius: 10px;
    overflow: visible;
  }

  .income-tooltip {
    pointer-events: none;
  }
</style>
