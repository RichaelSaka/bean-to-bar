<script lang="ts">
  import { onMount } from "svelte";
  import * as d3 from "d3";

  // Props for sizing the small multiples (optional overrides)
  let { width = 220, height = 220 } = $props();

  let container: HTMLDivElement | null = null;

  // Static conglomerate → brand data
  const conglomerates = [
    {
      name: "Ferrero",
      children: [
        "Baby Ruth",
        "Blue Bunny",
        "Blue Ribbon",
        "Butterfinger",
        "Crunch",
        "Duplo",
        "Eat Natural",
        "Famous Amos",
        "Fanny May",
        "Ferrero Kusschen",
        "Fiesta Ferrero",
        "Ferrero Collection",
        "Ferrero Pralines",
        "Ferrero Rocher",
        "Fulfil",
        "Halo Top",
        "Hanuta",
        "Keebler",
        "Kinder Surprise",
        "Kinder Bueno",
        "Little Brownie Bakers",
        "Mon Cheri",
        "Nutella",
        "Nutella & Go!",
        "Power Crunch",
        "Raffaello",
        "Thorntons"
      ].map((name) => ({ name }))
    },
    {
      name: "Nestlé",
      children: [
        "Aero",
        "After Eight",
        "Allen's",
        "Cailler",
        "Chokito",
        "Crunch",
        "Garoto",
        "Kit Kat",
        "Milo",
        "Milkybar",
        "Nesquik",
        "Nestlé",
        "Peppermint Crisp",
        "Perugina",
        "Quality Street",
        "Rolo",
        "Smarties",
        "Toll House"
      ].map((name) => ({ name }))
    },
    {
      name: "Mars",
      children: [
        "AMERICAN HERITAGE",
        "ASSORTED REVELS",
        "BALISTO",
        "BOUNTY",
        "CELEBRATIONS",
        "COCOAVIA",
        "CONEJOS",
        "CUIXIANGMI",
        "DOVE / GALAXY",
        "ETHEL M",
        "HOTEL CHOCOLAT",
        "JEWELS (BY GALAXY)",
        "KORKUNOV",
        "M&M'S",
        "MALTESERS",
        "MARS",
        "MILKY WAY",
        "SNICKERS",
        "THREE MUSKETEERS",
        "TURIN",
        "TWIX"
      ].map((name) => ({ name }))
    },
    {
      name: "Hershey's",
      children: [
        "5th Avenue",
        "Bark Things",
        "Cookies 'n Crème",
        "Heath",
        "Kisses",
        "Kit Kat (US only)",
        "Lily's",
        "Milk Duds",
        "Mr GoodBar",
        "Nuggets",
        "Reese's",
        "Take 5",
        "Whoppers",
        "Whoozeewhatzit",
        "York"
      ].map((name) => ({ name }))
    },
    {
      name: "Mondelez",
      children: [
        "Cadbury",
        "Daim",
        "Freia",
        "Fry's",
        "Marabou",
        "Milka",
        "Toblerone",
        "Oreo",
        "Chips Ahoy!",
        "Lacta",
        "Cote d’Or",
        "Trident",
        "Belvita",
        "Ritz",
        "Barny"
      ].map((name) => ({ name }))
    },
    {
      name: "Lindt & Sprüngli",
      children: [
        "Lindt",
        "Ghirardelli",
        "Russell Stover",
        "Whitman's",
        "Caffarel",
        "Hofbauer",
        "Küfferle"
      ].map((name) => ({ name }))
    }
  ];

  onMount(() => {
    if (!container) return;

    const rootSelection = d3.select(container);

    // Clear in case of HMR
    rootSelection.selectAll("*").remove();

    // Keep references to simulations so we can stop them on unmount
    const simulations: d3.Simulation<d3.HierarchyCircularNode<any>, undefined>[] = [];

    // Color palette keyed by conglomerate name
    const color = d3
      .scaleOrdinal<string, string>()
      .domain(conglomerates.map((d) => d.name))
      .range(d3.schemeSet2);

    // Tooltip div – fixed to viewport, follows the cursor
    const tooltip = rootSelection
      .append("div")
      .attr("class", "tooltip")
      .style("position", "fixed")
      .style("visibility", "hidden")
      .style("opacity", 1)
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px")
      .style("color", "#111");

    const mouseover = function () {
      tooltip.style("visibility", "visible");
    };

    const mousemove = function (event: MouseEvent, d: d3.HierarchyCircularNode<any>) {
      tooltip
        .html("<u>" + d.data.name + "</u><br>Owned by " + d.parent.data.name)
        .style("left", event.clientX + 12 + "px")
        .style("top", event.clientY - 32 + "px");
    };

    const mouseleave = function () {
      tooltip.style("visibility", "hidden");
    };

    // One packed layout per conglomerate (small multiples)
    conglomerates.forEach((conglomerate) => {
      const root = d3
        .hierarchy(conglomerate)
        .sum((d: any) => (d.children ? 0 : 1)); // each brand has weight 1

      // Add an inner margin so circles don't get clipped at the SVG edge
      const margin = 30;
      const innerWidth = width - margin * 2;
      const innerHeight = height - margin * 2;

      const pack = d3
        .pack<any>()
        .size([innerWidth, innerHeight])
        .padding(4);

      const packedRoot = pack(root);
      // Brand nodes only
      const leaves = packedRoot.leaves();

      // Store original packed positions so forces can gently pull back to them
      leaves.forEach((d: any) => {
        d.x0 = d.x;
        d.y0 = d.y;
      });

      const svg = rootSelection
        .append("svg")
        .attr("width", width)
        .attr("height", height + 40); // space for label

      // Shift the packed layout into the inner margin area
      const g = svg.append("g").attr("transform", `translate(${margin}, ${margin})`);

      const nodes = g
        .selectAll<SVGCircleElement, d3.HierarchyCircularNode<any>>("circle")
        .data(leaves)
        .join("circle")
        .attr("class", "node")
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y)
        .attr("r", (d) => d.r)
        .style("fill", () => color(conglomerate.name))
        .style("fill-opacity", 0.85)
        .attr("stroke", "black")
        .style("stroke-width", 1)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

      // Very subtle, continuous jitter using a tiny force simulation.
      // We do NOT recompute the pack layout; we start from packed positions
      // and constrain movement to a small window around each node's original center.
      const maxOffset = 2;

      const simulation = d3
        .forceSimulation<d3.HierarchyCircularNode<any>>(leaves)
        .alpha(0.3)
        .alphaDecay(0) // run forever
        .velocityDecay(0.9) // smooth drifting
        .force("charge", d3.forceManyBody().strength(0.1))
        .force(
          "x",
          // gentle pull back to original x0
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          // @ts-ignore
          d3.forceX((d: any) => d.x0).strength(0.03)
        )
        .force(
          "y",
          // gentle pull back to original y0
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          // @ts-ignore
          d3.forceY((d: any) => d.y0).strength(0.03)
        )
        .on("tick", () => {
          leaves.forEach((d: any) => {
            const dx = d.x - d.x0;
            const dy = d.y - d.y0;

            // Clamp movement so nodes never drift more than ±2px
            if (dx > maxOffset) d.x = d.x0 + maxOffset;
            if (dx < -maxOffset) d.x = d.x0 - maxOffset;
            if (dy > maxOffset) d.y = d.y0 + maxOffset;
            if (dy < -maxOffset) d.y = d.y0 - maxOffset;
          });

          // Only update cx/cy – radius and colors stay from the pack layout
          nodes.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
        });

      simulations.push(simulation);

      // Label for each conglomerate (underneath)
      svg
        .append("text")
        .attr("class", "conglomerate-label")
        .attr("x", width / 2)
        .attr("y", height + 20)
        .attr("text-anchor", "middle")
        .text(conglomerate.name);
    });

    // Cleanup on unmount
    return () => {
      simulations.forEach((sim) => sim.stop());
      rootSelection.selectAll("*").remove();
    };
  });
</script>

<div
  id="conglomerate-viz"
  class="conglomerate-viz"
  bind:this={container}
  aria-label="Chocolate conglomerate brand clusters"
></div>

<style>
  .conglomerate-viz {
    position: relative;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1.5rem;
    justify-items: center;
    align-items: flex-start;
    padding: 1rem 0 0.5rem;
  }

  .conglomerate-viz svg {
    overflow: visible;
  }

  .node {
    transition: transform 120ms ease-out, box-shadow 120ms ease-out;
  }

  .node:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.25);
  }

  .conglomerate-label {
    font-size: 0.85rem;
    fill: rgba(255, 248, 240, 0.95);
    letter-spacing: 0.03em;
    font-weight: 500;
  }

  /* Tooltip styling, D3-example style */
  .tooltip {
    pointer-events: none;
    font-size: 0.8rem;
    color: #111;
    background-color: white;
    border: solid 2px #333;
    border-radius: 5px;
    padding: 5px;
    white-space: nowrap;
    z-index: 999;
  }
</style>
