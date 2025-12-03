<script lang="ts">
  import { onMount } from "svelte";
  import * as d3 from "d3";
  import * as topojson from "topojson-client";

  // --- Configuration ---
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

  // --- State ---
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
  let observer: IntersectionObserver | null = null;

  // Map state
  let mapCocoaData: Record<string, Record<number, Record<string, number>>> = {};
  let mapCurrentYear = 2023;
  let worldData: any = null;
  let mapSvg: any = null;
  let mapG: any = null;
  let mapProjection: any = null;
  let mapPath: any = null;
  let mapZoom: any = null;
  let mapBubbleGroup: any = null;
  let mapInitialized = false;
  let mapRadiusScale: any = null;

  // Country mappings
  const countryNameMap: Record<string, string> = {
    "Côte d'Ivoire": "Ivory Coast",
    "Democratic Republic of the Congo": "Dem. Rep. Congo",
    "Venezuela (Bolivarian Republic of)": "Venezuela",
    "Viet Nam": "Vietnam",
    "Bolivia (Plurinational State of)": "Bolivia",
  };

  const reverseCountryMap: Record<string, string> = {};
  Object.keys(countryNameMap).forEach(key => {
    reverseCountryMap[countryNameMap[key]] = key;
  });

  const countryFlags: Record<string, string> = {
    "Ghana": "🇬🇭", "Côte d'Ivoire": "🇨🇮", "Ivory Coast": "🇨🇮",
    "Nigeria": "🇳🇬", "Cameroon": "🇨🇲", "Brazil": "🇧🇷",
    "Ecuador": "🇪🇨", "Indonesia": "🇮🇩", "Peru": "🇵🇪",
    "Colombia": "🇨🇴", "Mexico": "🇲🇽", "Malaysia": "🇲🇾",
    "Uganda": "🇺🇬", "India": "🇮🇳", "Togo": "🇹🇬",
  };

  const CONTINENT_COLORS: Record<string, string> = {
    "Africa": "#e8b962",
    "South America": "#f47b8f",
    "Asia": "#5b9fd9",
    "North America": "#6fc9a8",
    "Oceania": "#4bc4d4"
  };

  const countryToContinent: Record<string, string> = {
    "Ghana": "Africa", "Côte d'Ivoire": "Africa", "Ivory Coast": "Africa",
    "Nigeria": "Africa", "Cameroon": "Africa", "Togo": "Africa",
    "Uganda": "Africa", "Liberia": "Africa", "Guinea": "Africa",
    "Brazil": "South America", "Ecuador": "South America",
    "Peru": "South America", "Colombia": "South America",
    "Venezuela (Bolivarian Republic of)": "South America",
    "Indonesia": "Asia", "Malaysia": "Asia", "Viet Nam": "Asia",
    "India": "Asia", "Philippines": "Asia", "Thailand": "Asia",
    "Mexico": "North America", "Dominican Republic": "North America",
    "Papua New Guinea": "Oceania", "Solomon Islands": "Oceania",
  };

  // DOM refs
  let storyContainer: HTMLElement;
  let vizShell: HTMLElement;
  let bubbleViz: SVGSVGElement;
  let mapVizEl: HTMLDivElement;
  let mapContainer: HTMLDivElement;
  let worldMapSvg: SVGSVGElement;
  let vizPrompt: HTMLDivElement;
  let narrativeScroller: HTMLDivElement;
  let tooltip: HTMLDivElement;
  let tooltipCountry: HTMLDivElement;
  let tooltipProduction: HTMLDivElement;
  let tooltipShare: HTMLDivElement;
  let bigNumberValue: HTMLDivElement;
  let mapYearInput: HTMLInputElement;
  let mapYearDisplay: HTMLDivElement;
  let mapInfoPanel: HTMLDivElement;
  let countryFlagEl: HTMLDivElement;
  let countryNameEl: HTMLDivElement;
  let dataGrid: HTMLDivElement;

  // Helpers
  const TONNES_TO_POUNDS = 2204.62;
  const TONNES_TO_US_TONS = 1.10231;
  const HECTARES_TO_ACRES = 2.47105;
  const KG_PER_HA_TO_LBS_PER_ACRE = 0.892179;

  function formatTons(valueInPounds: number): string {
    if (valueInPounds === 0) return "0";
    const tons = valueInPounds / 2000;
    const millions = tons / 1000000;
    if (millions >= 1) return d3.format(",.1f")(millions) + "M";
    const thousands = tons / 1000;
    return d3.format(",.0f")(thousands) + "K";
  }

  const formatPercent = d3.format(".1%");

  function getContinent(country: string): string {
    if (["Côte d'Ivoire", "Ghana", "Nigeria", "Cameroon", "Uganda", "Togo", "Sierra Leone", "Liberia", "Madagascar", "Guinea", "Congo", "Angola", "Benin"].includes(country)) return "Africa";
    if (["Indonesia", "Malaysia", "India", "Philippines", "Viet Nam", "Sri Lanka", "Thailand"].includes(country)) return "Asia";
    if (["Mexico", "Dominican Republic", "Cuba", "Haiti", "Jamaica", "Trinidad and Tobago", "Honduras", "Nicaragua", "Costa Rica", "Panama", "Guatemala"].includes(country)) return "North America";
    if (["Ecuador", "Brazil", "Peru", "Colombia", "Venezuela (Bolivarian Republic of)", "Bolivia (Plurinational State of)"].includes(country)) return "South America";
    if (["Papua New Guinea", "Solomon Islands", "Fiji", "Vanuatu"].includes(country)) return "Oceania";
    return "Africa";
  }

  const continentColorScale = d3.scaleOrdinal<string>()
    .domain(["Africa", "Asia", "North America", "South America", "Oceania"])
    .range(["#F5C553", "#5A8BFF", "#6CCB8C", "#FF7B89", "#4DD0E1"]);

  const radiusScale = d3.scaleSqrt().range([CONFIG.MIN_RADIUS * 1.4, CONFIG.MAX_RADIUS * 1.4]);

  // Steps
  const steps = [
    { id: "cluster", layout: "cluster", headline: "WHERE DOES CHOCOLATE COME FROM?", copy: "Before you take your next bite, consider the supply chain. Every circle is a country, sized by its cocoa harvest in 2023.", year: CONFIG.DEFAULT_YEAR, vizType: "bubble" },
    { id: "reveal", layout: "highlight", headline: "TWO FARMS FEED THE WORLD.", copy: "<strong>Côte d'Ivoire</strong> and <strong>Ghana</strong> account for well over half of global cocoa.", year: CONFIG.DEFAULT_YEAR, vizType: "bubble" },
    { id: "continent", layout: "continent", headline: "AFRICA CARRIES THE HARVEST.", copy: "When we regroup by continent, <strong style='color: #F5C553;'>Africa's cluster dwarfs the rest</strong>.", year: CONFIG.DEFAULT_YEAR, vizType: "bubble" },
    { id: "map", layout: "map", headline: "EXPLORE THE GLOBAL COCOA MAP.", copy: "Drag the slider to watch production shift from 1963 to 2023. Click countries to see data.", year: CONFIG.START_YEAR, showSlider: true, vizType: "map" }
  ];

  function animateBigNumber(targetValue: number) {
    if (!bigNumberValue) return;
    const sel = d3.select(bigNumberValue);
    sel.interrupt().text(formatTons(0));
    sel.transition().duration(2000).ease(d3.easeCubicOut)
      .tween("text", () => {
        const interp = d3.interpolateNumber(0, targetValue);
        return (t: number) => sel.text(formatTons(interp(t)));
      });
  }

  function resize() {
    if (!vizShell) return;
    const bounds = vizShell.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    if (bubbleViz) d3.select(bubbleViz).attr("viewBox", `0 0 ${width} ${height}`);
    if (mapInitialized) resizeMap();
  }

  function computeContinentCenters() {
    return {
      "Africa": { x: width * 0.25, y: height * 0.50 },
      "North America": { x: width * 0.50, y: height * 0.30 },
      "South America": { x: width * 0.50, y: height * 0.70 },
      "Asia": { x: width * 0.75, y: height * 0.45 },
      "Oceania": { x: width * 0.80, y: height * 0.70 }
    };
  }

  function buildNodesForYear(year: number) {
    const countryMap = dataByYear.get(year);
    if (!countryMap) return [];
    const total = yearTotals.get(year) || 1;
    const entries = Array.from(countryMap, ([country, production]: [string, number]) => ({
      id: country, country, production, continent: getContinent(country), share: production / total
    }));
    entries.sort((a, b) => b.production - a.production);
    const selected = entries.slice(0, CONFIG.MAX_COUNTRIES);
    selected.forEach((node: any, i: number) => {
      node.rank = i + 1;
      const prev = nodeState.get(node.country);
      node.x = prev ? prev.x : width / 2 + (Math.random() - 0.5) * 30;
      node.y = prev ? prev.y : height / 2 + (Math.random() - 0.5) * 30;
      node.radius = radiusScale(node.production);
    });
    return selected;
  }

  function runSimulation(layout: string, nodesData: any[]) {
    const center = { x: width / 2, y: height / 2 };
    const cc = computeContinentCenters();
    const forceX = d3.forceX((n: any) => {
      if (layout === "continent") return (cc[n.continent as keyof typeof cc] || center).x;
      if (layout === "highlight" && n.rank <= 2) return center.x + (n.rank === 1 ? -width * 0.12 : width * 0.12);
      return center.x;
    }).strength(layout === "cluster" ? 0.05 : 0.12);
    const forceY = d3.forceY((n: any) => {
      if (layout === "continent") return (cc[n.continent as keyof typeof cc] || center).y;
      return center.y;
    }).strength(layout === "cluster" ? 0.05 : 0.12);
    const sim = d3.forceSimulation(nodesData).force("x", forceX).force("y", forceY)
      .force("collide", d3.forceCollide((n: any) => n.radius + 3)).stop();
    for (let i = 0; i < CONFIG.SIMULATION_ITERATIONS; i++) {
      sim.tick();
      nodesData.forEach(n => {
        n.x = Math.max(80 + n.radius, Math.min(width - 80 - n.radius, n.x));
        n.y = Math.max(80 + n.radius, Math.min(height - 80 - n.radius, n.y));
      });
    }
    nodesData.forEach(n => nodeState.set(n.country, { x: n.x, y: n.y }));
  }

  function showTooltip(event: MouseEvent, node: any) {
    if (!tooltip) return;
    tooltip.classList.remove("hidden");
    tooltip.style.left = `${event.pageX}px`;
    tooltip.style.top = `${event.pageY - 20}px`;
    if (tooltipCountry) tooltipCountry.textContent = node.country.toUpperCase();
    if (tooltipProduction) tooltipProduction.textContent = `${formatTons(node.production)} tons`;
    if (tooltipShare) tooltipShare.textContent = `${formatPercent(node.share)} of global harvest`;
  }

  function hideTooltip() {
    if (tooltip) tooltip.classList.add("hidden");
  }

  function renderNodes(step: any) {
    if (!bubbleViz) return;
    const layout = step.layout;
    const highlight = step.id === "reveal";
    const svg = d3.select(bubbleViz);
    const sel = svg.selectAll<SVGGElement, any>(".bubble-group").data(nodes, (d: any) => d.country);
    const enter = sel.enter().append("g").attr("class", "bubble-group")
      .attr("transform", (d: any) => `translate(${d.x},${d.y})`).style("opacity", 0);
    enter.append("circle").attr("r", 0).attr("fill", (d: any) => continentColorScale(d.continent))
      .on("mouseenter", (e: any, d: any) => { d3.select(e.currentTarget.parentNode).classed("show-label", true); showTooltip(e, d); })
      .on("mousemove", (e: any, d: any) => showTooltip(e, d))
      .on("mouseleave", (e: any) => { d3.select(e.currentTarget.parentNode).classed("show-label", false); hideTooltip(); });
    enter.append("text").attr("class", "bubble-label").attr("y", 4).text((d: any) => d.country);
    const merged = enter.merge(sel);
    merged.transition().duration(650).attr("transform", (d: any) => `translate(${d.x},${d.y})`).style("opacity", 1);
    merged.classed("muted", (d: any) => highlight && d.rank > 2).classed("highlight", (d: any) => highlight && d.rank <= 2);
    merged.select("circle").transition().duration(650).attr("r", (d: any) => d.radius)
      .attr("fill", (d: any) => continentColorScale(d.continent)).attr("opacity", (d: any) => highlight && d.rank > 2 ? 0.2 : 1);
    merged.select(".bubble-label").transition().duration(500).attr("y", (d: any) => d.radius / 2 + 12);
    sel.exit().transition().duration(400).style("opacity", 0).remove();

    const labelsData = (layout === "continent") ? d3.groups(nodes, (d: any) => d.continent).map(([c]) => {
      const a = computeContinentCenters()[c as keyof ReturnType<typeof computeContinentCenters>] || { x: width / 2, y: height / 2 };
      return { continent: c, ...a };
    }) : [];
    const labels = svg.selectAll<SVGTextElement, any>(".continent-label").data(labelsData, (d: any) => d.continent);
    labels.enter().append("text").attr("class", "continent-label").attr("x", (d: any) => d.x).attr("y", (d: any) => d.y - 50)
      .style("opacity", 0).text((d: any) => d.continent).transition().duration(500).style("opacity", 1);
    labels.transition().duration(500).attr("x", (d: any) => d.x).attr("y", (d: any) => d.y - 50);
    labels.exit().transition().duration(300).style("opacity", 0).remove();
  }

  // Map functions
  function initMap() {
    if (mapInitialized || !mapContainer || !worldMapSvg) return;
    const cw = mapContainer.offsetWidth || width;
    const ch = mapContainer.offsetHeight || height;
    mapSvg = d3.select(worldMapSvg).attr("width", cw).attr("height", ch);
    mapProjection = d3.geoMercator();
    mapPath = d3.geoPath().projection(mapProjection);
    mapG = mapSvg.append("g");
    mapZoom = d3.zoom().scaleExtent([1, 20]).on("zoom", (e: any) => mapG.attr("transform", e.transform));
    mapSvg.call(mapZoom);

    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then((data: any) => {
      worldData = data;
      const countries = topojson.feature(data, data.objects.countries) as any;
      mapProjection.fitSize([cw - 80, ch - 80], countries);
      const t = mapProjection.translate();
      mapProjection.translate([t[0] + 40, t[1] + 40]);
      mapPath = d3.geoPath().projection(mapProjection);
      mapG.selectAll("path").data(countries.features).enter().append("path").attr("class", "country").attr("d", mapPath)
        .on("click", (_: any, d: any) => showMapCountryInfo(reverseCountryMap[d.properties.name] || d.properties.name, d.properties.name));
      mapBubbleGroup = mapG.append("g").attr("class", "bubbles");
      if (Object.keys(mapCocoaData).length > 0) updateMapBubbles();
      mapInitialized = true;
    }).catch(e => console.error("Map load error:", e));
  }

  function resizeMap() {
    if (!mapInitialized || !mapSvg || !worldData || !mapContainer) return;
    const cw = mapContainer.offsetWidth, ch = mapContainer.offsetHeight;
    mapSvg.attr("width", cw).attr("height", ch);
    const countries = topojson.feature(worldData, worldData.objects.countries) as any;
    mapProjection.fitSize([cw - 80, ch - 80], countries);
    const t = mapProjection.translate();
    mapProjection.translate([t[0] + 40, t[1] + 40]);
    mapPath = d3.geoPath().projection(mapProjection);
    mapG.selectAll("path.country").attr("d", mapPath);
    updateMapBubbles();
  }

  function getCountryCentroid(name: string): [number, number] | null {
    if (!worldData || !mapProjection) return null;
    const countries = topojson.feature(worldData, worldData.objects.countries) as any;
    const f = countries.features.find((d: any) => d.properties.name === name);
    if (f?.geometry) return mapProjection(d3.geoCentroid(f.geometry));
    return null;
  }

  function updateMapBubbles() {
    if (!worldData || !mapBubbleGroup || !Object.keys(mapCocoaData).length) return;
    const bubbleData: any[] = [];
    let maxProd = 0;
    Object.keys(mapCocoaData).forEach(c => {
      const yd = mapCocoaData[c][mapCurrentYear];
      if (yd?.Production) {
        const mapName = countryNameMap[c] || c;
        const centroid = getCountryCentroid(mapName);
        if (centroid && !isNaN(centroid[0])) {
          bubbleData.push({ country: c, displayName: mapName, production: yd.Production, x: centroid[0], y: centroid[1], areaHarvested: yd['Area harvested'], yield: yd.Yield });
          if (yd.Production > maxProd) maxProd = yd.Production;
        }
      }
    });
    if (!maxProd) { mapBubbleGroup.selectAll("circle").remove(); return; }
    mapRadiusScale = d3.scaleSqrt().domain([0, maxProd]).range([2, 15]);
    const bubbles = mapBubbleGroup.selectAll<SVGCircleElement, any>("circle").data(bubbleData, (d: any) => d.country);
    bubbles.enter().append("circle").attr("class", "bubble").attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y).attr("r", 0)
      .attr("fill", (d: any) => CONTINENT_COLORS[countryToContinent[d.country] || "Africa"]).attr("opacity", 0.85).style("cursor", "pointer")
      .on("click", (_: any, d: any) => showMapCountryInfo(d.country, d.displayName))
      .merge(bubbles).transition().duration(500).attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y).attr("r", (d: any) => mapRadiusScale(d.production));
    bubbles.exit().transition().duration(300).attr("r", 0).remove();
  }

  function showMapCountryInfo(dataName: string, displayName: string) {
    const data = mapCocoaData[dataName]?.[mapCurrentYear];
    if (!data?.Production) { mapInfoPanel?.classList.remove("active"); return; }
    if (countryFlagEl) countryFlagEl.textContent = countryFlags[dataName] || countryFlags[displayName] || "🌍";
    if (countryNameEl) countryNameEl.textContent = displayName || dataName;
    if (dataGrid) dataGrid.innerHTML = `
      <div class="data-item"><div class="data-label">Production</div><div class="data-value">${(data.Production * TONNES_TO_US_TONS).toLocaleString('en-US', {maximumFractionDigits: 0})} tons</div></div>
      ${data['Area harvested'] ? `<div class="data-item"><div class="data-label">Area</div><div class="data-value">${(data['Area harvested'] * HECTARES_TO_ACRES).toLocaleString('en-US', {maximumFractionDigits: 0})} acres</div></div>` : ''}
      ${data.Yield ? `<div class="data-item"><div class="data-label">Yield</div><div class="data-value">${(data.Yield * KG_PER_HA_TO_LBS_PER_ACRE).toLocaleString('en-US', {maximumFractionDigits: 0})} lbs/acre</div></div>` : ''}
    `;
    mapInfoPanel?.classList.add("active");
  }

  function parseMapCSVData(rows: any[]) {
    mapCocoaData = {};
    rows.forEach((d: any) => {
      const c = d.Area?.trim(), el = d.Element?.trim(), yr = parseInt(d.Year), val = parseFloat(d.Value);
      if (!c || !el || isNaN(yr) || isNaN(val)) return;
      if (!mapCocoaData[c]) mapCocoaData[c] = {};
      if (!mapCocoaData[c][yr]) mapCocoaData[c][yr] = {};
      mapCocoaData[c][yr][el] = val;
    });
    if (mapInitialized) updateMapBubbles();
  }

  function setupScroller() {
    if (!narrativeScroller) return;
    steps.forEach((step, i) => {
      const panel = document.createElement("aside");
      panel.className = "story-panel story-step";
      panel.setAttribute("data-step-index", String(i));
      panel.innerHTML = `<p class="step-count">Step ${i + 1} of ${steps.length}</p><h2 class="story-headline">${step.headline}</h2><p class="story-copy">${step.copy}</p>`;
      narrativeScroller.appendChild(panel);
    });
    observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        const idx = +(e.target.getAttribute("data-step-index") || 0);
        if (e.isIntersecting && currentStepIndex !== idx) setStep(idx);
      });
    }, { rootMargin: "0px 0px -50% 0px", threshold: 0 });
    narrativeScroller.querySelectorAll(".story-step:not(.intro-panel)").forEach(el => observer!.observe(el));
    setStep(0);
  }

  function setStep(index: number) {
    currentStepIndex = index;
    const step = steps[currentStepIndex];
    if (step.vizType === "map") {
      bubbleViz?.classList.add("hidden");
      mapVizEl?.classList.remove("hidden");
      if (!mapInitialized) initMap();
      mapCurrentYear = step.showSlider ? parseInt(mapYearInput?.value || String(step.year)) : step.year;
      if (mapYearDisplay) mapYearDisplay.textContent = `Year: ${mapCurrentYear}`;
      if (Object.keys(mapCocoaData).length) updateMapBubbles();
    } else {
      bubbleViz?.classList.remove("hidden");
      mapVizEl?.classList.add("hidden");
      currentYear = step.year;
      nodes = buildNodesForYear(currentYear);
      runSimulation(step.layout, nodes);
      renderNodes(step);
    }
  }

  function updateMapYear(value: number) {
    mapCurrentYear = value;
    if (mapYearDisplay) mapYearDisplay.textContent = `Year: ${mapCurrentYear}`;
    updateMapBubbles();
  }

  async function initializeStory() {
    resize();
    nodeState.clear();
    if (!dataReady) {
      if (vizPrompt) { vizPrompt.textContent = "Loading..."; vizPrompt.classList.add("visible"); }
      await new Promise<void>(r => dataReadyResolvers.push(r));
      vizPrompt?.classList.remove("visible");
    }
    setupScroller();
  }

  function loadData() {
    d3.csv(CONFIG.DATA_FILE, (d: any) => {
      if (d.Element !== "Production") return null;
      return { year: +d.Year, country: d.Area.trim(), production: +d.Value * TONNES_TO_POUNDS };
    }).then((data: any) => {
      const filtered = data.filter(Boolean).filter((d: any) => d.year >= CONFIG.START_YEAR && d.year <= CONFIG.END_YEAR);
      dataByYear = d3.rollup(filtered, (v: any) => d3.rollup(v, (x: any) => d3.sum(x, (d: any) => d.production), (d: any) => d.country), (d: any) => d.year);
      dataByYear.forEach((cm: any, yr: number) => {
        let tot = 0;
        cm.forEach((v: number) => { tot += v; if (v > globalMaxCountry) globalMaxCountry = v; });
        yearTotals.set(yr, tot);
      });
      radiusScale.domain([0, globalMaxCountry]);
      animateBigNumber(yearTotals.get(CONFIG.DEFAULT_YEAR) || 0);
      dataReady = true;
      dataReadyResolvers.forEach(fn => fn());
      d3.csv(CONFIG.DATA_FILE).then((rows: any) => parseMapCSVData(rows));
      initializeStory();
    }).catch(e => { console.error(e); if (vizPrompt) { vizPrompt.textContent = "Error loading data"; vizPrompt.classList.add("visible"); } });
  }

  onMount(() => {
    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { resize(); if (steps[currentStepIndex]?.vizType === "bubble" && nodes.length) { runSimulation(steps[currentStepIndex].layout, nodes); renderNodes(steps[currentStepIndex]); } }, 150); };
    window.addEventListener("resize", onResize);
    loadData();
    return () => { window.removeEventListener("resize", onResize); observer?.disconnect(); };
  });
</script>

<div class="cocoa-producers-wrapper">
  <main class="story" bind:this={storyContainer}>
    <div class="story-layout">
      <div class="viz-shell" bind:this={vizShell}>
        <svg bind:this={bubbleViz} class="viz-content"></svg>
        <div bind:this={mapVizEl} class="viz-content map-viz hidden">
          <div bind:this={mapContainer} class="map-container"><svg bind:this={worldMapSvg}></svg></div>
          <div class="map-controls">
            <button class="control-btn" on:click={() => mapSvg?.transition().call(mapZoom?.scaleBy, 1.5)}>+</button>
            <button class="control-btn" on:click={() => mapSvg?.transition().call(mapZoom?.scaleBy, 0.75)}>−</button>
            <button class="control-btn" on:click={() => mapSvg?.transition().call(mapZoom?.transform, d3.zoomIdentity)}>⟲</button>
          </div>
          <div class="map-year-slider">
            <div bind:this={mapYearDisplay} class="map-year-display">Year: 2023</div>
            <input type="range" bind:this={mapYearInput} min="1961" max="2023" value="2023" on:input={(e) => updateMapYear(+(e.currentTarget as HTMLInputElement).value)} />
          </div>
          <div bind:this={mapInfoPanel} class="map-info-panel">
            <button class="close-btn" on:click={() => mapInfoPanel?.classList.remove("active")}>×</button>
            <div class="info-header"><div bind:this={countryFlagEl} class="flag">🌍</div><div bind:this={countryNameEl} class="country-name">Select a Country</div></div>
            <div bind:this={dataGrid} class="data-grid"></div>
          </div>
          <div class="map-legend">
            <div class="legend-title">Continents</div>
            <div class="legend-item"><div class="legend-color" style="background:#e8b962"></div><span>Africa</span></div>
            <div class="legend-item"><div class="legend-color" style="background:#f47b8f"></div><span>South America</span></div>
            <div class="legend-item"><div class="legend-color" style="background:#5b9fd9"></div><span>Asia</span></div>
            <div class="legend-item"><div class="legend-color" style="background:#6fc9a8"></div><span>North America</span></div>
            <div class="legend-item"><div class="legend-color" style="background:#4bc4d4"></div><span>Oceania</span></div>
          </div>
        </div>
        <div bind:this={vizPrompt} class="viz-overlay"></div>
      </div>
      <div bind:this={narrativeScroller} class="narrative-scroller">
        <aside class="story-panel intro-panel">
          <p class="step-count">Introduction</p>
          <div class="big-number-container">
            <div bind:this={bigNumberValue} class="big-number">0</div>
            <div class="subtitle">Tons of global cocoa harvested in 2023</div>
            <div class="subtitle secondary">Two countries provide most of it.</div>
          </div>
        </aside>
      </div>
    </div>
  </main>
  <div bind:this={tooltip} class="tooltip hidden">
    <div bind:this={tooltipCountry} class="tooltip-country"></div>
    <div bind:this={tooltipProduction} class="tooltip-production"></div>
    <div bind:this={tooltipShare} class="tooltip-share"></div>
  </div>
</div>

<style>
  .cocoa-producers-wrapper { width: 100%; position: relative; }
  .hidden { display: none !important; }
  .big-number-container { display: flex; flex-direction: column; align-items: flex-start; gap: 1rem; }
  .big-number { font-size: clamp(2.5rem, 4vw, 3.5rem); font-weight: 900; background: linear-gradient(120deg, #fef2c0 0%, #f5c553 50%, #a47300 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .subtitle { font-size: clamp(1rem, 2vw, 1.15rem); color: rgba(255,255,255,0.78); }
  .subtitle.secondary { color: rgba(255,255,255,0.65); }
  .story { padding: 0 clamp(1.5rem, 5vw, 5rem); min-height: 100vh; }
  .story-layout { position: relative; display: flex; gap: clamp(2rem, 4vw, 3rem); max-width: 1800px; margin: 0 auto; }
  .viz-shell { position: sticky; top: clamp(60px, 8vh, 100px); width: clamp(400px, 55%, 700px); min-height: clamp(400px, 50vh, 560px); max-height: 90vh; flex-shrink: 0; background: rgba(18,18,18,0.85); border: 1px solid rgba(255,255,255,0.08); border-radius: 28px; backdrop-filter: blur(18px); box-shadow: 0 24px 60px rgba(0,0,0,0.45); overflow: hidden; }
  .viz-content { width: 100%; height: 100%; }
  .map-viz { position: relative; cursor: grab; }
  .map-container { width: 100%; height: 100%; overflow: hidden; }
  .map-container :global(svg) { width: 100%; height: 100%; }
  :global(.country) { fill: #3a3a3a; stroke: #2a2a2a; stroke-width: 0.5; transition: fill 0.2s; }
  :global(.country:hover) { fill: #444; }
  :global(.bubble) { transition: all 0.3s; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.3)); }
  :global(.bubble:hover) { filter: drop-shadow(0 4px 16px rgba(245,197,83,0.6)); }
  .map-controls { position: absolute; top: 20px; right: 20px; display: flex; flex-direction: column; gap: 10px; z-index: 100; }
  .control-btn { width: 50px; height: 50px; background: rgba(28,17,13,0.9); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #b8864f; cursor: pointer; font-size: 24px; font-weight: bold; transition: all 0.3s; display: flex; align-items: center; justify-content: center; }
  .control-btn:hover { background: rgba(164,115,0,0.9); color: #fff; transform: scale(1.05); }
  .map-year-slider { position: absolute; top: 20px; left: 20px; background: rgba(28,17,13,0.95); border: 1px solid rgba(255,255,255,0.15); border-radius: 16px; padding: 20px; max-width: 300px; z-index: 100; }
  .map-year-slider input { width: 100%; margin: 10px 0; -webkit-appearance: none; height: 8px; border-radius: 999px; background: linear-gradient(90deg, #6b5321, #e1b058); cursor: pointer; }
  .map-year-slider input::-webkit-slider-thumb { -webkit-appearance: none; width: 22px; height: 22px; border-radius: 50%; background: #fff; border: 3px solid #a47300; cursor: pointer; }
  .map-year-display { text-align: center; font-size: 20px; font-weight: 700; color: #e1b058; }
  .map-info-panel { position: absolute; bottom: 20px; left: 20px; background: rgba(28,17,13,0.95); border: 1px solid rgba(255,255,255,0.15); border-radius: 16px; padding: 25px; min-width: 300px; z-index: 100; display: none; }
  .map-info-panel:global(.active) { display: block; }
  .info-header { display: flex; align-items: center; gap: 15px; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.15); }
  .flag { font-size: 52px; }
  .country-name { font-size: 22px; font-weight: 800; background: linear-gradient(120deg, #e4c698, #b8864f, #704214); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-transform: uppercase; }
  :global(.data-grid) { display: grid; gap: 15px; }
  :global(.data-item) { padding: 12px; background: rgba(0,0,0,0.3); border-radius: 8px; border-left: 3px solid #e1b058; }
  :global(.data-label) { font-size: 11px; text-transform: uppercase; color: rgba(255,255,255,0.6); font-weight: 600; }
  :global(.data-value) { font-size: 22px; font-weight: 700; color: #e1b058; }
  .close-btn { position: absolute; top: 15px; right: 15px; background: none; border: none; color: rgba(255,255,255,0.5); cursor: pointer; font-size: 28px; }
  .map-legend { position: absolute; bottom: 20px; right: 20px; background: rgba(28,17,13,0.95); border: 1px solid rgba(255,255,255,0.15); border-radius: 12px; padding: 18px; z-index: 100; }
  .legend-title { font-size: 11px; text-transform: uppercase; color: rgba(255,255,255,0.6); margin-bottom: 12px; font-weight: 700; }
  .legend-item { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; font-size: 13px; color: rgba(255,255,255,0.8); }
  .legend-color { width: 24px; height: 24px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.3); }
  .viz-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; font-size: 1.1rem; color: rgba(255,255,255,0.8); opacity: 0; transition: opacity 0.35s; z-index: 200; }
  .viz-overlay:global(.visible) { opacity: 1; }
  .narrative-scroller { flex-grow: 1; display: flex; flex-direction: column; padding-top: clamp(30vh, 50vh, 50vh); padding-bottom: clamp(30vh, 50vh, 50vh); gap: clamp(40vh, 60vh, 60vh); }
  :global(.story-panel) { padding: clamp(1.5rem, 3vw, 2.5rem); background: rgba(16,16,16,0.78); border: 1px solid rgba(255,255,255,0.07); border-radius: 28px; box-shadow: 0 16px 48px rgba(0,0,0,0.4); display: flex; flex-direction: column; gap: 1.5rem; max-width: clamp(400px, 600px, 600px); align-self: flex-end; }
  .intro-panel { align-items: flex-start; text-align: left; }
  :global(.step-count) { font-size: 0.9rem; color: rgba(255,255,255,0.5); font-weight: 600; }
  :global(.story-headline) { font-size: clamp(1.8rem, 3vw, 2.3rem); font-weight: 800; color: #fef2c0; text-transform: uppercase; }
  :global(.story-copy) { font-size: clamp(1rem, 2vw, 1.15rem); color: rgba(255,255,255,0.78); }
  :global(.story-copy strong) { color: #f5c553; font-weight: 600; }
  .tooltip { position: absolute; pointer-events: none; background: rgba(15,15,15,0.95); border: 1px solid rgba(255,255,255,0.12); border-radius: 16px; padding: 0.75rem 1rem; box-shadow: 0 16px 40px rgba(0,0,0,0.45); transform: translate(-50%, -120%); min-width: 180px; z-index: 30; }
  .tooltip.hidden { opacity: 0; visibility: hidden; }
  .tooltip-country { font-weight: 700; text-transform: uppercase; font-size: 0.85rem; margin-bottom: 0.35rem; }
  .tooltip-production { font-size: 1rem; font-weight: 600; color: #f5c553; }
  .tooltip-share { font-size: 0.85rem; color: rgba(255,255,255,0.65); }
  :global(.bubble-group circle) { transition: filter 0.3s, opacity 0.25s; stroke: rgba(255,255,255,0.12); stroke-width: 1.5px; }
  :global(.bubble-group circle:hover) { filter: brightness(1.15) drop-shadow(0 10px 24px rgba(0,0,0,0.55)); }
  :global(.bubble-group.muted circle) { opacity: 0.18; filter: grayscale(0.6); }
  :global(.bubble-group.highlight circle) { stroke: rgba(255,255,255,0.7); stroke-width: 3px; filter: drop-shadow(0 0 22px rgba(245,197,83,0.8)); }
  :global(.bubble-label) { font-size: 0.72rem; font-weight: 600; text-transform: uppercase; fill: rgba(255,255,255,0.72); pointer-events: none; opacity: 0; transition: opacity 0.3s; }
  :global(.bubble-group.show-label .bubble-label) { opacity: 1; }
  :global(.continent-label) { font-size: 1.1rem; font-weight: 700; fill: rgba(255,255,255,0.78); text-anchor: middle; pointer-events: none; }
  @media (max-width: 1024px) {
    .story-layout { flex-direction: column; gap: 1rem; }
    .viz-shell { position: relative; top: auto; width: 100%; min-height: clamp(400px, 50vh, 480px); order: -1; }
    .narrative-scroller { padding-top: 1rem; padding-bottom: 3rem; gap: 2rem; }
    :global(.story-panel) { max-width: 100%; align-self: center; }
  }
</style>
