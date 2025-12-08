<script>
	import ChocolateShelf from "$components/ChocolateShelf.svelte";
	import chocolateData from "$data/chocolate-shelf-data.json";
	import ChocolateGuessGame from "$components/ChocolateGuessGame.svelte";
	import BeanToBarScrolly from "$components/BeanToBarScrolly.svelte";
	import CocoaProducers from "$components/CocoaProducers.svelte";
	import CocoaProductionWaffle from "$components/CocoaProductionWaffle.svelte";
	import ChocolateIncomeShareScrolly from "$components/ChocolateIncomeShareScrolly.svelte";
	import GhanaTreeImpactScrolly from "$components/GhanaTreeImpactScrolly.svelte";
	import CacaoBeansCalculator from "$components/CacaoBeansCalculator.svelte";
	import CompanyCommitmentTable from "$components/CompanyCommitmentTable.svelte";

	// Props for selected chocolate data
	let { selectedChocolate = null } = $props();

	// Hover state for shelf (tooltip is now built into ChocolateShelf)
	let hoveredBar = $state(null);

	function handleShelfHover(event) {
		hoveredBar = event.detail.bar;
	}

	// Get chocolate details (reactive)
	let brand = $derived(selectedChocolate?.name || "your chocolate bar");
	let conglomerate = $derived(selectedChocolate?.parent_pretty || "a major conglomerate");
	let price = $derived(selectedChocolate?.price || 1.99);

	const currency = new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		maximumFractionDigits: 2
	});
</script>

<section id="chocolate-story" class="chocolate-story-section">
	<!-- Section 1: Ownership -->
	<div class="story-section ownership-section">
		<div class="section-content">
			<div class="ownership-card-ms">
				<div class="card-line"></div>

				<h2 class="ownership-title">Who Owns Your Favorite Bar?</h2>
				<p class="ownership-copy">You picked <strong>{brand}</strong>. Behind that wrapper is one of the biggest players in chocolate: <strong>{conglomerate}</strong>. They own dozens of brands that seem unrelated, yet they're all part of the same global chocolate empire.</p>

				<div class="card-divider">- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -</div>

				{#if selectedChocolate}
					<div class="ownership-details-ms">
						<div class="selected-bar-visual-ms">
							<img
								src={selectedChocolate.bar}
								alt={selectedChocolate.name}
								loading="lazy"
								class="selected-bar-img-ms"
							/>
						</div>
						<p class="ownership-text-ms">
							<strong>{selectedChocolate.name}</strong> is owned by <strong>{selectedChocolate.parent_pretty}</strong>
						</p>
					</div>
				{/if}

				<div class="card-line bottom"></div>

				<p class="scroll-hint-ms">(scroll to explore)</p>
			</div>
		</div>
	</div>

	<!-- Section 2: Conglomerate Shelf -->
	<div class="story-section shelf-section">
		<div class="section-content">
			<div class="shelf-card-ms">
				<div class="card-line"></div>

				<h2 class="shelf-title">One Company, Many Wrappers</h2>
				<p class="shelf-copy">This shelf shows all the brands owned by <strong>{conglomerate}</strong> and other major conglomerates. Different shapes and flavors, but often the same handful of corporations behind them all.</p>

				<div class="card-divider">- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -</div>

				<p class="shelf-hint">→ <strong class="highlight">Swipe to explore</strong></p>

				<div class="card-line bottom"></div>
			</div>
			<div class="viz-container shelf-container">
				<ChocolateShelf
					data={chocolateData}
					rows={4}
					onhover={handleShelfHover}
					highlightName={selectedChocolate?.name}
					highlightParent={selectedChocolate?.parent}
				/>
			</div>
		</div>
	</div>

	<!-- Section 2.5: Chocolate Consumption Guessing Game -->
	<ChocolateGuessGame />

	<!-- Section 3: Bean to Bar (Scrollytelling) -->
	<BeanToBarScrolly />

	<!-- Section 3.5: Cacao Beans Calculator -->
	<CacaoBeansCalculator />

	<!-- Section 4: Cocoa Production Waffle Chart (Full Screen) -->
	<CocoaProductionWaffle />

	<!-- Section 5: Cocoa Producers -->
	<div class="story-section">
		<div class="section-content">
			<div class="text-block">
				<h2 class="section-title">Who Produces the World's Cocoa?</h2>
				<p class="section-copy">This visualization shows how cocoa production has shifted over time. Ghana and Côte d'Ivoire dominate the landscape and support millions of farming families.</p>
			</div>
			<div class="viz-container producers-container">
				<CocoaProducers />
			</div>
			<div class="scroll-cue">
				<span class="scroll-text">Tap bubbles to explore</span>
				<div class="scroll-arrow">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="12" r="8"/>
						<circle cx="12" cy="12" r="3"/>
					</svg>
				</div>
			</div>
		</div>
	</div>

	<!-- Section 5: Income Share (Scrollytelling) -->
	<div class="story-section income-scrolly-section">
		<div class="section-content">
			<div class="text-block">
				<h2 class="section-title">More Cocoa, More Land</h2>
				<p class="section-copy">Of your <strong>{currency.format(price)}</strong> {brand}, farmers receive only a tiny fraction. Scroll to see where your money really goes.</p>
			</div>
			<div class="viz-container income-container-scrolly">
				<ChocolateIncomeShareScrolly price={price} />
			</div>
		</div>
	</div>

	<!-- Section 6: Environmental Impact (Full-screen Scrollytelling) -->
	<GhanaTreeImpactScrolly />

	<!-- Section 7: Company Commitment Table -->
	<CompanyCommitmentTable {selectedChocolate} />

	<!-- Section 8: What Can We Do -->
	<div class="story-section what-can-we-do-section">
		<div class="what-can-we-do-content">
			<div class="what-can-we-do-left">
				<p class="what-can-we-do-eyebrow">As customers what can we do?</p>
				<h2 class="what-can-we-do-headline">Chocolate tastes sweet, but we can do our part to ensure the system behind it isn't so bitter.</h2>
			</div>
			<div class="what-can-we-do-right">
				<div class="action-item">
					<div class="action-icon">
						<svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5">
							<rect x="8" y="16" width="32" height="20" rx="2" />
							<line x1="8" y1="22" x2="40" y2="22" />
							<line x1="16" y1="16" x2="16" y2="36" stroke-dasharray="2 2" />
							<line x1="24" y1="16" x2="24" y2="36" stroke-dasharray="2 2" />
							<line x1="32" y1="16" x2="32" y2="36" stroke-dasharray="2 2" />
							<line x1="4" y1="12" x2="44" y2="40" stroke-width="2" />
						</svg>
					</div>
					<div class="action-text">
						<h3 class="action-title">Say NO to Chocolate Waste</h3>
						<p class="action-description">Treat chocolate as a precious product of months of farm labor and buy only what you'll truly eat.</p>
					</div>
				</div>
				<div class="action-item">
					<div class="action-icon">
						<svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5">
							<rect x="8" y="12" width="32" height="24" rx="2" />
							<line x1="8" y1="20" x2="40" y2="20" />
							<path d="M16 28h16M16 32h10" />
							<circle cx="36" cy="16" r="8" fill="none" />
							<path d="M33 16l2 2 4-4" />
						</svg>
					</div>
					<div class="action-text">
						<h3 class="action-title">Pay Attention to Cocoa Sources</h3>
						<p class="action-description">Check where your cocoa comes from and choose brands that are transparent and committed to fair pay for farmers.</p>
					</div>
				</div>
				<div class="action-item">
					<div class="action-icon">
						<svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5">
							<circle cx="24" cy="24" r="16" />
							<path d="M24 16v8l6 4" />
							<path d="M36 12l4-4M12 12l-4-4M36 36l4 4M12 36l-4 4" />
						</svg>
					</div>
					<div class="action-text">
						<h3 class="action-title">Share This Information</h3>
						<p class="action-description">Spread what you've learned so more people understand the true cost of chocolate and can make informed choices.</p>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Credits & References -->
	<div class="credits-section">
		<div class="credits-content">
			<div class="credits-left">
				<p class="credits-about"><strong>Bean to Bar</strong> was created by Nhaomi Lartey, Winifred Ofori-Manu, and Richael Saka for CS 1710 at Harvard University.</p>

				<div class="credits-divider">- - - - - - - - - - - - - - - - - - -</div>

				<h3 class="credits-heading">Data Sources</h3>
				<p class="credits-text">Datasets used in this project were collected from governmental and non-profit organizations dedicated to environment study, forests' monitoring, and cocoa industry research including FAOSTAT, Global Forest Watch, The Observatory of Economic Complexity, and the Chocolate Scorecard.</p>
			</div>
			<div class="credits-right">
				<h3 class="credits-heading">References</h3>
				<ul class="credits-list">
					<li>- <a href="https://www.fao.org/faostat/en/#data/QCL" target="_blank" rel="noopener noreferrer">FAOSTAT (Food and Agriculture Organization)</a></li>
					<li>- <a href="https://www.globalforestwatch.org/dashboards/country/GHA/" target="_blank" rel="noopener noreferrer">Global Forest Watch</a></li>
					<li>- <a href="https://oec.world/en/profile/bilateral-product/cocoa-beans/reporter/gha" target="_blank" rel="noopener noreferrer">The Observatory of Economic Complexity</a></li>
					<li>- <a href="https://www.chocolatescorecard.com/scorecards" target="_blank" rel="noopener noreferrer">Chocolate Scorecard</a></li>
					<li>- <a href="https://www.icco.org/" target="_blank" rel="noopener noreferrer">International Cocoa Organization (ICCO)</a></li>
					<li>- <a href="https://www.worldcocoafoundation.org/" target="_blank" rel="noopener noreferrer">World Cocoa Foundation</a></li>
					<li>- <a href="https://www.mightyearth.org/" target="_blank" rel="noopener noreferrer">Mighty Earth</a></li>
				</ul>
			</div>
		</div>
	</div>
</section>

<style>
	.chocolate-story-section {
		width: 100%;
		position: relative;
	}

	.story-section {
		width: 100%;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 4rem 2rem;
	}

	.section-content {
		max-width: 1400px;
		margin: 0 auto;
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.text-block {
		max-width: 800px;
		margin: 0 auto;
		text-align: center;
	}

	.section-title {
		font-family: 'Playfair Display', 'Times New Roman', serif;
		color: rgba(255, 248, 240, 0.96);
		font-size: clamp(1.8rem, 4vw, 2.5rem);
		margin: 0 0 1rem 0;
		line-height: 1.3;
	}

	.section-copy {
		color: rgba(255, 248, 240, 0.85);
		font-size: clamp(1rem, 2vw, 1.2rem);
		line-height: 1.7;
		margin: 0;
	}

	.section-copy :global(strong) {
		color: rgba(225, 176, 88, 1);
		font-weight: 600;
	}

	/* What Can We Do Section */
	.what-can-we-do-section {
		min-height: 100vh;
		padding: 6rem 2rem;
		background: #000000;
	}

	.what-can-we-do-content {
		max-width: 1400px;
		margin: 0 auto;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 4rem;
		align-items: start;
	}

	.what-can-we-do-left {
		position: sticky;
		top: 20vh;
	}

	.what-can-we-do-eyebrow {
		font-family: 'Courier New', courier-std, monospace;
		font-size: 0.85rem;
		color: rgba(255, 248, 240, 0.8);
		margin: 0 0 1.5rem 0;
		letter-spacing: 0.02em;
	}

	.what-can-we-do-headline {
		font-family: 'Playfair Display', 'Times New Roman', serif;
		font-size: clamp(2rem, 4vw, 3.5rem);
		font-weight: 700;
		color: #ffffff;
		line-height: 1.2;
		margin: 0;
	}

	.what-can-we-do-right {
		display: flex;
		flex-direction: column;
		gap: 3rem;
	}

	.action-item {
		display: flex;
		gap: 1.5rem;
		align-items: flex-start;
	}

	.action-icon {
		flex-shrink: 0;
		color: rgba(255, 248, 240, 0.9);
	}

	.action-icon svg {
		width: 48px;
		height: 48px;
	}

	.action-text {
		flex: 1;
	}

	.action-title {
		font-family: 'Playfair Display', 'Times New Roman', serif;
		font-size: 1.25rem;
		font-weight: 600;
		color: #ffffff;
		margin: 0 0 0.75rem 0;
		line-height: 1.3;
	}

	.action-description {
		font-family: 'Courier New', courier-std, monospace;
		font-size: 0.85rem;
		color: rgba(255, 248, 240, 0.75);
		line-height: 1.7;
		margin: 0;
	}

	@media (max-width: 900px) {
		.what-can-we-do-content {
			grid-template-columns: 1fr;
			gap: 3rem;
		}

		.what-can-we-do-left {
			position: relative;
			top: 0;
		}

		.what-can-we-do-headline {
			font-size: clamp(1.75rem, 5vw, 2.5rem);
		}
	}

	@media (max-width: 600px) {
		.what-can-we-do-section {
			padding: 4rem 1.5rem;
		}

		.action-item {
			flex-direction: column;
			gap: 1rem;
		}

		.action-icon svg {
			width: 40px;
			height: 40px;
		}
	}

	/* Credits Section */
	.credits-section {
		background: #f5e6d3;
		padding: 4rem 2rem;
		min-height: auto;
		border-radius: 8px;
		margin: 2rem;
	}

	.credits-content {
		max-width: 1200px;
		margin: 0 auto;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 4rem;
		align-items: start;
	}

	.credits-left {
		max-width: 450px;
	}

	.credits-about {
		font-family: 'Courier New', courier-std, monospace;
		font-size: 0.9rem;
		color: #000000;
		line-height: 1.7;
		margin: 0 0 2rem 0;
	}

	.credits-about strong {
		font-weight: 700;
	}

	.credits-divider {
		font-family: 'Courier New', courier-std, monospace;
		font-size: 0.8rem;
		color: #000000;
		margin: 0 0 2rem 0;
		letter-spacing: -0.05em;
	}

	.credits-heading {
		font-family: 'Courier New', courier-std, monospace;
		font-size: 1rem;
		font-weight: 600;
		color: #000000;
		margin: 0 0 1rem 0;
	}

	.credits-text {
		font-family: 'Courier New', courier-std, monospace;
		font-size: 0.85rem;
		color: #000000;
		line-height: 1.7;
		margin: 0;
	}

	.credits-right {
		max-width: 400px;
	}

	.credits-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.credits-list li {
		font-family: 'Courier New', courier-std, monospace;
		font-size: 0.85rem;
		color: #000000;
		line-height: 1.5;
	}

	.credits-list li a {
		color: #000000;
		text-decoration: none;
		transition: color 0.2s ease;
	}

	.credits-list li a:hover {
		text-decoration: underline;
	}

	@media (max-width: 900px) {
		.credits-content {
			grid-template-columns: 1fr;
			gap: 3rem;
		}

		.credits-left,
		.credits-right {
			max-width: 100%;
		}
	}

	@media (max-width: 600px) {
		.credits-section {
			margin: 1rem;
			padding: 2rem 1.5rem;
		}
	}

	.viz-container {
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.shelf-container {
		min-height: 500px;
		overflow: hidden;
	}

	.producers-container {
		min-height: 700px;
	}

	.income-container-scrolly {
		min-height: auto;
		width: 100%;
	}

	.income-scrolly-section {
		min-height: auto;
		padding-bottom: 0;
	}

	.income-scrolly-section .section-content {
		max-width: 1200px;
	}

	/* MS Project style ownership card */
	.ownership-section {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.ownership-card-ms {
		max-width: 520px;
		margin: 0 auto;
		padding: 25px 30px;
		background: #f5e6d3;
		text-align: left;
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

	.card-divider {
		font-family: "Courier New", Courier, monospace;
		font-size: 0.6rem;
		color: #1a1a1a;
		margin: 16px 0;
		letter-spacing: -0.05em;
		overflow: hidden;
		white-space: nowrap;
	}

	.ownership-title {
		font-family: "gopher", Georgia, serif;
		font-size: 1.5rem;
		font-weight: 700;
		color: #1a1a1a;
		margin: 0 0 12px 0;
		line-height: 1.2;
	}

	.ownership-copy {
		font-family: "Courier New", Courier, monospace;
		font-size: 0.9rem;
		font-weight: 500;
		line-height: 1.6;
		margin: 0;
		color: #1a1a1a;
	}

	.ownership-copy strong {
		font-weight: 700;
		color: tomato;
	}

	.ownership-details-ms {
		display: flex;
		gap: 1.5rem;
		align-items: center;
	}

	.selected-bar-visual-ms {
		flex: 0 0 auto;
		width: 100px;
	}

	.selected-bar-img-ms {
		display: block;
		width: 100%;
		height: auto;
		object-fit: contain;
	}

	.ownership-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.company-logo-ms {
		display: inline-flex;
		align-self: flex-start;
	}

	.company-logo-ms img {
		display: block;
		height: 36px;
		width: auto;
		object-fit: contain;
	}

	.ownership-text-ms {
		font-family: "Courier New", Courier, monospace;
		font-size: 0.85rem;
		font-weight: 500;
		line-height: 1.5;
		margin: 0;
		color: #1a1a1a;
	}

	.ownership-text-ms strong {
		font-weight: 700;
	}

	.scroll-hint-ms {
		font-family: "Courier New", Courier, monospace;
		font-size: 0.85rem;
		font-weight: 700;
		color: #1a1a1a;
		margin: 0;
		text-align: center;
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

	@media (max-width: 600px) {
		.ownership-card-ms {
			padding: 20px;
		}

		.ownership-details-ms {
			flex-direction: column;
			text-align: center;
		}

		.company-logo-ms {
			align-self: center;
		}
	}

	/* MS Project style shelf card */
	.shelf-card-ms {
		max-width: 520px;
		margin: 0 auto 2rem auto;
		padding: 25px 30px;
		background: #f5e6d3;
		text-align: left;
	}

	.shelf-title {
		font-family: "gopher", Georgia, serif;
		font-size: 1.5rem;
		font-weight: 700;
		color: #1a1a1a;
		margin: 0 0 12px 0;
		line-height: 1.2;
	}

	.shelf-copy {
		font-family: "Courier New", Courier, monospace;
		font-size: 0.9rem;
		font-weight: 500;
		line-height: 1.6;
		margin: 0;
		color: #1a1a1a;
	}

	.shelf-copy strong {
		font-weight: 700;
		color: tomato;
	}

	.shelf-hint {
		font-family: "Courier New", Courier, monospace;
		font-size: 0.85rem;
		font-weight: 500;
		color: #1a1a1a;
		margin: 0;
	}

	.shelf-hint .highlight {
		color: tomato;
	}

	@media (max-width: 600px) {
		.shelf-card-ms {
			padding: 20px;
		}
	}

	/* Scroll cues */
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

	.scroll-arrow.horizontal {
		animation: swipe 2s infinite;
	}

	.scroll-cue.cue-above {
		margin-top: 0;
		margin-bottom: 1rem;
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

	@keyframes swipe {
		0%, 20%, 50%, 80%, 100% {
			transform: translateX(0);
		}
		40% {
			transform: translateX(8px);
		}
		60% {
			transform: translateX(4px);
		}
	}

	@media (max-width: 768px) {
		.story-section {
			padding: 3rem 1rem;
		}

		.ownership-card {
			flex-direction: column;
			text-align: center;
		}

		.company-logo-pill {
			align-self: center;
		}

		.shelf-container {
			min-height: 400px;
		}

		.producers-container {
			min-height: 500px;
		}
	}
</style>
