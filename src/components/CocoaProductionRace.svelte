<script lang="ts">
  import { onMount } from "svelte";
  import * as d3 from "d3";

  // --- 1. Configuration ---
  const CONFIG = {
    DATA_FILE: "/data/cocoa_data.csv",
    START_YEAR: 1963,
    END_YEAR: 2023,
    DEFAULT_YEAR: 2023,
    MAX_COUNTRIES: 80,
    SIMULATION_ITERATIONS: 250,
    MIN_RADIUS: 6,
    MAX_RADIUS: 64
  };

  // --- 2. DOM References (using bind:this) ---
  let heroSection: HTMLElement;
  let storyContainer: HTMLElement;
  let bubbleViz: SVGSVGElement;
  let vizPrompt: HTMLDivElement;
  let storyHeadline: HTMLHeadingElement;
  let storyCopy: HTMLParagraphElement;
  let stepCounter: HTMLParagraphElement;
  let startStoryButton: HTMLButtonElement;
  let nextStepButton: HTMLButtonElement;
  let timelineControls: HTMLDivElement;
  let yearSlider: HTMLInputElement;
  let yearLabel: HTMLSpanElement;
  let tooltip: HTMLDivElement;
  let tooltipCountry: HTMLDivElement;
  let tooltipProduction: HTMLDivElement;
  let tooltipShare: HTMLDivElement;
  let bigNumberValue: HTMLDivElement;

  // --- 3. Global State ---
  let dataByYear = new Map();
  let yearTotals = new Map();
  let globalMaxCountry = 0;
  let currentYear = CONFIG.DEFAULT_YEAR;
  let currentStepIndex = 0;
  let nodes: any[] = [];
  let width = 800;
  let height = 560;
  const nodeState = new Map();
  let dataReady = false;
  let dataReadyResolvers: (() => void)[] = [];

  // --- 4. D3 Helpers ---
  const formatTonnes = d3.format(".2s");
  const formatPercent = d3.format(".1%");

  function getContinent(country: string): string {
    // Africa
    if ([
      "Côte d'Ivoire", "Ghana", "Nigeria", "Cameroon", "Angola", "Uganda", "Togo",
      "Sierra Leone", "Liberia", "Madagascar", "Benin", "Equatorial Guinea", "Guinea",
      "Guinea-Bissau", "Mozambique", "Gabon", "Rwanda", "Burundi", "Comoros",
      "Central African Republic", "Congo", "Democratic Republic of the Congo",
      "Ethiopia", "United Republic of Tanzania", "Sao Tome and Principe",
      "Algeria", "Botswana", "Burkina Faso", "Cabo Verde", "Chad", "Djibouti",
      "Egypt", "Eritrea", "Eswatini", "Gambia", "Kenya", "Lesotho", "Libya",
      "Malawi", "Mali", "Mauritania", "Mauritius", "Morocco", "Namibia", "Niger",
      "Senegal", "Seychelles", "Somalia", "South Africa", "South Sudan", "Sudan",
      "Zambia", "Zimbabwe"
    ].includes(country)) return "Africa";

    // Asia
    if ([
      "Indonesia", "Malaysia", "Papua New Guinea", "India", "Philippines", "Viet Nam",
      "Sri Lanka", "Thailand", "Timor-Leste", "Yemen", "Afghanistan", "Armenia",
      "Azerbaijan", "Bahrain", "Bangladesh", "Bhutan", "Brunei Darussalam",
      "Cambodia", "China", "Georgia", "Iran (Islamic Republic of)", "Iraq", "Israel",
      "Japan", "Jordan", "Kazakhstan", "Kuwait", "Kyrgyzstan", "Lao People's Democratic Republic",
      "Lebanon", "Maldives", "Mongolia", "Myanmar", "Nepal", "Oman", "Pakistan",
      "Qatar", "Republic of Korea", "Saudi Arabia", "Singapore", "Syrian Arab Republic",
      "Tajikistan", "Turkmenistan", "United Arab Emirates", "Uzbekistan"
    ].includes(country)) return "Asia";

    // Europe
    if ([
      "Albania", "Andorra", "Austria", "Belarus", "Belgium", "Bosnia and Herzegovina",
      "Bulgaria", "Croatia", "Cyprus", "Czech Republic", "Denmark", "Estonia",
      "Finland", "France", "Germany", "Greece", "Hungary", "Iceland", "Ireland",
      "Italy", "Latvia", "Liechtenstein", "Lithuania", "Luxembourg", "Malta",
      "Monaco", "Montenegro", "Netherlands", "North Macedonia", "Norway", "Poland",
      "Portugal", "Republic of Moldova", "Romania", "San Marino", "Serbia",
      "Slovakia", "Slovenia", "Spain", "Sweden", "Switzerland", "Ukraine",
      "United Kingdom"
    ].includes(country)) return "Europe";

    // North America
    if ([
      "Antigua and Barbuda", "Bahamas", "Barbados", "Belize", "Canada", "Costa Rica",
      "Cuba", "Dominica", "Dominican Republic", "El Salvador", "Grenada", "Guatemala",
      "Haiti", "Honduras", "Jamaica", "Mexico", "Nicaragua", "Panama",
      "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines",
      "Trinidad and Tobago", "United States of America"
    ].includes(country)) return "North America";

    // South America
    if ([
      "Ecuador", "Brazil", "Peru", "Colombia", "Dominican Republic",
      "Venezuela (Bolivarian Republic of)", "Mexico", "Bolivia (Plurinational State of)",
      "Panama", "Costa Rica", "Honduras", "Nicaragua", "El Salvador", "Guatemala",
      "Belize", "Trinidad and Tobago", "Jamaica", "Cuba", "Haiti", "Suriname",
      "Guyana", "Grenada", "Dominica", "Saint Lucia", "Saint Vincent and the Grenadines",
      "Argentina", "Chile", "Paraguay", "Uruguay"
    ].includes(country)) return "South America";

    // Oceania
    if ([
      "Australia", "Fiji", "Kiribati", "Marshall Islands", "Micronesia (Federated States of)",
      "Nauru", "New Zealand", "Palau", "Papua New Guinea", "Samoa", "Solomon Islands",
      "Tonga", "Tuvalu", "Vanuatu"
    ].includes(country)) return "Oceania";

    // Antarctica
    if (["Antarctica"].includes(country)) return "Antarctica";

    return "Other";
  }

  const continentColorScale = d3.scaleOrdinal()
    .domain(["Africa", "Asia", "Europe", "North America", "South America", "Oceania", "Antarctica", "Other"])
    .range([
      "#F5C553", // Africa
      "#5A8BFF", // Asia
      "#B17DFF", // Europe
      "#6CCB8C", // North America
      "#FF7B89", // South America
      "#4DD0E1", // Oceania
      "#CCCCCC", // Antarctica
      "#AAAAAA"  // Other
    ]);

  const radiusScale = d3.scaleSqrt()
    .range([CONFIG.MIN_RADIUS * 1.4, CONFIG.MAX_RADIUS * 1.4]);

  // --- 5. Step Definitions ---
  const steps = [
    {
      id: "cluster",
      layout: "cluster",
      headline: "WHERE DOES CHOCOLATE COME FROM?",
      copy: "Before you take your next bite, consider the supply chain. Every circle on the left is a country, sized by its cocoa harvest in 2023.",
      prompt: "",
      year: CONFIG.DEFAULT_YEAR
    },
    {
      id: "reveal",
      layout: "highlight",
      headline: "TWO FARMS FEED THE WORLD.",
      copy: "<strong>Côte d'Ivoire</strong> and <strong>Ghana</strong> account for well over half of global cocoa.",
      prompt: "",
      year: CONFIG.DEFAULT_YEAR
    },
    {
      id: "continent",
      layout: "continent",
      headline: "AFRICA CARRIES THE HARVEST.",
      copy: "When we regroup these countries by continent, Africa's cluster dwarfs the rest. The world's chocolate depends on just one region.",
      prompt: "",
      year: CONFIG.DEFAULT_YEAR
    },
    {
      id: "timeline",
      layout: "timeline",
      headline: "SIXTY YEARS OF COCOA SUPPLY.",
      copy: "Drag the slider to watch production shift from 1963 to 2023. Africa stays dominant, but watch Indonesia and Brazil rise and fall along the way.",
      year: CONFIG.START_YEAR,
      showSlider: true
    }
  ];

  // --- 6. Functions ---
  function animateBigNumber(targetValue: number) {
    const bigNumberSelection = d3.select(bigNumberValue);

    bigNumberSelection
      .interrupt()
      .text(formatTonnes(0));

    bigNumberSelection
      .transition()
      .duration(2000)
      .ease(d3.easeCubicOut)
      .tween("text", () => {
        const interpolate = d3.interpolateNumber(0, targetValue);
        return (t: number) => {
          bigNumberSelection.text(formatTonnes(interpolate(t)));
        };
      });
  }

  function resize() {
    const vizShell = d3.select(bubbleViz.parentElement);
    const bounds = vizShell.node()?.getBoundingClientRect();
    if (bounds) {
      width = bounds.width;
      height = bounds.height;
      d3.select(bubbleViz).attr("viewBox", `0 0 ${width} ${height}`);
    }
  }

  function computeContinentCenters() {
    return {
      "Africa": { x: width * 0.18, y: height * 0.55 },
      "North America": { x: width * 0.40, y: height * 0.35 },
      "South America": { x: width * 0.50, y: height * 0.70 },
      "Europe": { x: width * 0.55, y: height * 0.25 },
      "Asia": { x: width * 0.70, y: height * 0.40 },
      "Oceania": { x: width * 0.85, y: height * 0.60 },
      "Antarctica": { x: width * 0.50, y: height * 0.90 },
      "Other": { x: width * 0.10, y: height * 0.25 }
    };
  }

  function buildNodesForYear(year: number) {
    const countryMap = dataByYear.get(year);
    if (!countryMap) return [];

    const total = yearTotals.get(year) || 1;
    const entries = Array.from(countryMap, ([country, production]) => ({
      id: country,
      country,
      production,
      continent: getContinent(country),
      share: production / total
    }));

    entries.sort((a, b) => b.production - a.production);
    const selected = entries.slice(0, CONFIG.MAX_COUNTRIES);

    selected.forEach((node, index) => {
      node.rank = index + 1;
      const previous = nodeState.get(node.country);
      node.x = previous ? previous.x : width / 2 + (Math.random() - 0.5) * 30;
      node.y = previous ? previous.y : height / 2 + (Math.random() - 0.5) * 30;
      node.radius = radiusScale(node.production);
    });

    return selected;
  }

  function runSimulation(layout: string, nodes: any[]) {
    const center = { x: width / 2, y: height / 2 };
    const continentCenters = computeContinentCenters();

    const forceX = d3.forceX((node: any) => {
      if (layout === "continent" || layout === "timeline") {
        const anchor = continentCenters[node.continent] || center;
        return anchor.x;
      }
      if (layout === "highlight" && node.rank <= 2) {
        const offset = node.rank === 1 ? -width * 0.12 : width * 0.12;
        return center.x + offset;
      }
      return center.x;
    }).strength(layout === "cluster" ? 0.05 : 0.12);

    const forceY = d3.forceY((node: any) => {
      if (layout === "continent" || layout === "timeline") {
        const anchor = continentCenters[node.continent] || center;
        return anchor.y;
      }
      return center.y;
    }).strength(layout === "cluster" ? 0.05 : 0.12);

    const simulation = d3.forceSimulation(nodes)
      .force("x", forceX)
      .force("y", forceY)
      .force("collide", d3.forceCollide((node: any) => node.radius + 3))
      .stop();

    for (let i = 0; i < CONFIG.SIMULATION_ITERATIONS; i += 1) {
      simulation.tick();
    }

    nodes.forEach((node) => {
      nodeState.set(node.country, { x: node.x, y: node.y });
    });
  }

  function updateTooltip(event: MouseEvent, node: any) {
    tooltip.style.left = `${event.pageX}px`;
    tooltip.style.top = `${event.pageY - 20}px`;

    tooltipCountry.textContent = node.country.toUpperCase();
    tooltipProduction.textContent = `${formatTonnes(node.production)} tonnes`;
    tooltipShare.textContent = `${formatPercent(node.share)} of global harvest`;
  }

  function showTooltip(event: MouseEvent, node: any) {
    tooltip.classList.remove("hidden");
    updateTooltip(event, node);
  }

  function hideTooltip() {
    tooltip.classList.add("hidden");
  }

  function renderNodes(step: any) {
    const layout = step.layout;
    const highlightStep = step.id === "reveal";
    const svg = d3.select(bubbleViz);
    const nodesSelection = svg.selectAll(".bubble-group")
      .data(nodes, (d: any) => d.country);

    const nodesEnter = nodesSelection.enter()
      .append("g")
      .attr("class", "bubble-group")
      .attr("transform", (d: any) => `translate(${d.x}, ${d.y})`)
      .style("opacity", 0);

    nodesEnter.append("circle")
      .attr("r", 0)
      .attr("fill", (d: any) => continentColorScale(d.continent))
      .on("mouseenter", (event: any, d: any) => {
        d3.select(event.currentTarget.parentNode).classed("show-label", true);
        showTooltip(event, d);
      })
      .on("mousemove", (event: any, d: any) => updateTooltip(event, d))
      .on("mouseleave", (event: any) => {
        d3.select(event.currentTarget.parentNode).classed("show-label", false);
        hideTooltip();
      });

    nodesEnter.append("text")
      .attr("class", "bubble-label")
      .attr("y", 4)
      .text((d: any) => d.country);

    const nodesMerged = nodesEnter.merge(nodesSelection as any);

    nodesMerged
      .transition()
      .duration(650)
      .attr("transform", (d: any) => `translate(${d.x}, ${d.y})`)
      .style("opacity", 1);

    nodesMerged
      .classed("muted", (d: any) => highlightStep && d.rank > 2)
      .classed("highlight", (d: any) => highlightStep && d.rank <= 2)
      .classed("show-label", false);

    nodesMerged.select("circle")
      .transition()
      .duration(650)
      .attr("r", (d: any) => d.radius)
      .attr("fill", (d: any) => continentColorScale(d.continent))
      .attr("opacity", (d: any) => highlightStep && d.rank > 2 ? 0.2 : 1);

    nodesMerged.select(".bubble-label")
      .transition()
      .duration(500)
      .attr("y", (d: any) => d.radius / 2 + 12);

    nodesSelection.exit()
      .transition()
      .duration(400)
      .style("opacity", 0)
      .remove();

    const continentLabelsData = (layout === "continent" || layout === "timeline")
      ? d3.groups(nodes, (d: any) => d.continent).map(([continent]) => {
        const anchor = computeContinentCenters()[continent] || { x: width / 2, y: height / 2 };
        return { continent, ...anchor };
      })
      : [];

    const continentLabels = svg.selectAll(".continent-label")
      .data(continentLabelsData, (d: any) => d.continent);

    continentLabels.enter()
      .append("text")
      .attr("class", "continent-label")
      .attr("x", (d: any) => d.x)
      .attr("y", (d: any) => d.y - 50)
      .style("opacity", 0)
      .text((d: any) => d.continent)
      .transition()
      .duration(500)
      .style("opacity", 1);

    continentLabels
      .transition()
      .duration(500)
      .attr("x", (d: any) => d.x)
      .attr("y", (d: any) => d.y - 50);

    continentLabels.exit()
      .transition()
      .duration(300)
      .style("opacity", 0)
      .remove();
  }

  function renderStep(step: any) {
    storyHeadline.textContent = step.headline;
    storyCopy.innerHTML = step.copy;
    stepCounter.textContent = `Step ${currentStepIndex + 1} of ${steps.length}`;

    if (step.prompt) {
      vizPrompt.textContent = step.prompt;
      vizPrompt.classList.add("visible");
    } else {
      vizPrompt.classList.remove("visible");
    }

    yearLabel.textContent = `Year: ${currentYear}`;
    timelineControls.classList.toggle("hidden", !step.showSlider);
    nextStepButton.textContent = currentStepIndex === steps.length - 1 ? "Restart ↺" : "Next ▸";

    const targetYear = step.showSlider ? currentYear : step.year;
    currentYear = targetYear;
    yearSlider.value = String(currentYear);

    nodes = buildNodesForYear(currentYear);
    nodes.forEach((node: any) => {
      node.highlight = step.id === "reveal" && node.rank <= 2;
    });

    runSimulation(step.layout, nodes);
    renderNodes(step);
  }

  function setStep(index: number) {
    currentStepIndex = index;
    const step = steps[currentStepIndex];
    renderStep(step);
  }

  function handleNextStep() {
    if (currentStepIndex === steps.length - 1) {
      currentStepIndex = 0;
      currentYear = steps[0].year;
    } else {
      currentStepIndex += 1;
      currentYear = steps[currentStepIndex].year;
    }
    setStep(currentStepIndex);
  }

  function updateYearFromSlider(value: number) {
    currentYear = value;
    yearLabel.textContent = `Year: ${currentYear}`;
    nodes = buildNodesForYear(currentYear);
    const step = steps[currentStepIndex];
    runSimulation(step.layout, nodes);
    renderNodes(step);
  }

  function loadData() {
    d3.csv(CONFIG.DATA_FILE, (d: any) => {
      if (d.Element !== "Production") return null;
      return {
        year: +d.Year,
        country: d.Area.trim(),
        production: +d.Value
      };
    }).then((data: any) => {
      const filtered = data.filter(Boolean).filter((d: any) => d.year >= CONFIG.START_YEAR && d.year <= CONFIG.END_YEAR);

      dataByYear = d3.rollup(
        filtered,
        (values: any) => d3.rollup(values, (v: any) => d3.sum(v, (d: any) => d.production), (d: any) => d.country),
        (d: any) => d.year
      );

      dataByYear.forEach((countryMap, year) => {
        let yearTotal = 0;
        countryMap.forEach((value: number) => {
          yearTotal += value;
          if (value > globalMaxCountry) globalMaxCountry = value;
        });
        yearTotals.set(year, yearTotal);
      });

      radiusScale.domain([0, globalMaxCountry]);

      const total2023 = yearTotals.get(CONFIG.DEFAULT_YEAR) || 0;
      animateBigNumber(total2023);

      dataReady = true;
      dataReadyResolvers.forEach((fn) => fn());
      dataReadyResolvers = [];
    }).catch((error: any) => {
      console.error("Error loading or parsing data:", error);
      vizPrompt.classList.add("visible");
      vizPrompt.textContent = "We couldn't load the cocoa data. Please check the CSV file path.";
    });
  }

  onMount(() => {
    // Attach event listeners
    startStoryButton.addEventListener("click", async () => {
      heroSection.classList.add("hidden");
      storyContainer.classList.remove("hidden");
      resize();
      nodeState.clear();
      currentYear = steps[0].year;
      if (!dataReady) {
        vizPrompt.textContent = "Loading cocoa data…";
        vizPrompt.classList.add("visible");
        await new Promise<void>((resolve) => dataReadyResolvers.push(resolve));
        vizPrompt.classList.remove("visible");
      }
      setStep(0);
    });

    nextStepButton.addEventListener("click", handleNextStep);

    yearSlider.addEventListener("input", (event: any) => {
      const value = +event.target.value;
      if (steps[currentStepIndex].showSlider) {
        updateYearFromSlider(value);
      }
    });

    let resizeTimeout: number;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        if (!storyContainer.classList.contains("hidden")) {
          resize();
          const step = steps[currentStepIndex];
          nodes = buildNodesForYear(currentYear);
          runSimulation(step.layout, nodes);
          renderNodes(step);
        }
      }, 150);
    };
    window.addEventListener("resize", handleResize);

    // Load data
    loadData();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });
</script>

<!-- Hero -->
<section class="cocoa-race-wrapper" aria-label="Global Cocoa Production Story">
  <section class="hero" bind:this={heroSection}>
    <div class="hero-inner">
      <div class="big-number-container">
        <div class="big-number" bind:this={bigNumberValue}>0</div>
        <div class="subtitle">Tonnes of global cocoa harvested in 2023</div>
        <div class="subtitle secondary">Two countries provide most of it.</div>
      </div>
      <button class="cta-button" bind:this={startStoryButton}>Start the story ▸</button>
    </div>
  </section>

  <!-- Story -->
  <main class="story hidden" bind:this={storyContainer}>
    <div class="story-layout">
      <div class="viz-shell">
        <svg bind:this={bubbleViz}></svg>
        <div class="viz-overlay" bind:this={vizPrompt}></div>
      </div>
      <aside class="story-panel">
        <p class="step-count" bind:this={stepCounter}>Step 1 of 4</p>
        <h2 class="story-headline" bind:this={storyHeadline}>Where does chocolate come from?</h2>
        <p class="story-copy" bind:this={storyCopy}>
          Before you take your next bite, consider the supply chain. Each circle on the left is a country, sized by its cocoa harvest in 2023.
        </p>
        <div class="story-actions">
          <button class="cta-button" bind:this={nextStepButton}>Next ▸</button>
        </div>
      </aside>
    </div>

    <div class="timeline-controls hidden" bind:this={timelineControls}>
      <div class="timeline-label">
        <span bind:this={yearLabel}>Year: 1963</span>
      </div>
      <input type="range" bind:this={yearSlider} min="1963" max="2023" value="1963" step="1">
      <p class="timeline-caption">Drag the slider to see the year.</p>
    </div>
  </main>

  <div class="tooltip hidden" bind:this={tooltip}>
    <div class="tooltip-country" bind:this={tooltipCountry}></div>
    <div class="tooltip-production" bind:this={tooltipProduction}></div>
    <div class="tooltip-share" bind:this={tooltipShare}></div>
  </div>
</section>

<style>
  .cocoa-race-wrapper {
    width: 100%;
    max-width: 100%;
  }

  .hidden {
    display: none !important;
  }

  .hero {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    text-align: center;
  }

  .hero-inner {
    max-width: 720px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
  }

  .big-number-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }

  .big-number {
    font-size: clamp(4.5rem, 12vw, 9rem);
    font-weight: 900;
    letter-spacing: -0.04em;
    background: linear-gradient(120deg, #fef2c0 0%, #f5c553 50%, #a47300 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 4s ease-in-out infinite;
  }

  .subtitle {
    font-size: clamp(1.1rem, 2.6vw, 1.6rem);
    color: rgba(255, 255, 255, 0.72);
    font-weight: 400;
  }

  .subtitle.secondary {
    font-size: clamp(1rem, 2.4vw, 1.4rem);
    color: rgba(255, 255, 255, 0.55);
    font-weight: 300;
  }

  .cta-button {
    border: none;
    background: linear-gradient(120deg, #a47300 0%, #e1b058 100%);
    color: #fff;
    font-size: 1rem;
    font-weight: 600;
    padding: 0.85rem 1.8rem;
    border-radius: 999px;
    box-shadow: 0 12px 24px rgba(164, 115, 0, 0.35);
    cursor: pointer;
    transition: transform 0.25s ease, box-shadow 0.25s ease, filter 0.25s ease;
  }

  .cta-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 16px 32px rgba(164, 115, 0, 0.45);
    filter: brightness(1.05);
  }

  .cta-button:active {
    transform: translateY(1px);
    box-shadow: 0 8px 16px rgba(164, 115, 0, 0.35);
  }

  .story {
    padding: 4rem 5vw 6rem;
    display: flex;
    flex-direction: column;
    gap: 3rem;
  }

  .story-layout {
    display: grid;
    gap: 3rem;
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
    align-items: stretch;
  }

  .viz-shell {
    position: relative;
    background: rgba(18, 18, 18, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 28px;
    backdrop-filter: blur(18px);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
    overflow: hidden;
    min-height: 560px;
  }

  .viz-shell svg {
    width: 100%;
    height: 100%;
  }

  .viz-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    text-align: center;
    padding: 2rem;
    font-size: 1.1rem;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;
    opacity: 0;
    transition: opacity 0.35s ease;
  }

  .viz-overlay.visible {
    opacity: 1;
  }

  .story-panel {
    padding: 2.5rem 2rem;
    background: rgba(28, 17, 13, 0.78);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 28px;
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .step-count {
    display: none;
  }

  .story-headline {
    font-size: clamp(1.8rem, 3vw, 2.3rem);
    line-height: 1.25;
    font-weight: 800;
    background: linear-gradient(120deg, #e4c698 0%, #b8864f 50%, #704214 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }

  .story-copy {
    font-size: clamp(1rem, 2vw, 1.15rem);
    color: rgba(255, 255, 255, 0.78);
  }

  .story-copy :global(strong) {
    color: #b8864f;
    font-weight: 600;
  }

  .story-actions {
    margin-top: auto;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .timeline-controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem 2rem 2rem;
    background: rgba(15, 15, 15, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    max-width: 640px;
    align-self: center;
    box-shadow: 0 18px 42px rgba(0, 0, 0, 0.35);
  }

  .timeline-label {
    font-size: 0.95rem;
    letter-spacing: 0.08em;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    font-weight: 600;
  }

  input[type="range"] {
    width: 100%;
    -webkit-appearance: none;
    appearance: none;
    height: 6px;
    border-radius: 999px;
    background: linear-gradient(90deg, #b8864f 0%, #e1b058 100%);
    outline: none;
    cursor: pointer;
  }

  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
    border: 3px solid #a47300;
    cursor: pointer;
  }

  input[type="range"]::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
    border: 3px solid #a47300;
    cursor: pointer;
  }

  .timeline-caption {
    font-size: 0.95rem;
    color: rgba(255, 255, 255, 0.6);
    text-align: center;
  }

  .tooltip {
    position: absolute;
    pointer-events: none;
    background: rgba(15, 15, 15, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 16px;
    padding: 0.75rem 1rem;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
    transform: translate(-50%, -120%);
    min-width: 180px;
    z-index: 30;
  }

  .tooltip.hidden {
    opacity: 0;
    visibility: hidden;
  }

  .tooltip-country {
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 0.85rem;
    margin-bottom: 0.35rem;
  }

  .tooltip-production {
    font-size: 1rem;
    font-weight: 600;
    color: #b8864f;
  }

  .tooltip-share {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.65);
  }

  :global(.bubble-group circle) {
    transition: filter 0.3s ease, transform 0.3s ease, opacity 0.25s ease;
    stroke: rgba(255, 255, 255, 0.12);
    stroke-width: 1.5px;
  }

  :global(.bubble-group circle:hover) {
    filter: brightness(1.15) drop-shadow(0 10px 24px rgba(0, 0, 0, 0.55));
  }

  :global(.bubble-group.muted circle) {
    opacity: 0.18;
    filter: grayscale(0.6);
  }

  :global(.bubble-group.highlight circle) {
    stroke: rgba(255, 255, 255, 0.7);
    stroke-width: 3px;
    filter: drop-shadow(0 0 22px rgba(184, 134, 79, 0.8));
  }

  :global(.bubble-label) {
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    fill: rgba(255, 255, 255, 0.72);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  :global(.bubble-group.show-label .bubble-label) {
    opacity: 1;
  }

  :global(.continent-label) {
    font-size: 1.1rem;
    font-weight: 700;
    fill: rgba(255, 255, 255, 0.78);
    text-anchor: middle;
    letter-spacing: 0.08em;
    pointer-events: none;
  }

  @keyframes shimmer {
    0%, 100% {
      filter: brightness(1);
    }
    50% {
      filter: brightness(1.3);
    }
  }

  @media (max-width: 1024px) {
    .story-layout {
      grid-template-columns: 1fr;
    }

    .story-panel {
      order: -1;
    }

    .viz-shell {
      min-height: 480px;
    }
  }

  @media (max-width: 640px) {
    .hero {
      padding: 3rem 1.5rem;
    }

    .story {
      padding: 3rem 1.5rem 4rem;
    }

    .story-panel {
      padding: 2rem 1.5rem;
    }

    .viz-shell {
      border-radius: 22px;
    }

    .timeline-controls {
      width: 100%;
    }
  }
</style>
