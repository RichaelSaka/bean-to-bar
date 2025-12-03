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
						const gradient = ctx.createLinearGradient(0, 0, 0, 400);
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
					pointRadius: 6,
					pointBackgroundColor: function(context) {
						const value = context.parsed?.y ?? 0;
						return getChocolateColor(value, Math.max(...valuesK));
					},
					pointBorderColor: '#3E2723',
					pointBorderWidth: 2,
					pointHoverRadius: 10,
					pointHoverBorderWidth: 3
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
							color: 'rgba(141, 110, 99, 0.2)'
						},
						ticks: {
							color: '#3E2723',
							font: { size: 12, weight: 'bold' }
						}
					},
					y: {
						beginAtZero: true,
						grid: {
							color: 'rgba(141, 110, 99, 0.2)'
						},
						ticks: {
							color: '#3E2723',
							font: { size: 12, weight: 'bold' },
							callback: function(value) {
								return value + 'k';
							}
						},
						title: {
							display: true,
							text: 'Hectares Lost (thousands)',
							color: '#3E2723',
							font: { size: 14, weight: 'bold' }
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
						const gradient = ctx.createLinearGradient(0, 400, 0, 0);
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
					pointRadius: 5,
					pointBackgroundColor: '#6D4C41',
					pointBorderColor: '#FFF8E1',
					pointBorderWidth: 2,
					pointHoverRadius: 9,
					pointHoverBackgroundColor: '#3E2723',
					pointHoverBorderColor: '#FFF8E1',
					pointHoverBorderWidth: 3
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
							color: 'rgba(141, 110, 99, 0.2)'
						},
						ticks: {
							color: '#3E2723',
							font: { size: 12, weight: 'bold' }
						}
					},
					y: {
						beginAtZero: true,
						grid: {
							color: 'rgba(141, 110, 99, 0.2)'
						},
						ticks: {
							color: '#3E2723',
							font: { size: 12, weight: 'bold' },
							callback: function(value) {
								return value + 'k';
							}
						},
						title: {
							display: true,
							text: 'Total Cumulative Loss (thousands)',
							color: '#3E2723',
							font: { size: 14, weight: 'bold' }
						}
					}
				}
			}
		});

		// Create mountains
		if (mountainContainer) {
			const maxValue = Math.max(...yearlyData.values);
			const maxHeight = 350;

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

<div class="ghana-impact-wrapper">
	<!-- Section 1: Annual Loss -->
	<section class="viz-section">
		<div class="section-inner">
			<div class="text-content">
				<h2 class="viz-title">The Melting Forest River</h2>
				<p class="viz-description">Watch how forest loss flows through the years. Deeper colors show heavier losses.</p>
			</div>
			<div class="viz-card">
				<div class="canvas-wrapper">
					<canvas bind:this={riverCanvas}></canvas>
				</div>
			</div>
			<div class="scroll-cue">
				<span class="scroll-text">Hover to explore</span>
				<div class="scroll-arrow">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M12 19V5M5 12l7-7 7 7"/>
					</svg>
				</div>
			</div>
		</div>
	</section>

	<!-- Section 2: Cumulative Loss -->
	<section class="viz-section">
		<div class="section-inner">
			<div class="text-content">
				<h2 class="viz-title">The Growing Stack</h2>
				<p class="viz-description">Each layer adds to the total. See how deforestation builds up over time. By 2022, Ghana had lost over 1.58 million hectares of tree cover since 2001.</p>
			</div>
			<div class="viz-card">
				<div class="canvas-wrapper">
					<canvas bind:this={stackCanvas}></canvas>
				</div>
			</div>
			<div class="scroll-cue">
				<span class="scroll-text">Hover to explore</span>
				<div class="scroll-arrow">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M12 19V5M5 12l7-7 7 7"/>
					</svg>
				</div>
			</div>
		</div>
	</section>

	<!-- Section 3: Year by Year Comparison -->
	<section class="viz-section">
		<div class="section-inner">
			<div class="text-content">
				<h2 class="viz-title">The Chocolate Mountains</h2>
				<p class="viz-description">Tallest peaks mark the worst years. 2018 was the deadliest with 152,000 hectares lost.</p>
			</div>
			<div class="viz-card mountain-card">
				<div class="mountain-range" bind:this={mountainContainer}></div>
				<div class="legend-row">
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
	</section>
</div>

<style>
	.ghana-impact-wrapper {
		width: 100%;
	}

	.viz-section {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 4rem 2rem;
	}

	.section-inner {
		max-width: 1000px;
		margin: 0 auto;
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.text-content {
		text-align: center;
	}

	.viz-title {
		font-family: 'Playfair Display', 'Times New Roman', serif;
		color: rgba(255, 248, 240, 0.96);
		font-size: clamp(1.8rem, 4vw, 2.5rem);
		margin: 0 0 1rem 0;
		line-height: 1.3;
	}

	.viz-description {
		color: rgba(255, 248, 240, 0.85);
		font-size: clamp(1rem, 2vw, 1.2rem);
		line-height: 1.7;
		margin: 0;
		max-width: 700px;
		margin-left: auto;
		margin-right: auto;
	}

	.scroll-cue {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		margin-top: 2rem;
		animation: bounce 2s infinite;
	}

	.scroll-text {
		color: rgba(255, 248, 240, 0.6);
		font-size: 0.85rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	.scroll-arrow {
		color: rgba(225, 176, 88, 0.7);
	}

	@keyframes bounce {
		0%, 20%, 50%, 80%, 100% {
			transform: translateY(0);
		}
		40% {
			transform: translateY(8px);
		}
		60% {
			transform: translateY(4px);
		}
	}

	.viz-card {
		background: rgba(255, 255, 255, 0.98);
		border-radius: 16px;
		padding: 2rem;
		box-shadow: 0 15px 40px rgba(62, 39, 35, 0.2);
		border: 2px solid rgba(141, 110, 99, 0.3);
	}

	.canvas-wrapper {
		position: relative;
		height: 400px;
	}

	.mountain-card {
		padding: 2rem 2rem 1rem;
	}

	.mountain-range {
		position: relative;
		height: 400px;
		display: flex;
		align-items: flex-end;
		justify-content: space-around;
		padding: 20px 10px 40px;
		background: linear-gradient(to top, rgba(188, 170, 164, 0.2) 0%, transparent 100%);
		border-radius: 10px;
		gap: 4px;
	}

	:global(.mountain) {
		position: relative;
		width: 36px;
		min-width: 24px;
		background: linear-gradient(145deg, #8D6E63, #6D4C41);
		border-radius: 6px 6px 0 0;
		cursor: pointer;
		box-shadow: 0 4px 10px rgba(62, 39, 35, 0.3);
	}

	:global(.mountain:hover) {
		transform: scale(1.08);
		filter: brightness(1.1);
	}

	:global(.mountain-label) {
		position: absolute;
		bottom: -28px;
		left: 50%;
		transform: translateX(-50%);
		font-size: 0.7rem;
		color: #6D4C41;
		font-weight: bold;
		white-space: nowrap;
	}

	:global(.mountain-value) {
		position: absolute;
		top: -32px;
		left: 50%;
		transform: translateX(-50%);
		background: #3E2723;
		color: white;
		padding: 6px 10px;
		border-radius: 6px;
		font-size: 0.8rem;
		font-weight: bold;
		white-space: nowrap;
		opacity: 0;
		z-index: 10;
	}

	:global(.mountain:hover .mountain-value) {
		opacity: 1;
	}

	.legend-row {
		display: flex;
		justify-content: center;
		gap: 2rem;
		margin-top: 1.5rem;
		flex-wrap: wrap;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.legend-item span {
		color: #3E2723;
		font-weight: 500;
		font-size: 0.9rem;
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

	@media (max-width: 768px) {
		.viz-section {
			padding: 3rem 1rem;
		}

		.viz-card {
			padding: 1.5rem;
		}

		.canvas-wrapper {
			height: 300px;
		}

		.mountain-range {
			height: 300px;
		}

		:global(.mountain) {
			width: 14px;
			min-width: 10px;
		}

		:global(.mountain-label) {
			font-size: 0.55rem;
			bottom: -24px;
		}

		.legend-row {
			gap: 1rem;
		}

		.legend-item span {
			font-size: 0.8rem;
		}
	}
</style>
