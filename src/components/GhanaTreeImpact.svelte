<script lang="ts">
	import { onMount } from "svelte";
	import Chart from "chart.js/auto";
	import type { Chart as ChartType } from "chart.js/auto";

	// DOM references
	let riverCanvas: HTMLCanvasElement;
	let stackCanvas: HTMLCanvasElement;
	let mountainContainer: HTMLDivElement;

	// Data
	const yearlyData = {
		labels: ['2001', '2002', '2003', '2004', '2005', '2006', '2007', '2008', '2009', '2010',
			'2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020',
			'2021', '2022'],
		values: [43676, 78393, 24946, 17628, 41339, 27143, 40184, 37826, 38256, 19476,
			36202, 36630, 81203, 120207, 57391, 119243, 115332, 151531, 88265, 136614,
			101413, 118644]
	};

	const valuesK = yearlyData.values.map(v => Math.round(v / 1000));

	// Calculate cumulative
	let cumulative = 0;
	const cumulativeValues = yearlyData.values.map(v => {
		cumulative += v;
		return Math.round(cumulative / 1000);
	});

	// Get color based on value
	function getChocolateColor(value: number, max: number): string {
		const normalized = value / max;
		if (normalized > 0.66) return '#3E2723'; // Dark chocolate
		if (normalized > 0.33) return '#6D4C41'; // Milk chocolate
		return '#A1887F'; // Light chocolate
	}

	// Convert hectares to tree count range (400-600 trees per hectare)
	function hectaresToTrees(hectares: number): string {
		const treesMin = Math.round(hectares * 400 / 1000000);
		const treesMax = Math.round(hectares * 600 / 1000000);
		if (treesMin === treesMax) {
			return `${treesMin} million trees`;
		}
		return `${treesMin}-${treesMax} million trees`;
	}

	function adjustBrightness(color: string, amount: number): string {
		const hex = color.replace('#', '');
		const num = parseInt(hex, 16);
		const r = Math.max(0, Math.min(255, (num >> 16) + amount));
		const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
		const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
		return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
	}

	const charts: ChartType[] = [];

	onMount(() => {
		// Chart 1: Melting River (Smooth Area Chart with Gradient)
		charts[0] = new Chart(riverCanvas, {
			type: 'line',
			data: {
				labels: yearlyData.labels,
				datasets: [{
					label: 'Forest Loss (1000 ha)',
					data: valuesK,
					backgroundColor: function(context) {
						const ctx = context.chart.ctx;
						const gradient = ctx.createLinearGradient(0, 0, 0, 350);
						gradient.addColorStop(0, 'rgba(62, 39, 35, 0.9)');
						gradient.addColorStop(0.4, 'rgba(109, 76, 65, 0.7)');
						gradient.addColorStop(0.7, 'rgba(141, 110, 99, 0.5)');
						gradient.addColorStop(1, 'rgba(188, 170, 164, 0.3)');
						return gradient;
					},
					borderColor: '#3E2723',
					borderWidth: 4,
					fill: true,
					tension: 0.4,
					pointRadius: 8,
					pointBackgroundColor: function(context) {
						const value = context.parsed?.y ?? 0;
						return getChocolateColor(value, Math.max(...valuesK));
					},
					pointBorderColor: '#3E2723',
					pointBorderWidth: 3,
					pointHoverRadius: 12,
					pointHoverBorderWidth: 4
				}]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { display: false },
					tooltip: {
						backgroundColor: '#3E2723',
						titleColor: '#FFF8E1',
						bodyColor: '#FFF8E1',
						borderColor: '#8D6E63',
						borderWidth: 2,
						padding: 12,
						displayColors: false,
						callbacks: {
							label: function(context) {
								const hectares = context.parsed.y * 1000;
								const trees = hectaresToTrees(hectares);
								return [
									'Loss: ' + context.parsed.y + 'k hectares',
									'≈ ' + trees
								];
							}
						}
					}
				},
				scales: {
					x: {
						grid: {
							color: 'rgba(141, 110, 99, 0.1)'
						},
						ticks: {
							color: '#3E2723',
							font: { size: 11, weight: 'bold' }
						}
					},
					y: {
						beginAtZero: true,
						grid: {
							color: 'rgba(141, 110, 99, 0.1)'
						},
						ticks: {
							color: '#3E2723',
							font: { size: 11, weight: 'bold' },
							callback: function(value) {
								return value + 'k';
							}
						},
						title: {
							display: true,
							text: 'Hectares Lost (thousands)',
							color: '#3E2723',
							font: { size: 12, weight: 'bold' }
						}
					}
				},
				interaction: {
					intersect: false,
					mode: 'index'
				}
			}
		});

		// Chart 2: Stacking Chocolate (Cumulative Area)
		charts[1] = new Chart(stackCanvas, {
			type: 'line',
			data: {
				labels: yearlyData.labels,
				datasets: [{
					label: 'Cumulative Loss (1000 ha)',
					data: cumulativeValues,
					backgroundColor: function(context) {
						const ctx = context.chart.ctx;
						const gradient = ctx.createLinearGradient(0, 350, 0, 0);
						gradient.addColorStop(0, 'rgba(188, 170, 164, 0.4)');
						gradient.addColorStop(0.3, 'rgba(141, 110, 99, 0.6)');
						gradient.addColorStop(0.6, 'rgba(109, 76, 65, 0.8)');
						gradient.addColorStop(1, 'rgba(62, 39, 35, 1)');
						return gradient;
					},
					borderColor: '#3E2723',
					borderWidth: 4,
					fill: true,
					tension: 0.1,
					pointRadius: 7,
					pointBackgroundColor: '#6D4C41',
					pointBorderColor: '#FFF8E1',
					pointBorderWidth: 3,
					pointHoverRadius: 11,
					pointHoverBackgroundColor: '#3E2723',
					pointHoverBorderColor: '#FFF8E1',
					pointHoverBorderWidth: 4
				}]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { display: false },
					tooltip: {
						backgroundColor: '#6D4C41',
						titleColor: '#FFF8E1',
						bodyColor: '#FFF8E1',
						borderColor: '#3E2723',
						borderWidth: 3,
						padding: 12,
						displayColors: false,
						callbacks: {
							label: function(context) {
								const hectares = context.parsed.y * 1000;
								const trees = hectaresToTrees(hectares);
								return [
									'Total: ' + context.parsed.y.toLocaleString() + 'k hectares lost',
									'≈ ' + trees
								];
							}
						}
					}
				},
				scales: {
					x: {
						grid: {
							color: 'rgba(141, 110, 99, 0.1)'
						},
						ticks: {
							color: '#3E2723',
							font: { size: 11, weight: 'bold' }
						}
					},
					y: {
						beginAtZero: true,
						grid: {
							color: 'rgba(141, 110, 99, 0.1)'
						},
						ticks: {
							color: '#3E2723',
							font: { size: 11, weight: 'bold' },
							callback: function(value) {
								return value + 'k';
							}
						},
						title: {
							display: true,
							text: 'Total Cumulative Loss (thousands)',
							color: '#3E2723',
							font: { size: 12, weight: 'bold' }
						}
					}
				}
			}
		});

		// Create mountains
		if (mountainContainer) {
			const maxValue = Math.max(...yearlyData.values);
			const maxHeight = 280;

			yearlyData.labels.forEach((year, i) => {
				const value = yearlyData.values[i];
				const height = (value / maxValue) * maxHeight;
				const color = getChocolateColor(value, maxValue);

				const mountain = document.createElement('div');
				mountain.className = 'mountain';
				mountain.style.height = height + 'px';
				mountain.style.background = `linear-gradient(145deg, ${color}, ${adjustBrightness(color, -20)})`;

				const label = document.createElement('div');
				label.className = 'mountain-label';
				label.textContent = year;

				const valueLabel = document.createElement('div');
				valueLabel.className = 'mountain-value';
				valueLabel.textContent = Math.round(value / 1000) + 'k ha';

				mountain.appendChild(label);
				mountain.appendChild(valueLabel);
				mountainContainer.appendChild(mountain);
			});
		}

		return () => {
			charts.forEach(chart => chart?.destroy());
		};
	});
</script>

<section class="ghana-impact-section" aria-label="Ghana tree cover loss analysis">
	<div class="container">
		<div class="main-layout">
			<div class="visualizations">
				<!-- Viz 1: Melting Chocolate River (Annual Loss) -->
				<div class="viz-card">
					<h2 class="viz-title">The Melting Forest River</h2>
					<p class="viz-description">Watch how forest loss flows through the years - deeper colors show heavier losses. Hover to see tree count conversions.</p>
					<div class="canvas-wrapper">
						<canvas bind:this={riverCanvas}></canvas>
					</div>
				</div>

				<!-- Viz 2: Stacking Chocolate (Cumulative) -->
				<div class="viz-card">
					<h2 class="viz-title">The Growing Stack</h2>
					<p class="viz-description">Each layer adds to the total - see how deforestation builds up over time</p>
					<div class="canvas-wrapper">
						<canvas bind:this={stackCanvas}></canvas>
					</div>
				</div>

				<!-- Viz 3: Chocolate Bar Mountains (Peaks & Valleys) -->
				<div class="viz-card">
					<h2 class="viz-title">The Chocolate Mountains</h2>
					<p class="viz-description">Tallest peaks mark the worst years - hover over each mountain to explore</p>
					<div class="mountain-range" bind:this={mountainContainer}></div>
				</div>
			</div>

			<div class="sidebar">
				<div class="summary-card">
					<h3>Quick Facts</h3>
					<div class="stat-item">
						<div class="stat-label">Total Loss (2001-2022)</div>
						<div class="stat-value">1.58M hectares</div>
					</div>
					<div class="stat-item">
						<div class="stat-label">Worst Year</div>
						<div class="stat-value">2018 (152K ha)</div>
					</div>
					<div class="stat-item">
						<div class="stat-label">Best Year</div>
						<div class="stat-value">2004 (18K ha)</div>
					</div>
					<div class="stat-item">
						<div class="stat-label">Average Annual Loss</div>
						<div class="stat-value">72K hectares</div>
					</div>
				</div>

				<div class="legend-card">
					<h4>Color Guide</h4>
					<div class="legend-item">
						<div class="legend-color high"></div>
						<span>High Loss (100K+ ha)</span>
					</div>
					<div class="legend-item">
						<div class="legend-color medium"></div>
						<span>Medium Loss (50-100K ha)</span>
					</div>
					<div class="legend-item">
						<div class="legend-color low"></div>
						<span>Low Loss (0-50K ha)</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.ghana-impact-section {
		font-family: 'Source Sans 3', system-ui, -apple-system, sans-serif;
		padding: 2rem;
		background: none;
		position: relative;
		color: rgba(255, 248, 240, 0.94);
		overflow-x: hidden;
		width: 100%;
		height: 100%;
	}

	.container {
		max-width: 1400px;
		margin: 0 auto;
		position: relative;
		z-index: 1;
		height: 100%;
	}

	.main-layout {
		display: grid;
		grid-template-columns: 1fr 280px;
		gap: 1.5rem;
		height: 100%;
	}

	.visualizations {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		overflow-y: auto;
		max-height: calc(100vh - 120px);
		padding-right: 0.5rem;
	}

	.viz-card {
		background: rgba(255, 255, 255, 0.98);
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 0 10px 30px rgba(62, 39, 35, 0.15);
		border: 2px solid rgba(141, 110, 99, 0.4);
		transition: transform 0.3s ease, box-shadow 0.3s ease;
		flex-shrink: 0;
	}

	.viz-card:hover {
		transform: translateY(-3px);
		box-shadow: 0 15px 40px rgba(62, 39, 35, 0.25);
	}

	.viz-title {
		font-family: 'Playfair Display', 'Times New Roman', serif;
		color: #3E2723;
		font-size: 1.4rem;
		margin-bottom: 0.4rem;
		font-weight: 600;
	}

	.viz-description {
		color: #6D4C41;
		margin-bottom: 1rem;
		font-size: 0.95rem;
		line-height: 1.5;
	}

	.canvas-wrapper {
		position: relative;
		height: 280px;
	}

	.mountain-range {
		position: relative;
		height: 320px;
		display: flex;
		align-items: flex-end;
		justify-content: space-around;
		padding: 20px 10px;
		background: linear-gradient(to top, rgba(188, 170, 164, 0.3) 0%, transparent 100%);
		border-radius: 10px;
		gap: 2px;
	}

	:global(.mountain) {
		position: relative;
		width: 28px;
		min-width: 20px;
		background: linear-gradient(145deg, #8D6E63, #6D4C41);
		border-radius: 6px 6px 0 0;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 10px rgba(62, 39, 35, 0.3);
	}

	:global(.mountain:hover) {
		transform: scale(1.08);
		filter: brightness(1.1);
	}

	:global(.mountain-label) {
		position: absolute;
		bottom: -22px;
		left: 50%;
		transform: translateX(-50%);
		font-size: 0.6rem;
		color: rgba(255, 248, 240, 0.85);
		font-weight: bold;
		white-space: nowrap;
	}

	:global(.mountain-value) {
		position: absolute;
		top: -28px;
		left: 50%;
		transform: translateX(-50%);
		background: #3E2723;
		color: white;
		padding: 4px 8px;
		border-radius: 5px;
		font-size: 0.7rem;
		font-weight: bold;
		white-space: nowrap;
		opacity: 0;
		transition: opacity 0.3s ease;
		z-index: 10;
	}

	:global(.mountain:hover .mountain-value) {
		opacity: 1;
	}

	.sidebar {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		position: sticky;
		top: 2rem;
		height: fit-content;
	}

	.summary-card {
		background: linear-gradient(145deg, rgba(109, 76, 65, 0.95), rgba(93, 64, 55, 0.95));
		border-radius: 12px;
		padding: 1.25rem;
		color: white;
		box-shadow: 0 8px 20px rgba(62, 39, 35, 0.3);
		border: 1px solid rgba(255, 224, 189, 0.2);
	}

	.summary-card h3 {
		font-family: 'Playfair Display', 'Times New Roman', serif;
		font-size: 1.2rem;
		margin-bottom: 0.75rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.25);
		padding-bottom: 0.5rem;
		color: rgba(255, 248, 240, 0.96);
	}

	.stat-item {
		margin-bottom: 0.75rem;
		padding: 0.6rem;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		transition: background 0.3s ease;
	}

	.stat-item:last-child {
		margin-bottom: 0;
	}

	.stat-item:hover {
		background: rgba(255, 255, 255, 0.18);
	}

	.stat-label {
		font-size: 0.8rem;
		opacity: 0.85;
		margin-bottom: 0.2rem;
	}

	.stat-value {
		font-size: 1.1rem;
		font-weight: bold;
		color: rgba(255, 248, 240, 0.96);
	}

	.legend-card {
		background: rgba(255, 255, 255, 0.95);
		border-radius: 12px;
		padding: 1.25rem;
		box-shadow: 0 5px 15px rgba(62, 39, 35, 0.15);
		border: 1px solid rgba(188, 170, 164, 0.5);
	}

	.legend-card h4 {
		font-family: 'Playfair Display', 'Times New Roman', serif;
		color: #3E2723;
		margin-bottom: 0.75rem;
		font-size: 1rem;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.legend-item:last-child {
		margin-bottom: 0;
	}

	.legend-item span {
		color: #3E2723;
		font-weight: 500;
		font-size: 0.85rem;
	}

	.legend-color {
		width: 24px;
		height: 16px;
		border-radius: 4px;
		border: 1px solid #3E2723;
	}

	.legend-color.high {
		background: #3E2723;
	}

	.legend-color.medium {
		background: #6D4C41;
	}

	.legend-color.low {
		background: #A1887F;
	}

	@media (max-width: 1100px) {
		.main-layout {
			grid-template-columns: 1fr;
		}

		.sidebar {
			flex-direction: row;
			position: static;
		}

		.summary-card,
		.legend-card {
			flex: 1;
		}

		.visualizations {
			max-height: none;
			overflow-y: visible;
		}
	}

	@media (max-width: 640px) {
		.ghana-impact-section {
			padding: 1rem;
		}

		.sidebar {
			flex-direction: column;
		}

		.viz-card {
			padding: 1rem;
		}

		.viz-title {
			font-size: 1.2rem;
		}

		.canvas-wrapper {
			height: 220px;
		}

		.mountain-range {
			height: 250px;
		}

		:global(.mountain) {
			width: 12px;
			min-width: 10px;
		}

		:global(.mountain-label) {
			font-size: 0.5rem;
		}
	}
</style>
