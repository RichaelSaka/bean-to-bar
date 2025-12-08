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

	<!-- Section 2: Conglomerate Shelf Intro -->
	<div class="story-section intro-card-section">
		<div class="intro-card-ms">
			<div class="card-line"></div>

			<h2 class="intro-card-title">One Company, Many Wrappers</h2>
			<p class="intro-card-copy">This shelf shows all the brands owned by <strong>{conglomerate}</strong> and other major conglomerates. Different shapes and flavors, but often the same handful of corporations behind them all.</p>

			<div class="card-divider">- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -</div>

			<p class="intro-card-hint"><strong class="highlight">Horizontal swipe to see more shelves</strong></p>

			<div class="card-line bottom"></div>

			<p class="scroll-hint-ms">(scroll to continue)</p>
		</div>
	</div>

	<!-- Section 2b: Conglomerate Shelf Visualization -->
	<div class="story-section shelf-section">
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

	<!-- Transition: From Ownership to Consumption -->
	<div class="story-section intro-card-section">
		<div class="intro-card-ms">
			<div class="card-line"></div>

			<h2 class="intro-card-title">A Global Appetite</h2>
			<p class="intro-card-copy">These corporations dominate because the world <strong>loves</strong> chocolate. But how much do we actually consume? Let's find out.</p>

			<div class="card-divider">- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -</div>

			<p class="intro-card-hint"><strong class="highlight">Test your knowledge</strong></p>

			<div class="card-line bottom"></div>

			<p class="scroll-hint-ms">(scroll to continue)</p>
		</div>
	</div>

	<!-- Section 2.5: Chocolate Consumption Guessing Game -->
	<ChocolateGuessGame />

	<!-- Transition: From Consumption to Production Process -->
	<div class="story-section intro-card-section">
		<div class="intro-card-ms">
			<div class="card-line"></div>

			<h2 class="intro-card-title">From Bean to Bar</h2>
			<p class="intro-card-copy">That's a lot of chocolate. But have you ever wondered how it's made? The journey from <strong>cocoa pod</strong> to <strong>chocolate bar</strong> involves nine careful steps—most of them done by hand.</p>

			<div class="card-divider">- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -</div>

			<p class="intro-card-hint"><strong class="highlight">Explore each step</strong></p>

			<div class="card-line bottom"></div>

			<p class="scroll-hint-ms">(scroll to continue)</p>
		</div>
	</div>

	<!-- Section 3: Bean to Bar (Scrollytelling) -->
	<BeanToBarScrolly />

	<!-- Transition: From Process to Scale -->
	<div class="story-section intro-card-section">
		<div class="intro-card-ms">
			<div class="card-line"></div>

			<h2 class="intro-card-title">The Scale of Production</h2>
			<p class="intro-card-copy">Each step requires countless cocoa beans. To meet global demand, farmers harvest <strong>millions of tons</strong> of cocoa every year. Let's explore the numbers.</p>

			<div class="card-divider">- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -</div>

			<p class="intro-card-hint"><strong class="highlight">click on the buttons below to see</strong></p>

			<div class="card-line bottom"></div>

			<p class="scroll-hint-ms">(scroll to continue)</p>
		</div>
	</div>

	<!-- Section 3.5: Cacao Beans Calculator -->
	<CacaoBeansCalculator />

	<!-- Transition: Global Production Overview -->
	<div class="story-section intro-card-section">
		<div class="intro-card-ms">
			<div class="card-line"></div>

			<h2 class="intro-card-title">Global Cocoa Production</h2>
			<p class="intro-card-copy">In 2023, the world produced over <strong>5.5 million tons</strong> of cocoa beans. Each square in the next visualization represents <strong>1,000 tons</strong>—hover over countries to see their contribution.</p>

			<div class="card-divider">- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -</div>

			<p class="intro-card-hint"><strong class="highlight">Hover to explore</strong></p>

			<div class="card-line bottom"></div>

			<p class="scroll-hint-ms">(scroll to continue)</p>
		</div>
	</div>

	<!-- Section 4: Cocoa Production Waffle Chart (Full Screen) -->
	<CocoaProductionWaffle />

	<!-- Section 5: Cocoa Producers Intro -->
	<div class="story-section intro-card-section">
		<div class="intro-card-ms">
			<div class="card-line"></div>

			<h2 class="intro-card-title">Who Produces the World's Cocoa?</h2>
			<p class="intro-card-copy">This visualization shows how cocoa production has shifted over time. <strong>Ghana</strong> and <strong>Côte d'Ivoire</strong> dominate the landscape and support millions of farming families.</p>

			<div class="card-divider">- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -</div>

			<p class="intro-card-hint"><strong class="highlight">Tap bubbles to explore</strong></p>

			<div class="card-line bottom"></div>

			<p class="scroll-hint-ms">(scroll to continue)</p>
		</div>
	</div>

	<!-- Section 5b: Cocoa Producers Visualization -->
	<div class="story-section producers-section">
		<div class="producers-viz-full">
			<CocoaProducers />
		</div>
	</div>

	<!-- Section 6: Income Share Intro -->
	<div class="story-section intro-card-section">
		<div class="intro-card-ms">
			<div class="card-line"></div>

			<h2 class="intro-card-title">Where Does Your Money Go?</h2>
			<p class="intro-card-copy">Of your <strong>{currency.format(price)}</strong> {brand}, farmers receive only a tiny fraction. Scroll to see where your money really goes.</p>

			<div class="card-divider">- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -</div>

			<p class="intro-card-hint"><strong class="highlight">scroll to explore</strong></p>

			<div class="card-line bottom"></div>

			<p class="scroll-hint-ms">(scroll to continue)</p>
		</div>
	</div>

	<!-- Section 6b: Income Share Visualization -->
	<div class="story-section income-scrolly-section">
		<div class="income-viz-container">
			<ChocolateIncomeShareScrolly price={price} chocolateName={brand} />
		</div>
	</div>

	<!-- Transition: Environmental Impact -->
	<div class="story-section intro-card-section">
		<div class="intro-card-ms">
			<div class="card-line"></div>

			<h2 class="intro-card-title">The Cost of Cocoa</h2>
			<p class="intro-card-copy">When farmers earn so little, they're forced to expand into forests to grow more cocoa. <strong>Ghana</strong> has lost significant tree cover as cocoa demand has grown. The environmental cost is staggering.</p>

			<div class="card-divider">- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -</div>

			<p class="intro-card-hint"><strong class="highlight">Scroll to see the impact</strong></p>

			<div class="card-line bottom"></div>

			<p class="scroll-hint-ms">(scroll to continue)</p>
		</div>
	</div>

	<!-- Section 7: Environmental Impact (Full-screen Scrollytelling) -->
	<GhanaTreeImpactScrolly />

	<!-- Transition: Company Commitment -->
	<div class="story-section intro-card-section">
		<div class="intro-card-ms">
			<div class="card-line"></div>

			<h2 class="intro-card-title">Who's Doing Better?</h2>
			<p class="intro-card-copy">Some companies are taking steps toward <strong>ethical sourcing</strong> and <strong>fair pay</strong>. Others lag behind. See how the major chocolate brands stack up on key sustainability measures.</p>

			<div class="card-divider">- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -</div>

			<p class="intro-card-hint"><strong class="highlight">Click headers to sort</strong></p>

			<div class="card-line bottom"></div>

			<p class="scroll-hint-ms">(scroll to continue)</p>
		</div>
	</div>

	<!-- Section 8: Company Commitment Table -->
	<CompanyCommitmentTable {selectedChocolate} />

	<!-- Section 8: What Can We Do - Intro -->
	<div class="story-section intro-card-section">
		<div class="intro-card-ms">
			<div class="card-line"></div>

			<p class="intro-card-eyebrow">As customers what can we do?</p>
			<h2 class="intro-card-title">Chocolate tastes sweet, but we can do our part to ensure the system behind it isn't so bitter.</h2>

			<div class="card-divider">- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -</div>

			<p class="intro-card-hint"><strong class="highlight">Here are three things you can do</strong></p>

			<div class="card-line bottom"></div>

			<p class="scroll-hint-ms">(scroll to continue)</p>
		</div>
	</div>

	<!-- Action 1: Say NO to Chocolate Waste -->
	<div class="story-section intro-card-section">
		<div class="intro-card-ms">
			<div class="card-line"></div>

			<p class="intro-card-step">01</p>
			<h2 class="intro-card-title">Say NO to Chocolate Waste</h2>
			<p class="intro-card-copy">Treat chocolate as a precious product of months of farm labor and buy only what you'll truly eat.</p>

			<div class="card-line bottom"></div>

			<p class="scroll-hint-ms">(scroll to continue)</p>
		</div>
	</div>

	<!-- Action 2: Pay Attention to Cocoa Sources -->
	<div class="story-section intro-card-section">
		<div class="intro-card-ms">
			<div class="card-line"></div>

			<p class="intro-card-step">02</p>
			<h2 class="intro-card-title">Pay Attention to Cocoa Sources</h2>
			<p class="intro-card-copy">Check where your cocoa comes from and choose brands that are transparent and committed to fair pay for farmers.</p>

			<div class="card-line bottom"></div>

			<p class="scroll-hint-ms">(scroll to continue)</p>
		</div>
	</div>

	<!-- Action 3: Share This Information -->
	<div class="story-section intro-card-section">
		<div class="intro-card-ms">
			<div class="card-line"></div>

			<p class="intro-card-step">03</p>
			<h2 class="intro-card-title">Share This Information</h2>
			<p class="intro-card-copy">Spread what you've learned so more people understand the true cost of chocolate and can make informed choices.</p>

			<div class="card-line bottom"></div>

			<p class="scroll-hint-ms">(end of story)</p>
		</div>
	</div>

	<!-- Credits & References -->
	<div class="credits-section">
		<div class="credits-content">
			<div class="credits-left">
				<p class="credits-about"><strong>Bean to Bar</strong> was created by Nhaomi Lartey, Winifred Ofori-Manu, and Richael Saka for CS 1710 at Harvard University.</p>

				<h3 class="credits-heading">Acknowledgements</h3>
				<p class="credits-text">Special thanks to <strong>Professor Waldo</strong>, our wonderful teaching staff, and our TF <strong>Richard</strong> for their guidance and support throughout this project.</p>

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
		font-weight: 700;
		color: rgba(255, 248, 240, 0.8);
		margin: 0 0 1.5rem 0;
		letter-spacing: 0.02em;
	}

	.what-can-we-do-headline {
		font-family: "gopher", Georgia, serif;
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
		font-family: "gopher", Georgia, serif;
		font-size: 1.25rem;
		font-weight: 600;
		color: #ffffff;
		margin: 0 0 0.75rem 0;
		line-height: 1.3;
	}

	.action-description {
		font-family: 'Courier New', courier-std, monospace;
		font-size: 0.85rem;
		font-weight: 700;
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

	/* Income scrolly section - visualization only */
	.income-scrolly-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 2rem;
		min-height: auto;
	}

	.income-viz-container {
		width: 100%;
		max-width: 1200px;
	}

	@media (max-width: 600px) {
		.income-scrolly-section {
			padding: 1rem;
		}
	}

	/* Generic intro card section - full page cards before visualizations */
	.intro-card-section {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 4rem 2rem;
	}

	.intro-card-ms {
		max-width: 520px;
		margin: 0 auto;
		padding: 25px 30px;
		background: #f5e6d3;
		text-align: left;
	}

	.intro-card-title {
		font-family: "gopher", Georgia, serif;
		font-size: 1.5rem;
		font-weight: 700;
		color: #1a1a1a;
		margin: 0 0 12px 0;
		line-height: 1.2;
	}

	.intro-card-copy {
		font-family: "Courier New", Courier, monospace;
		font-size: 0.9rem;
		font-weight: 500;
		line-height: 1.6;
		margin: 0;
		color: #1a1a1a;
	}

	.intro-card-copy strong {
		font-weight: 700;
		color: tomato;
	}

	.intro-card-hint {
		font-family: "Courier New", Courier, monospace;
		font-size: 0.85rem;
		font-weight: 500;
		color: #1a1a1a;
		margin: 0;
	}

	.intro-card-hint .highlight {
		color: tomato;
	}

	.intro-card-eyebrow {
		font-family: "Courier New", Courier, monospace;
		font-size: 0.85rem;
		font-weight: 700;
		color: #1a1a1a;
		margin: 0 0 1rem 0;
		letter-spacing: 0.02em;
	}

	.intro-card-step {
		font-family: "Courier New", Courier, monospace;
		font-size: 0.75rem;
		font-weight: 700;
		color: tomato;
		margin: 0 0 0.5rem 0;
		letter-spacing: 0.05em;
	}

	@media (max-width: 600px) {
		.intro-card-section {
			padding: 2rem 1rem;
		}

		.intro-card-ms {
			padding: 20px;
		}

		.intro-card-title {
			font-size: 1.25rem;
		}
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

	/* Shelf section - visualization only */
	.shelf-section {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* Producers section - visualization only */
	.producers-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 2rem;
	}

	.producers-viz-full {
		width: 100%;
		min-height: 700px;
	}

	@media (max-width: 600px) {
		.producers-section {
			padding: 1rem;
		}

		.producers-viz-full {
			min-height: 500px;
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
	}
</style>
