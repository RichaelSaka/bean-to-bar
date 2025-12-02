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

// --- 3. D3 Helpers ---
const formatTonnes = d3.format(".2s");
const formatPercent = d3.format(".1%");

function getContinent(country) {
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

// --- 4. Step Definitions ---
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
    copy: "<strong>Côte d’Ivoire</strong> and <strong>Ghana</strong> account for well over half of global cocoa.",
    prompt: "",
    year: CONFIG.DEFAULT_YEAR
  },
  {
    id: "continent",
    layout: "continent",
    headline: "AFRICA CARRIES THE HARVEST.",
    copy: "When we regroup these countries by continent, Africa’s cluster dwarfs the rest. The world’s chocolate depends on just one region.",
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

// --- 5. DOM Selections ---
const bigNumberValue = d3.select("#globalProduction");
const heroSection = d3.select("#heroSection");
const storyContainer = d3.select("#storyContainer");
const vizShell = d3.select(".viz-shell");
const svg = d3.select("#bubbleViz");
const vizOverlay = d3.select("#vizPrompt");
const storyHeadline = d3.select("#storyHeadline");
const storyCopy = d3.select("#storyCopy");
const stepCounter = d3.select("#stepCounter");
const nextStepButton = d3.select("#nextStepButton");
const timelineControls = d3.select("#timelineControls");
const yearSlider = d3.select("#yearSlider");
const yearLabel = d3.select("#yearLabel");
const tooltip = d3.select("#tooltip");
const tooltipCountry = d3.select("#tooltipCountry");
const tooltipProduction = d3.select("#tooltipProduction");
const tooltipShare = d3.select("#tooltipShare");

// --- 6. Initialisation ---
function animateBigNumber(targetValue) {
  bigNumberValue
    .interrupt()
    .text(formatTonnes(0));

  bigNumberValue
    .transition()
    .duration(2000)
    .ease(d3.easeCubicOut)
    .tween("text", () => {
      const interpolate = d3.interpolateNumber(0, targetValue);
      return (t) => {
        bigNumberValue.text(formatTonnes(interpolate(t)));
      };
    });
}

function resize() {
  const bounds = vizShell.node().getBoundingClientRect();
  width = bounds.width;
  height = bounds.height;
  svg.attr("viewBox", `0 0 ${width} ${height}`);
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

  for (let i = 0; i < CONFIG.SIMULATION_ITERATIONS; i += 1) {
    simulation.tick();
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
  tooltipProduction.text(`${formatTonnes(node.production)} tonnes`);
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
  const nodesSelection = svg.selectAll(".bubble-group")
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

  const continentLabels = svg.selectAll(".continent-label")
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
    .attr("y", d => d.y - 50)

  continentLabels.exit()
    .transition()
    .duration(300)
    .style("opacity", 0)
    .remove();
}

function renderStep(step) {
  storyHeadline.text(step.headline);
  storyCopy.html(step.copy);
  stepCounter.text(`Step ${currentStepIndex + 1} of ${steps.length}`);

  if (step.prompt) {
    vizOverlay.text(step.prompt).classed("visible", true);
  } else {
    vizOverlay.classed("visible", false);
  }

  yearLabel.text(`Year: ${currentYear}`);
  timelineControls.classed("hidden", !step.showSlider);
  nextStepButton.text(currentStepIndex === steps.length - 1 ? "Restart ↺" : "Next ▸");

  const targetYear = step.showSlider ? currentYear : step.year;
  currentYear = targetYear;
  yearSlider.property("value", currentYear);

  nodes = buildNodesForYear(currentYear);
  nodes.forEach(node => {
    node.highlight = step.id === "reveal" && node.rank <= 2;
  });

  runSimulation(step.layout, nodes);
  renderNodes(step);
}

function setStep(index) {
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

function updateYearFromSlider(value) {
  currentYear = value;
  yearLabel.text(`Year: ${currentYear}`);
  nodes = buildNodesForYear(currentYear);
  const step = steps[currentStepIndex];
  runSimulation(step.layout, nodes);
  renderNodes(step);
}

function attachEventListeners() {
  d3.select("#startStoryButton").on("click", async () => {
    heroSection.classed("hidden", true);
    storyContainer.classed("hidden", false);
    resize();
    nodeState.clear();
    currentYear = steps[0].year;
    if (!dataReady) {
      vizOverlay.text("Loading cocoa data…").classed("visible", true);
      await new Promise(resolve => dataReadyResolvers.push(resolve));
      vizOverlay.classed("visible", false);
    }
    setStep(0);
  });

  nextStepButton.on("click", handleNextStep);

  yearSlider.on("input", (event) => {
    const value = +event.target.value;
    if (steps[currentStepIndex].showSlider) {
      updateYearFromSlider(value);
    }
  });

  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (!storyContainer.classed("hidden")) {
        resize();
        const step = steps[currentStepIndex];
        nodes = buildNodesForYear(currentYear);
        runSimulation(step.layout, nodes);
        renderNodes(step);
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
      production: +d.Value
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
  }).catch(error => {
    console.error("Error loading or parsing data:", error);
    vizOverlay
      .classed("visible", true)
      .text("We couldn't load the cocoa data. Please check the CSV file path.");
  });
}

// --- 7. Kick-off ---
attachEventListeners();
loadData();
