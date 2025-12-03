// --- 1. Configuration ---
const CONFIG = {
  DATA_FILE: "data/cocoa_data.csv",
  START_YEAR: 1963,
  END_YEAR: 2023,
  DEFAULT_YEAR: 2023,
  MAX_COUNTRIES: 80,
  SIMULATION_ITERATIONS: 250,
  MIN_RADIUS: 6,
  MAX_RADIUS: 64
};

// --- 2. Global State ---
let dataByYear = new Map();
let yearTotals = new Map();
let globalMaxCountry = 0;
let currentYear = CONFIG.DEFAULT_YEAR;
let currentStepIndex = 0;
let nodes = [];
let width = 800;
let height = 560;
const nodeState = new Map();
let dataReady = false;
let dataReadyResolvers = [];
let observer;

// --- Map Visualization State ---
let mapCocoaData = {};
let mapCurrentYear = 2023;
let worldData = null;
let mapSvg, mapG, mapProjection, mapPath;
let mapZoom, mapCurrentTransform;
let mapBubbleGroup;
let mapInitialized = false;

// Country name mappings for variations in the TopoJSON data
const countryNameMap = {
  "United States of America": "USA",
  "Côte d'Ivoire": "Ivory Coast", 
  "Democratic Republic of the Congo": "Dem. Rep. Congo",
  "Republic of the Congo": "Congo",
  "Central African Republic": "Central African Rep.",
  "Dominican Republic": "Dominican Rep.",
  "Equatorial Guinea": "Eq. Guinea",
  "Solomon Islands": "Solomon Is.",
  "Venezuela (Bolivarian Republic of)": "Venezuela", 
  "Viet Nam": "Vietnam",
  "Bolivia (Plurinational State of)": "Bolivia",
  "Timor-Leste": "East Timor"
};

// Reverse mapping for data lookup
const reverseCountryMap = {};
Object.keys(countryNameMap).forEach(key => {
  reverseCountryMap[countryNameMap[key]] = key;
});

// Country flags
const countryFlags = {
  "Ghana": "🇬🇭", "Côte d'Ivoire": "🇨🇮", "Ivory Coast": "🇨🇮",
  "Nigeria": "🇳🇬", "Cameroon": "🇨🇲", "Brazil": "🇧🇷",
  "Ecuador": "🇪🇨", "Indonesia": "🇮🇩", "Peru": "🇵🇪",
  "Dominican Rep.": "🇩🇴", "Dominican Republic": "🇩🇴",
  "Colombia": "🇨🇴", "Mexico": "🇲🇽", "Papua New Guinea": "🇵🇬",
  "Malaysia": "🇲🇾", "Viet Nam": "🇻🇳", "Vietnam": "🇻🇳",
  "Venezuela (Bolivarian Republic of)": "🇻🇪", "Venezuela": "🇻🇪",
  "Uganda": "🇺🇬", "India": "🇮🇳", "Togo": "🇹🇬",
  "Sierra Leone": "🇸🇱", "Philippines": "🇵🇭", "Thailand": "🇹🇭",
  "Angola": "🇦🇴", "Benin": "🇧🇯", "Sri Lanka": "🇱🇰",
  "USA": "🇺🇸", "United States of America": "🇺🇸",
  "Madagascar": "🇲🇬", "Liberia": "🇱🇷", "Guinea": "🇬🇳",
  "Trinidad and Tobago": "🇹🇹", "Haiti": "🇭🇹", "Cuba": "🇨🇺",
  "Honduras": "🇭🇳", "Nicaragua": "🇳🇮", "Costa Rica": "🇨🇷",
  "Panama": "🇵🇦", "Guatemala": "🇬🇹", "El Salvador": "🇸🇻",
  "Belize": "🇧🇿", "Jamaica": "🇯🇲", "Grenada": "🇬🇩",
  "Dominica": "🇩🇲", "Saint Lucia": "🇱🇨", 
  "Saint Vincent and the Grenadines": "🇻🇨",
  "Bolivia (Plurinational State of)": "🇧🇴", "Bolivia": "🇧🇴",
  "Guyana": "🇬🇾", "Suriname": "🇸🇷", "Timor-Leste": "🇹🇱",
  "East Timor": "🇹🇱",
  "Solomon Islands": "🇸🇧", "Solomon Is.": "🇸🇧",
  "Fiji": "🇫🇯",
  "Vanuatu": "🇻🇺",
  "Congo": "🇨🇬", "Republic of the Congo": "🇨🇬", "Democratic Republic of the Congo": "🇨🇩", "Dem. Rep. Congo": "🇨🇩",
  "Central African Republic": "🇨🇫", "Central African Rep.": "🇨🇫",
  "Equatorial Guinea": "🇬🇶", "Eq. Guinea": "🇬🇶",
  "Gabon": "🇬🇦",
};

// Continental color scheme
const CONTINENT_COLORS = {
  "Africa": "#e8b962",
  "South America": "#f47b8f",
  "Asia": "#5b9fd9",
  "North America": "#6fc9a8",
  "Oceania": "#4bc4d4"
};

// Country to continent mapping
const countryToContinent = {
  "Ghana": "Africa", "Côte d'Ivoire": "Africa", "Ivory Coast": "Africa",
  "Nigeria": "Africa", "Cameroon": "Africa", "Togo": "Africa",
  "Sierra Leone": "Africa", "Angola": "Africa", "Benin": "Africa",
  "Uganda": "Africa", "Madagascar": "Africa", "Liberia": "Africa",
  "Guinea": "Africa", "Congo": "Africa", "Republic of the Congo": "Africa", "Democratic Republic of the Congo": "Africa",
  "Dem. Rep. Congo": "Africa", "Central African Republic": "Africa",
  "Central African Rep.": "Africa", "Equatorial Guinea": "Africa",
  "Eq. Guinea": "Africa", "Gabon": "Africa",
  "Brazil": "South America", "Ecuador": "South America", 
  "Peru": "South America", "Colombia": "South America",
  "Venezuela (Bolivarian Republic of)": "South America", 
  "Venezuela": "South America", "Bolivia (Plurinational State of)": "South America",
  "Bolivia": "South America", "Guyana": "South America", 
  "Suriname": "South America",
  "Indonesia": "Asia", "Malaysia": "Asia", "Viet Nam": "Asia",
  "Vietnam": "Asia", "India": "Asia", "Philippines": "Asia",
  "Thailand": "Asia", "Sri Lanka": "Asia", "Timor-Leste": "Asia",
  "East Timor": "Asia",
  "Mexico": "North America", "Dominican Rep.": "North America",
  "Dominican Republic": "North America", "USA": "North America",
  "United States of America": "North America", "Trinidad and Tobago": "North America",
  "Haiti": "North America", "Cuba": "North America", "Honduras": "North America",
  "Nicaragua": "North America", "Costa Rica": "North America",
  "Panama": "North America", "Guatemala": "North America",
  "El Salvador": "North America", "Belize": "North America",
  "Jamaica": "North America", "Grenada": "North America",
  "Dominica": "North America", "Saint Lucia": "North America",
  "Saint Vincent and the Grenadines": "North America",
  "Papua New Guinea": "Oceania", "Solomon Islands": "Oceania",
  "Solomon Is.": "Oceania","Fiji": "Oceania", "Vanuatu": "Oceania"
};

let mapRadiusScale;

// --- 3. D3 Helpers ---
function formatPounds(value) {
  if (value === 0) return "0";
  const millions = value / 1000000;
  if (millions >= 1000) {
    return d3.format(",.0f")(millions) + "M";
  } else if (millions >= 1) {
    return d3.format(",.1f")(millions) + "M";
  } else {
    const thousands = value / 1000;
    return d3.format(",.0f")(thousands) + "K";
  }
}

function formatTons(valueInPounds) {
  if (valueInPounds === 0) return "0";
  const tons = valueInPounds / 2000; // Convert pounds to US tons
  const millions = tons / 1000000;
  if (millions >= 1000) {
    return d3.format(",.0f")(millions) + "M";
  } else if (millions >= 1) {
    return d3.format(",.1f")(millions) + "M";
  } else {
    const thousands = tons / 1000;
    return d3.format(",.0f")(thousands) + "K";
  }
}
const formatPercent = d3.format(".1%");
const TONNES_TO_POUNDS = 2204.62;
const TONNES_TO_US_TONS = 1.10231;
const HECTARES_TO_ACRES = 2.47105;
const KG_PER_HA_TO_LBS_PER_ACRE = 0.892179;

function getContinent(country) {
  if (["Côte d'Ivoire", "Ghana", "Nigeria", "Cameroon", "Uganda", "Togo", "Sierra Leone", "Liberia", "Madagascar", "Equatorial Guinea", "Guinea", "Congo", "Republic of the Congo", "Democratic Republic of the Congo", "United Republic of Tanzania", "Sao Tome and Principe", "Angola", "Comoros", "Gabon", "Central African Republic"].includes(country)) return "Africa";
  if (["Indonesia", "Malaysia", "Papua New Guinea", "India", "Philippines", "Viet Nam", "Sri Lanka", "Thailand", "Timor-Leste"].includes(country)) return "Asia";
  if (["Mexico", "Dominican Republic", "Cuba", "Haiti", "Jamaica", "Trinidad and Tobago", "Dominica", "Saint Lucia", "Saint Vincent and the Grenadines", "Grenada", "Belize", "Costa Rica", "El Salvador", "Guatemala", "Honduras", "Nicaragua", "Panama"].includes(country)) return "North America";
  if (["Ecuador", "Brazil", "Peru", "Colombia", "Venezuela (Bolivarian Republic of)", "Bolivia (Plurinational State of)", "Suriname", "Guyana"].includes(country)) return "South America";
  if (["Solomon Islands", "Fiji", "Vanuatu", "Samoa", "Micronesia (Federated States of)"].includes(country)) return "Oceania";
  // Default to Africa if country not found (shouldn't happen with proper data)
  return "Africa";
}

const continentColorScale = d3.scaleOrdinal()
  .domain(["Africa", "Asia", "Europe", "North America", "South America", "Oceania"])
  .range([
    "#F5C553",
    "#5A8BFF",
    "#B17DFF",
    "#6CCB8C",
    "#FF7B89",
    "#4DD0E1"
  ]);

const radiusScale = d3.scaleSqrt()
  .range([CONFIG.MIN_RADIUS * 1.4, CONFIG.MAX_RADIUS * 1.4]);

// --- 4. Step Definitions ---
const steps = [
  {
    id: "cluster",
    layout: "cluster",
    headline: "WHERE DOES CHOCOLATE COME FROM?",
    copy: "Before you take your next bite, consider the supply chain. Every circle on the left is a country, sized by its cocoa harvest in 2023.",
    year: CONFIG.DEFAULT_YEAR,
    vizType: "bubble"
  },
  {
    id: "reveal",
    layout: "highlight",
    headline: "TWO FARMS FEED THE WORLD.",
    copy: "<strong>Côte d'Ivoire</strong> and <strong>Ghana</strong> account for well over half of global cocoa. This immense concentration of supply carries significant risks for the global chocolate market.",
    prompt: "",
    year: CONFIG.DEFAULT_YEAR,
    vizType: "bubble"
  },
  {
    id: "continent",
    layout: "continent",
    headline: "AFRICA CARRIES THE HARVEST.",
    copy: "When we regroup these countries by continent, <strong style='color: #F5C553;'>Africa's cluster dwarfs the rest</strong>. The world's chocolate depends on just one region for its primary ingredient.",
    prompt: "",
    year: CONFIG.DEFAULT_YEAR,
    vizType: "bubble"
  },
  {
    id: "map",
    layout: "map",
    headline: "EXPLORE THE GLOBAL COCOA MAP.",
    copy: "Drag the slider to watch production shift from 1963 to 2023. Click on countries or bubbles to see detailed production data. Africa stays dominant, but watch <strong style='color: #5A8BFF;'>Indonesia</strong> and <strong style='color: #FF7B89;'>Brazil</strong> rise and fall along the way.",
    prompt: "",
    year: CONFIG.START_YEAR,
    showSlider: true,
    vizType: "map"
  }
];

// --- 5. DOM Selections ---
const bigNumberValue = d3.select("#globalProduction");
const storyContainer = d3.select("#storyContainer");
const vizShell = d3.select(".viz-shell");
const bubbleSvg = d3.select("#bubbleViz");
const mapViz = d3.select("#mapViz");
const vizOverlay = d3.select("#vizPrompt");
const mapYearSlider = d3.select("#map-year-input");
const mapYearLabel = d3.select("#map-year-display");
const tooltip = d3.select("#tooltip");
const tooltipCountry = d3.select("#tooltipCountry");
const tooltipProduction = d3.select("#tooltipProduction");
const tooltipShare = d3.select("#tooltipShare");
const narrativeScroller = d3.select("#narrativeScroller");

// --- 6. Bubble Chart Functions ---
function animateBigNumber(targetValue) {
  bigNumberValue
    .interrupt()
    .text(formatTons(0));

  bigNumberValue
    .transition()
    .duration(2000)
    .ease(d3.easeCubicOut)
    .tween("text", () => {
      const interpolate = d3.interpolateNumber(0, targetValue);
      return (t) => {
        bigNumberValue.text(formatTons(interpolate(t)));
      };
    });
}

function resize() {
  const bounds = vizShell.node().getBoundingClientRect();
  width = bounds.width;
  height = bounds.height;
  bubbleSvg.attr("viewBox", `0 0 ${width} ${height}`);
  
  // Resize map if initialized
  if (mapInitialized && mapSvg) {
    resizeMap();
  }
}

function computeContinentCenters() {
  // Use more centered positions with padding to ensure bubbles fit
  const padding = 80; // Padding to account for bubble radii
  return {
    "Africa": { x: width * 0.25, y: height * 0.50 },
    "North America": { x: width * 0.50, y: height * 0.30 },
    "South America": { x: width * 0.50, y: height * 0.70 },
    "Asia": { x: width * 0.75, y: height * 0.45 },
    "Oceania": { x: width * 0.80, y: height * 0.70 }
  };
}

function buildNodesForYear(year) {
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

function runSimulation(layout, nodes) {
  const center = { x: width / 2, y: height / 2 };
  const continentCenters = computeContinentCenters();

  const forceX = d3.forceX((node) => {
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

  const forceY = d3.forceY((node) => {
    if (layout === "continent" || layout === "timeline") {
      const anchor = continentCenters[node.continent] || center;
      return anchor.y;
    }
    return center.y;
  }).strength(layout === "cluster" ? 0.05 : 0.12);

  const simulation = d3.forceSimulation(nodes)
    .force("x", forceX)
    .force("y", forceY)
    .force("collide", d3.forceCollide(node => node.radius + 3))
    .stop();

  // Add padding to account for bubble radii
  const padding = 80;
  const minX = padding;
  const maxX = width - padding;
  const minY = padding;
  const maxY = height - padding;

  for (let i = 0; i < CONFIG.SIMULATION_ITERATIONS; i += 1) {
    simulation.tick();
    
    // Constrain nodes to stay within bounds
    nodes.forEach(node => {
      node.x = Math.max(minX + node.radius, Math.min(maxX - node.radius, node.x));
      node.y = Math.max(minY + node.radius, Math.min(maxY - node.radius, node.y));
    });
  }

  nodes.forEach((node) => {
    nodeState.set(node.country, { x: node.x, y: node.y });
  });
}

function updateTooltip(event, node) {
  tooltip
    .style("left", `${event.pageX}px`)
    .style("top", `${event.pageY - 20}px`);

  tooltipCountry.text(node.country.toUpperCase());
  tooltipProduction.text(`${formatTons(node.production)} tons`);
  tooltipShare.text(`${formatPercent(node.share)} of global harvest`);
}

function showTooltip(event, node) {
  tooltip.classed("hidden", false);
  updateTooltip(event, node);
}

function hideTooltip() {
  tooltip.classed("hidden", true);
}

function renderNodes(step) {
  const layout = step.layout;
  const highlightStep = step.id === "reveal";
  const nodesSelection = bubbleSvg.selectAll(".bubble-group")
    .data(nodes, d => d.country);

  const nodesEnter = nodesSelection.enter()
    .append("g")
    .attr("class", "bubble-group")
    .attr("transform", d => `translate(${d.x}, ${d.y})`)
    .style("opacity", 0);

  nodesEnter.append("circle")
    .attr("r", 0)
    .attr("fill", d => continentColorScale(d.continent))
    .on("mouseenter", (event, d) => {
      d3.select(event.currentTarget.parentNode).classed("show-label", true);
      showTooltip(event, d);
    })
    .on("mousemove", (event, d) => updateTooltip(event, d))
    .on("mouseleave", (event) => {
      d3.select(event.currentTarget.parentNode).classed("show-label", false);
      hideTooltip();
    });

  nodesEnter.append("text")
    .attr("class", "bubble-label")
    .attr("y", 4)
    .text(d => d.country);

  const nodesMerged = nodesEnter.merge(nodesSelection);

  nodesMerged
    .transition()
    .duration(650)
    .attr("transform", d => `translate(${d.x}, ${d.y})`)
    .style("opacity", 1);

  nodesMerged
    .classed("muted", d => highlightStep && d.rank > 2)
    .classed("highlight", d => highlightStep && d.rank <= 2)
    .classed("show-label", false);

  nodesMerged.select("circle")
    .transition()
    .duration(650)
    .attr("r", d => d.radius)
    .attr("fill", d => continentColorScale(d.continent))
    .attr("opacity", d => highlightStep && d.rank > 2 ? 0.2 : 1);

  nodesMerged.select(".bubble-label")
    .transition()
    .duration(500)
    .attr("y", d => d.radius / 2 + 12);

  nodesSelection.exit()
    .transition()
    .duration(400)
    .style("opacity", 0)
    .remove();

  const continentLabelsData = (layout === "continent" || layout === "timeline")
    ? d3.groups(nodes, d => d.continent).map(([continent]) => {
      const anchor = computeContinentCenters()[continent] || { x: width / 2, y: height / 2 };
      return { continent, ...anchor };
    })
    : [];

  const continentLabels = bubbleSvg.selectAll(".continent-label")
    .data(continentLabelsData, d => d.continent);

  continentLabels.enter()
    .append("text")
    .attr("class", "continent-label")
    .attr("x", d => d.x)
    .attr("y", d => d.y - 50)
    .style("opacity", 0)
    .text(d => d.continent)
    .transition()
    .duration(500)
    .style("opacity", 1);

  continentLabels
    .transition()
    .duration(500)
    .attr("x", d => d.x)
    .attr("y", d => d.y - 50);

  continentLabels.exit()
    .transition()
    .duration(300)
    .style("opacity", 0)
    .remove();
}

// --- 7. Map Visualization Functions ---
function initMap() {
  if (mapInitialized) return;
  
  const container = d3.select("#map-container");
  const containerNode = container.node();
  if (!containerNode) return;
  
  const containerWidth = containerNode.offsetWidth || width;
  const containerHeight = containerNode.offsetHeight || height;

  mapSvg = d3.select("#world-map")
    .attr("width", containerWidth)
    .attr("height", containerHeight);

  // Use fitSize to automatically fit the world map within the container
  mapProjection = d3.geoMercator();
  
  // We'll fit it after loading the world data

  mapPath = d3.geoPath().projection(mapProjection);

  mapG = mapSvg.append("g");

  mapZoom = d3.zoom()
    .scaleExtent([1, 20])
    .on("zoom", (event) => {
      mapCurrentTransform = event.transform;
      mapG.attr("transform", event.transform);
    });

  mapSvg.call(mapZoom);

  d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
    .then(data => {
      worldData = data;
      const countries = topojson.feature(data, data.objects.countries);
      
      // Fit the map to the container with minimal padding
      const padding = 40; // Minimal padding to zoom in more
      const fitWidth = containerWidth - padding * 2;
      const fitHeight = containerHeight - padding * 2;
      
      mapProjection.fitSize(
        [fitWidth, fitHeight],
        { type: "FeatureCollection", features: countries.features }
      );
      
      // Adjust translate to account for padding
      const currentTranslate = mapProjection.translate();
      mapProjection.translate([
        currentTranslate[0] + padding,
        currentTranslate[1] + padding
      ]);
      
      mapPath = d3.geoPath().projection(mapProjection);
      
      mapG.selectAll("path")
        .data(countries.features)
        .enter()
        .append("path")
        .attr("class", "country")
        .attr("d", mapPath)
        .attr("data-name", d => d.properties.name)
        .on("click", function(event, d) {
          let countryName = d.properties.name; 
          const dataName = reverseCountryMap[countryName] || countryName; 
          showMapCountryInfo(dataName, countryName);
        });
      
      mapBubbleGroup = mapG.append("g").attr("class", "bubbles");
      
      if (Object.keys(mapCocoaData).length > 0) {
        updateMapBubbles();
      }
      
      mapInitialized = true;
    })
    .catch(error => {
      console.error("Error loading map:", error);
    });
}

function resizeMap() {
  if (!mapInitialized || !mapSvg || !worldData) return;
  
  const container = d3.select("#map-container");
  const containerNode = container.node();
  if (!containerNode) return;
  
  const containerWidth = containerNode.offsetWidth || width;
  const containerHeight = containerNode.offsetHeight || height;

  mapSvg
    .attr("width", containerWidth)
    .attr("height", containerHeight);

  // Re-fit the map to the new container size
  const countries = topojson.feature(worldData, worldData.objects.countries);
  const padding = 40; // Minimal padding to zoom in more
  const fitWidth = containerWidth - padding * 2;
  const fitHeight = containerHeight - padding * 2;
  
  mapProjection.fitSize(
    [fitWidth, fitHeight],
    { type: "FeatureCollection", features: countries.features }
  );
  
  // Adjust translate to account for padding
  const currentTranslate = mapProjection.translate();
  mapProjection.translate([
    currentTranslate[0] + padding,
    currentTranslate[1] + padding
  ]);
  
  mapPath = d3.geoPath().projection(mapProjection);

  mapG.selectAll("path.country")
    .attr("d", mapPath);
  
  updateMapBubbles();
}

function getCountryCentroid(countryName) {
  if (!worldData) return null;
  
  const countries = topojson.feature(worldData, worldData.objects.countries);
  const countryFeature = countries.features.find(
    d => d.properties.name === countryName
  );
  
  if (countryFeature && countryFeature.geometry) {
    return mapProjection(d3.geoCentroid(countryFeature.geometry));
  }
  return null;
}

function updateMapBubbles() {
  if (!worldData || !mapBubbleGroup || Object.keys(mapCocoaData).length === 0) return;

  const bubbleData = [];
  let maxProduction = 0;

  Object.keys(mapCocoaData).forEach(country => {
    const yearData = mapCocoaData[country][mapCurrentYear];
    if (yearData && yearData.Production) {
      const production = yearData.Production;
      
      let mapCountryName = countryNameMap[country] || country;
      const centroid = getCountryCentroid(mapCountryName);
      
      if (centroid && !isNaN(centroid[0]) && !isNaN(centroid[1])) {
        bubbleData.push({
          country: country,
          displayName: mapCountryName,
          production: production,
          areaHarvested: yearData['Area harvested'],
          yield: yearData.Yield,
          x: centroid[0],
          y: centroid[1]
        });
        
        if (production > maxProduction) {
          maxProduction = production;
        }
      }
    }
  });

  if (maxProduction === 0 || bubbleData.length === 0) {
    mapBubbleGroup.selectAll("circle").remove();
    return;
  }

  mapRadiusScale = d3.scaleSqrt()
    .domain([0, maxProduction])
    .range([2, 15]); // Much smaller bubbles to fit the map scale

  const bubbles = mapBubbleGroup.selectAll("circle")
    .data(bubbleData, d => d.country);

  const bubblesEnter = bubbles.enter()
    .append("circle")
    .attr("class", "bubble")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", 0)
    .attr("fill", d => {
      const continent = countryToContinent[d.country] || "Africa";
      return CONTINENT_COLORS[continent];
    })
    .attr("opacity", 0.85)
    .style("cursor", "pointer")
    .on("click", function(event, d) {
      showMapCountryInfo(d.country, d.displayName);
    });

  bubblesEnter.merge(bubbles)
    .transition()
    .duration(500)
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", d => mapRadiusScale(d.production))
    .attr("fill", d => {
      const continent = countryToContinent[d.country] || "Africa";
      return CONTINENT_COLORS[continent];
    });

  bubbles.exit()
    .transition()
    .duration(300)
    .attr("r", 0)
    .remove();
}

function showMapCountryInfo(dataName, displayName) {
  const data = mapCocoaData[dataName]?.[mapCurrentYear];
  
  if (!data || !data.Production) {
    document.getElementById("map-info-panel").classList.remove("active");
    return;
  }
  
  const panel = document.getElementById("map-info-panel");
  const flag = document.getElementById("country-flag");
  const name = document.getElementById("country-name");
  const grid = document.getElementById("data-grid");
  
  flag.textContent = countryFlags[dataName] || countryFlags[displayName] || "🌍";
  name.textContent = displayName || dataName;

  grid.innerHTML = `
    ${data.Production ? `
      <div class="data-item">
        <div class="data-label">Production</div>
        <div class="data-value">${(data.Production * TONNES_TO_US_TONS).toLocaleString('en-US', {maximumFractionDigits: 1})} tons</div>
      </div>
    ` : ''}
    ${data['Area harvested'] ? `
      <div class="data-item">
        <div class="data-label">Area Harvested</div>
        <div class="data-value">${(data['Area harvested'] * HECTARES_TO_ACRES).toLocaleString('en-US', {maximumFractionDigits: 1})} acres</div>
      </div>
    ` : ''}
    ${data.Yield ? `
      <div class="data-item">
        <div class="data-label">Yield</div>
        <div class="data-value">${(data.Yield * KG_PER_HA_TO_LBS_PER_ACRE).toLocaleString('en-US', {maximumFractionDigits: 1})} lbs/acre</div>
      </div>
    ` : ''}
  `;

  panel.classList.add("active");
}

function parseMapCSVData(rows) {
  mapCocoaData = {};
  
  rows.forEach(d => {
    const country = d.Area?.trim();
    const element = d.Element?.trim();
    const year = parseInt(d.Year);
    const value = parseFloat(d.Value); 
    
    if (!country || !element || !year || isNaN(year) || isNaN(value)) return;
    
    if (!mapCocoaData[country]) {
      mapCocoaData[country] = {};
    }
    if (!mapCocoaData[country][year]) {
      mapCocoaData[country][year] = {};
    }
    
    mapCocoaData[country][year][element] = value;
  });

  const allYears = [];
  Object.keys(mapCocoaData).forEach(country => {
    Object.keys(mapCocoaData[country]).forEach(year => {
      allYears.push(parseInt(year));
    });
  });
  
  if (allYears.length > 0) {
    const minYear = d3.min(allYears);
    const maxYear = d3.max(allYears);
    
    const yearInput = document.getElementById("map-year-input");
    if (yearInput) {
      yearInput.min = minYear;
      yearInput.max = maxYear;
      yearInput.value = mapCurrentYear;
      mapYearLabel.text(`Year: ${mapCurrentYear}`);
    }
  }

  if (mapInitialized) {
    updateMapBubbles();
  }
}

// --- 8. Scrollytelling Logic ---
function setupScroller() {
  steps.forEach((step, index) => {
    const panel = narrativeScroller.append("aside")
      .attr("class", "story-panel story-step")
      .attr("id", `story-step-${index}`)
      .attr("data-step-index", index);

    panel.append("p").attr("class", "step-count").text(`Step ${index + 1} of ${steps.length}`);
    panel.append("h2").attr("class", "story-headline").text(step.headline);
    panel.append("p").attr("class", "story-copy").html(step.copy);
  });

  const stepElements = document.querySelectorAll('.story-step:not(.intro-panel)');

  const options = {
    root: null, 
    rootMargin: '0px 0px -50% 0px',
    threshold: 0 
  };

  observer = new IntersectionObserver(handleIntersect, options);

  stepElements.forEach(element => {
    observer.observe(element);
  });
  
  setStep(0);
}

function handleIntersect(entries) {
  entries.forEach(entry => {
    const index = +entry.target.getAttribute('data-step-index');
    
    if (index === null || index === undefined || entry.target.classList.contains('intro-panel')) {
      return;
    }
    
    if (entry.isIntersecting) {
      if (currentStepIndex !== index) {
        setStep(index);
      }
    }
  });
}

function setStep(index) {
  currentStepIndex = index;
  const step = steps[currentStepIndex];
  
  if (step.prompt) {
    vizOverlay.text(step.prompt).classed("visible", true);
  } else {
    vizOverlay.classed("visible", false);
  }

  // Switch between bubble chart and map
  if (step.vizType === "map") {
    bubbleSvg.classed("hidden", true);
    mapViz.classed("hidden", false);
    
    if (!mapInitialized) {
      initMap();
    }
    
    mapCurrentYear = step.showSlider ? parseInt(document.getElementById("map-year-input")?.value || step.year) : step.year;
    mapYearLabel.text(`Year: ${mapCurrentYear}`);
    if (document.getElementById("map-year-input")) {
      document.getElementById("map-year-input").value = mapCurrentYear;
    }
    
    if (Object.keys(mapCocoaData).length > 0) {
      updateMapBubbles();
    }
  } else {
    bubbleSvg.classed("hidden", false);
    mapViz.classed("hidden", true);
    
    currentYear = step.year;
    nodes = buildNodesForYear(currentYear);
    runSimulation(step.layout, nodes);
    renderNodes(step);
  }
}

function updateMapYearFromSlider(value) {
  mapCurrentYear = value;
  mapYearLabel.text(`Year: ${mapCurrentYear}`);
  
  updateMapBubbles();
  
  const panel = document.getElementById("map-info-panel");
  if (panel.classList.contains("active")) {
    const countryNameEl = document.getElementById("country-name");
    const displayName = countryNameEl.textContent;
    const dataName = reverseCountryMap[displayName] || displayName;
    showMapCountryInfo(dataName, displayName);
  }
}

async function initializeStory() {
  resize();
  nodeState.clear();
  currentYear = steps[0].year;

  if (!dataReady) {
    vizOverlay.text("Loading cocoa data…").classed("visible", true);
    await new Promise(resolve => dataReadyResolvers.push(resolve));
    vizOverlay.classed("visible", false);
  }
  
  setupScroller();
}

function attachEventListeners() {
  // Bubble chart year slider (if needed)
  
  // Map year slider (in viz shell)
  mapYearSlider.on("input", (event) => {
    const value = +event.target.value;
    updateMapYearFromSlider(value);
  });
  

  // Map zoom controls
  document.getElementById("zoom-in")?.addEventListener("click", () => {
    if (mapSvg) {
      mapSvg.transition().call(mapZoom.scaleBy, 1.5);
    }
  });

  document.getElementById("zoom-out")?.addEventListener("click", () => {
    if (mapSvg) {
      mapSvg.transition().call(mapZoom.scaleBy, 0.75);
    }
  });

  document.getElementById("reset-view")?.addEventListener("click", () => {
    if (mapSvg) {
      mapSvg.transition().call(mapZoom.transform, d3.zoomIdentity);
    }
  });

  document.getElementById("close-info")?.addEventListener("click", () => {
    document.getElementById("map-info-panel").classList.remove("active");
  });

  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      resize();
      if (steps[currentStepIndex] && steps[currentStepIndex].vizType === "bubble" && nodes.length > 0) {
        const step = steps[currentStepIndex];
        nodes = buildNodesForYear(currentYear);
        runSimulation(step.layout, nodes);
        renderNodes(step);
      } else if (steps[currentStepIndex] && steps[currentStepIndex].vizType === "map") {
        resizeMap();
      }
    }, 150);
  });
}

function loadData() {
  d3.csv(CONFIG.DATA_FILE, d => {
    if (d.Element !== "Production") return null; 
    return {
      year: +d.Year,
      country: d.Area.trim(),
      production: +d.Value * TONNES_TO_POUNDS
    };
  }).then(data => {
    const filtered = data.filter(Boolean).filter(d => d.year >= CONFIG.START_YEAR && d.year <= CONFIG.END_YEAR);

    dataByYear = d3.rollup(
      filtered,
      values => d3.rollup(values, v => d3.sum(v, d => d.production), d => d.country),
      d => d.year
    );

    dataByYear.forEach((countryMap, year) => {
      let yearTotal = 0;
      countryMap.forEach(value => {
        yearTotal += value;
        if (value > globalMaxCountry) globalMaxCountry = value;
      });
      yearTotals.set(year, yearTotal);
    });

    radiusScale.domain([0, globalMaxCountry]);

    const total2023 = yearTotals.get(CONFIG.DEFAULT_YEAR) || 0;
    animateBigNumber(total2023);

    dataReady = true;
    dataReadyResolvers.forEach(fn => fn());
    dataReadyResolvers = [];
    
    // Load map data separately
    d3.csv(CONFIG.DATA_FILE)
      .then(rows => {
        parseMapCSVData(rows);
      })
      .catch(error => {
        console.error("Error loading map CSV:", error);
      });
    
    initializeStory();
  }).catch(error => {
    console.error("Error loading or parsing data:", error);
    vizOverlay
      .classed("visible", true)
      .text("We couldn't load the cocoa data. Please ensure 'data/cocoa_data.csv' exists.");
  });
}

// --- 9. Kick-off ---
attachEventListeners();
loadData();

