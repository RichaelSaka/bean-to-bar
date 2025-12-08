<script lang="ts">
	import { onMount } from "svelte";
	import * as d3 from "d3";

	// Country to continent mapping
	const countryToContinent: Record<string, string> = {
		"Côte d'Ivoire": "Africa",
		"Ghana": "Africa",
		"Cameroon": "Africa",
		"Nigeria": "Africa",
		"Uganda": "Africa",
		"Togo": "Africa",
		"Sierra Leone": "Africa",
		"Liberia": "Africa",
		"Madagascar": "Africa",
		"Guinea": "Africa",
		"Congo": "Africa",
		"Democratic Republic of the Congo": "Africa",
		"Angola": "Africa",
		"Central African Republic": "Africa",
		"Gabon": "Africa",
		"Equatorial Guinea": "Africa",
		"Sao Tome and Principe": "Africa",
		"United Republic of Tanzania": "Africa",
		"Comoros": "Africa",
		"Indonesia": "Asia",
		"Malaysia": "Asia",
		"India": "Asia",
		"Philippines": "Asia",
		"Viet Nam": "Asia",
		"Sri Lanka": "Asia",
		"Thailand": "Asia",
		"Timor-Leste": "Asia",
		"Mexico": "North America",
		"Dominican Republic": "North America",
		"Cuba": "North America",
		"Haiti": "North America",
		"Jamaica": "North America",
		"Trinidad and Tobago": "North America",
		"Honduras": "North America",
		"Nicaragua": "North America",
		"Costa Rica": "North America",
		"Panama": "North America",
		"Guatemala": "North America",
		"Belize": "North America",
		"El Salvador": "North America",
		"Grenada": "North America",
		"Dominica": "North America",
		"Saint Lucia": "North America",
		"Saint Vincent and the Grenadines": "North America",
		"Guyana": "South America",
		"Suriname": "South America",
		"Ecuador": "South America",
		"Brazil": "South America",
		"Peru": "South America",
		"Colombia": "South America",
		"Venezuela (Bolivarian Republic of)": "South America",
		"Bolivia (Plurinational State of)": "South America",
		"Papua New Guinea": "Oceania",
		"Solomon Islands": "Oceania",
		"Fiji": "Oceania",
		"Vanuatu": "Oceania",
		"Samoa": "Oceania",
		"Micronesia (Federated States of)": "Oceania"
	};

	// Nicer display names for countries
	const countryDisplayNames: Record<string, string> = {
		"Côte d'Ivoire": "Ivory Coast",
		"Venezuela (Bolivarian Republic of)": "Venezuela",
		"Bolivia (Plurinational State of)": "Bolivia",
		"Viet Nam": "Vietnam",
		"Democratic Republic of the Congo": "DR Congo",
		"United Republic of Tanzania": "Tanzania",
		"Micronesia (Federated States of)": "Micronesia",
		"Saint Vincent and the Grenadines": "St. Vincent"
	};

	// Grid configuration
	const size = 8;
	const cellSpacing = 1.5;
	const groupSpacing = 3;

	// State
	let svgElement: SVGSVGElement;
	let productionData: { country: string; tons: number; continent: string; displayName: string }[] = $state([]);
	let totalTons = $state(0);
	let width = $state(0);
	let height = $state(0);

	function getSquarePosition(index: number) {
		const x0 = Math.floor(index / 100) % 10;
		const x1 = Math.floor(index % 10);
		const y0 = Math.floor(index / 1000);
		const y1 = Math.floor((index % 100) / 10);

		return {
			x: groupSpacing * x0 + (cellSpacing + size) * (x1 + x0 * 10),
			y: groupSpacing * y0 + (cellSpacing + size) * (y1 + y0 * 10)
		};
	}

	onMount(async () => {
		if (!svgElement) return;

		// Load and parse CSV data
		const csvData = await d3.csv("/data/cocoa_data.csv");

		// Filter for 2023 production data
		const production2023 = csvData
			.filter(d => d.Element === "Production" && d.Year === "2023")
			.map(d => ({
				country: d.Area,
				tons: Math.round(parseFloat(d.Value) / 1000), // Convert to thousands
				continent: countryToContinent[d.Area] || "Other",
				displayName: countryDisplayNames[d.Area] || d.Area
			}))
			.filter(d => d.tons > 0)
			.sort((a, b) => b.tons - a.tons);

		productionData = production2023;
		totalTons = production2023.reduce((sum, d) => sum + d.tons, 0);

		const containerWidth = svgElement.parentElement?.clientWidth || 1400;
		width = Math.min(containerWidth, 1400);
		height = 700;

		const svg = d3.select(svgElement)
			.attr("viewBox", `0 0 ${width} ${height}`)
			.attr("preserveAspectRatio", "xMidYMid meet");

		// Calculate offset to center the grid
		const gridWidth = 10 * (10 * (size + cellSpacing) + groupSpacing);
		const offsetX = (width - gridWidth - 300) / 2 + 20;
		const offsetY = 180;

		// Create squares group
		const squaresGroup = svg.append("g")
			.attr("class", "squares")
			.attr("transform", `translate(${offsetX}, ${offsetY})`);

		// Draw all squares
		squaresGroup.selectAll("rect")
			.data(d3.range(totalTons))
			.enter()
			.append("rect")
			.attr("x", (d) => getSquarePosition(d).x)
			.attr("y", (d) => getSquarePosition(d).y)
			.attr("width", size)
			.attr("height", size)
			.attr("fill", "#FFFAF0")
			.attr("rx", 1)
			.attr("class", "waffle-square");

		// Title and labels
		svg.append("text")
			.attr("x", offsetX)
			.attr("y", 40)
			.attr("fill", "#FFFAF0")
			.attr("font-family", "'gopher', Georgia, serif")
			.attr("font-size", "28px")
			.attr("font-weight", "400")
			.attr("font-style", "italic")
			.text("Cocoa Bean Production in 2023");

		svg.append("text")
			.attr("x", offsetX)
			.attr("y", 70)
			.attr("fill", "#FFFAF0")
			.attr("font-family", "'Courier New', Courier, monospace")
			.attr("font-size", "14px")
			.attr("font-weight", "700")
			.text("Unit: 1,000 tons");

		svg.append("text")
			.attr("x", offsetX)
			.attr("y", 110)
			.attr("fill", "#FFFAF0")
			.attr("font-family", "'Courier New', Courier, monospace")
			.attr("font-size", "14px")
			.attr("font-weight", "700")
			.text("Total Amount:");

		// Format total with commas (multiply back to actual tons)
		const totalDisplay = (totalTons * 1000).toLocaleString();
		svg.append("text")
			.attr("x", offsetX)
			.attr("y", 140)
			.attr("fill", "tomato")
			.attr("font-family", "'Courier New', courier-std, monospace")
			.attr("font-size", "24px")
			.attr("font-weight", "700")
			.text(`${totalDisplay} Tons`);

		// Legend - square unit explanation
		const legendGroup = svg.append("g")
			.attr("transform", `translate(${offsetX + gridWidth + 40}, ${offsetY})`);

		// Single square = 1,000 tons legend
		legendGroup.append("rect")
			.attr("x", 0)
			.attr("y", -40)
			.attr("width", size)
			.attr("height", size)
			.attr("fill", "#e8b962")
			.attr("rx", 1);

		legendGroup.append("text")
			.attr("x", 15)
			.attr("y", -32)
			.attr("fill", "#FFFAF0")
			.attr("font-family", "'Courier New', Courier, monospace")
			.attr("font-size", "12px")
			.attr("font-weight", "700")
			.text("= 1,000 tons");

		// Country list
		const countryListGroup = svg.append("g")
			.attr("transform", `translate(${offsetX + gridWidth + 40}, ${offsetY + 20})`);

		// Tooltip text elements (positioned below the Total Amount)
		const tooltipGroup = svg.append("g")
			.attr("transform", `translate(${offsetX}, 170)`)
			.style("opacity", 0);

		const tooltipText = tooltipGroup.append("text")
			.attr("class", "tooltip-text")
			.attr("x", 0)
			.attr("y", 0)
			.attr("fill", "#FFFAF0")
			.attr("font-family", "'Courier New', courier-std, monospace")
			.attr("font-size", "14px")
			.attr("font-weight", "700")
			.text("");

		countryListGroup.selectAll("text")
			.data(productionData.slice(0, 20)) // Show top 20 countries
			.enter()
			.append("text")
			.attr("x", 0)
			.attr("y", (d, i) => i * 18)
			.attr("fill", "#FFFAF0")
			.attr("font-family", "'Courier New', Courier, monospace")
			.attr("font-size", "12px")
			.attr("font-weight", "700")
			.attr("cursor", "pointer")
			.text(d => d.displayName)
			.on("mouseenter", function(_, d) {
				d3.select(this).attr("fill", "tomato");

				// Show tooltip with country name and production value on one line
				tooltipGroup.style("opacity", 1);
				// Clear and rebuild with tspans for different colors
				tooltipText.text("");
				tooltipText.append("tspan")
					.attr("fill", "tomato")
					.text(`${d.displayName}`);
				tooltipText.append("tspan")
					.attr("fill", "#FFFAF0")
					.text(` produced ${(d.tons * 1000).toLocaleString()} tons`);

				// Highlight squares from the top (index 0) up to the country's production
				// This matches the MS-thesis behavior exactly
				squaresGroup.selectAll("rect")
					.attr("fill", (_, i) => {
						if (i < d.tons) {
							return "#7B3F00"; // Rich chocolate brown
						}
						return "#FFFAF0";
					});
			})
			.on("mouseleave", function() {
				d3.select(this).attr("fill", "#FFFAF0");

				// Hide tooltip
				tooltipGroup.style("opacity", 0);

				squaresGroup.selectAll("rect")
					.attr("fill", "#FFFAF0");
			});

		// Resize handler
		const handleResize = () => {
			const newWidth = svgElement.parentElement?.clientWidth || 1400;
			width = Math.min(newWidth, 1400);
			svg.attr("viewBox", `0 0 ${width} ${height}`);
		};

		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
		};
	});
</script>

<div class="waffle-section">
	<div class="sticky-viz">
		<svg bind:this={svgElement} class="waffle-chart"></svg>
	</div>
	<div class="scroll-steps">
		<div class="scroll-step">
			<div class="step-content">
				<p class="step-text">Hover over country names to see how many cocoa beans they produced</p>
			</div>
		</div>
	</div>
</div>

<style>
	.waffle-section {
		position: relative;
		width: 100%;
	}

	.sticky-viz {
		position: sticky;
		top: 0;
		width: 100%;
		height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
	}

	.waffle-chart {
		width: 100%;
		max-width: 1400px;
		height: auto;
		display: block;
	}

	:global(.waffle-square) {
		transition: fill 0.15s ease, opacity 0.15s ease;
	}

	.scroll-steps {
		position: relative;
		z-index: 10;
		pointer-events: none;
	}

	.scroll-step {
		min-height: 90vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
	}

	.step-content {
		background: rgba(0, 0, 0, 0.9);
		padding: 20px 25px;
		max-width: 500px;
		pointer-events: auto;
	}

	.step-text {
		color: #fffaf0;
		font-family: "Courier New", Courier, monospace;
		font-style: normal;
		font-weight: 500;
		font-size: 14px;
		line-height: 1.7;
		margin: 0;
		letter-spacing: -0.01em;
	}

	.step-text strong {
		color: tomato;
		font-weight: 700;
	}

	@media (max-width: 768px) {
		.sticky-viz {
			padding: 1rem;
		}

		.scroll-step {
			padding: 1rem;
		}

		.step-content {
			max-width: 90%;
		}
	}
</style>
