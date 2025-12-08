<script>
	import { base } from "$app/paths";

	function scrollToIntro() {
		const intro = document.querySelector('.intro');
		if (intro) {
			intro.scrollIntoView({ behavior: 'smooth' });
		}
	}
</script>

<div class="title-section">
	<div class="sticky-viz">
		<section class="title-page">
			<div class="homepage-image">
				<img src="{base}/assets/titlepage.svg" alt="Bean to Bar" />
			</div>

			<!-- Quote overlay (replaces original MS project quote) -->
			<div class="quote-overlay">
				<p class="quote-text">We love chocolate, but the people who grow it can't afford to.</p>
				<p class="scroll-hint">(scroll to start)</p>
			</div>
		</section>
	</div>

	<div class="scroll-steps">
		<div class="scroll-step">
			<div class="info-card">
				<div class="card-line"></div>

				<h1 class="main-title">Bean to Bar</h1>
				<p class="tagline">The hidden journey behind your favorite chocolate</p>

				<div class="card-divider">- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -</div>

				<div class="stats-row">
					<div class="stat-item">
						<span class="stat-number">60% cocoa</span>
						<span class="stat-label">of total global<br/>production in 2023</span>
					</div>
					<div class="stat-item">
						<span class="stat-detail">Ghana & Ivory Coast</span>
						<span class="stat-label-small">7.5400° N, 5.5471° W</span>
					</div>
				</div>

				<div class="stats-row">
					<div class="stat-item">
						<span class="stat-number">6.6% income</span>
						<span class="stat-label">goes to cocoa<br/>farmers</span>
					</div>
					<div class="stat-item">
						<span class="stat-detail">Hand crafted by:</span>
						<span class="stat-label-small">Nhaomi Lartey<br/>Winifred Ofori-Manu<br/>Richael Saka</span>
					</div>
				</div>

				<div class="card-line bottom"></div>

				<p class="net-weight">CS 1710 Harvard University</p>
			</div>
		</div>
	</div>
</div>

<style>
	.title-section {
		position: relative;
		width: 100%;
	}

	.sticky-viz {
		position: sticky;
		top: 0;
		width: 100%;
		height: 100vh;
		z-index: 1;
	}

	.title-page {
		height: 100vh;
		width: 100%;
		position: relative;
		background-color: #000000;
	}

	.homepage-image {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
		pointer-events: none;
		overflow: hidden;
	}

	.homepage-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center;
		display: block;
		max-width: none;
	}

	/* Override global SVG styles */
	.homepage-image :global(svg) {
		width: 100%;
		height: 100%;
	}

	/* Quote overlay */
	.quote-overlay {
		position: absolute;
		top: 450px;
		right: 80px;
		max-width: 400px;
		z-index: 5;
	}

	.quote-text {
		font-family: "Courier New", Courier, monospace;
		font-size: 1.1rem;
		font-weight: 700;
		color: #fffaf0;
		line-height: 1.6;
		margin: 0;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
	}

	.scroll-hint {
		font-family: "Courier New", Courier, monospace;
		font-size: 0.85rem;
		font-weight: 700;
		color: rgba(255, 250, 240, 0.8);
		margin: 12px 0 0 0;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
		animation: blink 1.5s ease-in-out infinite;
	}

	@keyframes blink {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.3;
		}
	}

	/* Scroll steps */
	.scroll-steps {
		position: relative;
		z-index: 10;
		pointer-events: none;
	}

	.scroll-step {
		min-height: 100vh;
		display: flex;
		align-items: center;
		padding: 2rem;
		pointer-events: auto;
	}

	/* Info card - exact same styling */
	.info-card {
		background: #f5e6d3;
		padding: 30px;
		width: 420px;
		max-width: calc(100% - 160px);
		margin-left: 500px;
	}

	.card-line {
		height: 2px;
		background: #1a1a1a;
		margin-bottom: 20px;
	}

	.card-line.bottom {
		margin-top: 20px;
		margin-bottom: 15px;
	}

	.main-title {
		font-family: "gopher", Georgia, serif;
		font-size: 2.5rem;
		font-weight: 700;
		color: #1a1a1a;
		margin: 0 0 8px 0;
		line-height: 1.1;
	}

	.tagline {
		font-family: "Courier New", Courier, monospace;
		font-size: 0.85rem;
		color: #1a1a1a;
		margin: 0;
		line-height: 1.5;
	}

	.card-divider {
		font-family: "Courier New", Courier, monospace;
		font-size: 0.6rem;
		color: #1a1a1a;
		margin: 20px 0;
		letter-spacing: -0.05em;
		overflow: hidden;
		white-space: nowrap;
	}

	.stats-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 15px;
		margin-bottom: 15px;
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.stat-number {
		font-family: "Courier New", Courier, monospace;
		font-size: 1.3rem;
		font-weight: 700;
		color: #1a1a1a;
		line-height: 1.2;
	}

	.stat-label {
		font-family: "Courier New", Courier, monospace;
		font-size: 0.7rem;
		color: #1a1a1a;
		line-height: 1.4;
	}

	.stat-detail {
		font-family: "Courier New", Courier, monospace;
		font-size: 0.8rem;
		font-weight: 600;
		color: #1a1a1a;
		line-height: 1.3;
	}

	.stat-label-small {
		font-family: "Courier New", Courier, monospace;
		font-size: 0.65rem;
		color: #1a1a1a;
		line-height: 1.4;
	}

	.net-weight {
		font-family: "Courier New", Courier, monospace;
		font-size: 0.75rem;
		color: #1a1a1a;
		margin: 0;
	}

	/* Responsive */
	@media (max-width: 900px) {
		.info-card {
			margin-left: 40px;
			max-width: calc(100% - 80px);
			width: 380px;
		}

		.main-title {
			font-size: 2rem;
		}

		.quote-overlay {
			right: 40px;
			max-width: 300px;
		}

		.quote-text {
			font-size: 1rem;
		}
	}

	@media (max-width: 600px) {
		.info-card {
			margin-left: 20px;
			margin-right: 20px;
			max-width: none;
			width: auto;
			padding: 20px;
		}

		.main-title {
			font-size: 1.75rem;
		}

		.stats-row {
			grid-template-columns: 1fr;
			gap: 12px;
		}

		.stat-number {
			font-size: 1.1rem;
		}

		.quote-overlay {
			top: 20px;
			right: 20px;
			left: 20px;
			max-width: none;
		}

		.quote-text {
			font-size: 0.9rem;
		}

		.scroll-step {
			padding: 1rem;
		}
	}
</style>
