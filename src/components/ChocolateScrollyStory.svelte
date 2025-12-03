<script>
	import ChocolateShelf from "$components/ChocolateShelf.svelte";
	import chocolateData from "$data/chocolate-shelf-data.json";
	import CocoaStepsSwiper from "$components/CocoaStepsSwiper.svelte";
	import CocoaProducers from "$components/CocoaProducers.svelte";
	import ChocolateIncomeShare from "$components/ChocolateIncomeShare.svelte";
	import GhanaTreeImpact from "$components/GhanaTreeImpact.svelte";

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
	<div class="story-section">
		<div class="section-content">
			<div class="text-block">
				<h2 class="section-title">Who Owns Your Favorite Bar?</h2>
				<p class="section-copy">You picked <strong>{brand}</strong>. Behind that wrapper is one of the biggest players in chocolate: <strong>{conglomerate}</strong>. They own dozens of brands that seem unrelated, yet they're all part of the same global chocolate empire.</p>
			</div>
			{#if selectedChocolate}
				<div class="ownership-card">
					<div class="selected-bar-visual">
						<img
							src={selectedChocolate.bar}
							alt={selectedChocolate.name}
							loading="lazy"
							class="selected-bar-img"
						/>
					</div>
					<div class="ownership-details">
						<div class="company-logo-pill">
							<img
								src={selectedChocolate.logo}
								alt={`${selectedChocolate.parent_pretty} logo`}
								loading="lazy"
							/>
						</div>
						<p class="ownership-text">
							<strong>{selectedChocolate.name}</strong> is owned by
							<strong>{selectedChocolate.parent_pretty}</strong>
						</p>
					</div>
				</div>
			{/if}
			<div class="scroll-cue">
				<span class="scroll-text">Scroll to explore</span>
				<div class="scroll-arrow">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M12 5v14M5 12l7 7 7-7"/>
					</svg>
				</div>
			</div>
		</div>
	</div>

	<div class="section-divider-wrap"><hr class="section-divider" /></div>

	<!-- Section 2: Conglomerate Shelf -->
	<div class="story-section">
		<div class="section-content">
			<div class="text-block">
				<h2 class="section-title">One Company, Many Wrappers</h2>
				<p class="section-copy">This shelf shows all the brands owned by {conglomerate} and other major conglomerates. Different shapes and flavors, but often the same handful of corporations behind them all.</p>
			</div>
			<div class="scroll-cue cue-above">
				<span class="scroll-text">Swipe to explore</span>
				<div class="scroll-arrow horizontal">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M5 12h14M12 5l7 7-7 7"/>
					</svg>
				</div>
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

	<div class="section-divider-wrap"><hr class="section-divider" /></div>

	<!-- Section 3: Bean to Bar -->
	<div class="story-section">
		<div class="section-content">
			<div class="text-block">
				<h2 class="section-title">From Bean to Bar</h2>
				<p class="section-copy">Before brands and ads, chocolate begins as cocoa pods grown in tropical countries. Let's follow the journey from bean to bar, and see how chocolate is really farmed and made.</p>
			</div>
			<div class="viz-container swiper-container">
				<CocoaStepsSwiper />
			</div>
		</div>
	</div>

	<div class="section-divider-wrap"><hr class="section-divider" /></div>

	<!-- Section 4: Cocoa Producers -->
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

	<div class="section-divider-wrap"><hr class="section-divider" /></div>

	<!-- Section 5: Income Share -->
	<div class="story-section">
		<div class="section-content">
			<div class="text-block">
				<h2 class="section-title">More Cocoa, More Land</h2>
				<p class="section-copy">Of your <strong>{currency.format(price)}</strong> {brand}, farmers receive only a tiny fraction. When farmers earn so little, they often need to grow more cocoa to make ends meet. The fastest way is clearing more land, which puts forests at risk.</p>
			</div>
			<div class="viz-container income-container">
				<ChocolateIncomeShare price={price} />
			</div>
			<div class="scroll-cue">
				<span class="scroll-text">Hover to see breakdown</span>
				<div class="scroll-arrow">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M12 19V5M5 12l7-7 7 7"/>
					</svg>
				</div>
			</div>
		</div>
	</div>

	<div class="section-divider-wrap"><hr class="section-divider" /></div>

	<!-- Section 6: Environmental Impact -->
	<div class="story-section">
		<div class="section-content">
			<div class="text-block">
				<h2 class="section-title">The Hidden Cost of Your Chocolate Bar</h2>
				<p class="section-copy">This visualization shows tree-cover loss in Ghana. As global demand for chocolate rises, forests shrink, impacting biodiversity, local communities, and the climate.</p>
			</div>
			<div class="viz-container environment-container">
				<GhanaTreeImpact />
			</div>
		</div>
	</div>

	<div class="section-divider-wrap"><hr class="section-divider" /></div>

	<!-- Section 7: Conclusion -->
	<div class="story-section">
		<div class="section-content">
			<div class="text-block">
				<h2 class="section-title">A Bar Full of Inequality</h2>
				<p class="section-copy">Most profits go to manufacturers and retailers, far from the farms where cocoa starts. This imbalance shapes farmer incomes and pressures them to grow more cocoa just to survive. A single chocolate bar links to corporations, farmers, global trade, and forests. Understanding this journey helps us appreciate the people and ecosystems behind the sweets we enjoy.</p>
			</div>
			<div class="fair-trade-image">
				<img src="/assets/fair_trade.jpg" alt="Fair trade cocoa farming" loading="lazy" />
			</div>
		</div>
	</div>

	<!-- About Us -->
	<div class="story-section about-section">
		<div class="section-content">
			<div class="text-block">
				<h2 class="section-title">About Us</h2>
			</div>
			<div class="bio-cards">
				<div class="bio-card">
					<div class="bio-image">
						<img src="/assets/Bios/Nhaomi.png" alt="Nhaomi" loading="lazy" />
					</div>
					<div class="bio-info">
						<h3 class="bio-name">Nhaomi</h3>
						<p class="bio-fav"><strong>Favorite chocolate:</strong> Cadbury</p>
						<p class="bio-why">I love chocolate. In knowing how important yet exploitative the industry is in my homeland Ghana, it's vital to make a change. The fact that cacao farmers in Accra can't even enjoy the fruits of their own labor speaks volumes, but I wish for a future where everyone can enjoy chocolate peacefully and sustainably!</p>
					</div>
				</div>
				<div class="bio-card">
					<div class="bio-image">
						<img src="/assets/Bios/Richael.png" alt="Richael" loading="lazy" />
					</div>
					<div class="bio-info">
						<h3 class="bio-name">Richael</h3>
						<p class="bio-fav"><strong>Favorite chocolate:</strong> Kinder Eggs</p>
						<p class="bio-why">Chocolate is a huge part of my Ghanaian heritage, and the people who grow its raw ingredients deserve far more than they receive. The farmers who put in the hardest work should be treated fairly, paid fairly, and seen as central to the story of every chocolate bar we enjoy.</p>
					</div>
				</div>
				<div class="bio-card">
					<div class="bio-image">
						<img src="/assets/Bios/Winifred.png" alt="Wini" loading="lazy" />
					</div>
					<div class="bio-info">
						<h3 class="bio-name">Wini</h3>
						<p class="bio-fav"><strong>Favorite chocolate:</strong> Twix</p>
						<p class="bio-why">This matters because the impact the African continent has on the chocolate industry needs to be acknowledged and celebrated, especially since many people don't know about it.</p>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Works Cited -->
	<div class="story-section works-cited-section">
		<div class="section-content">
			<div class="text-block works-cited">
				<h2 class="section-title">Works Cited</h2>
				<ul class="citations">
					<li>
						<a href="https://www.fao.org/faostat/en/#data/QCL" target="_blank" rel="noopener noreferrer">FAOSTAT</a> - Food and Agriculture Organization of the United Nations. Crops and livestock products (QCL) dataset.
					</li>
					<li>
						<a href="https://www.globalforestwatch.org/dashboards/country/GHA/" target="_blank" rel="noopener noreferrer">Global Forest Watch</a> - Ghana country dashboard for forest monitoring data.
					</li>
					<li>
						<a href="https://oec.world/en/profile/bilateral-product/cocoa-beans/reporter/gha" target="_blank" rel="noopener noreferrer">The Observatory of Economic Complexity (OEC)</a> - Bilateral product profile for cocoa beans exported from Ghana.
					</li>
					<li>
						<a href="https://www.chocolatescorecard.com/scorecards" target="_blank" rel="noopener noreferrer">Chocolate Scorecard</a> - 6th Edition company scorecards on ethical practices.
					</li>
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

	/* Section dividers */
	.section-divider-wrap {
		display: flex;
		justify-content: center;
		padding: 0 2rem;
	}

	.section-divider {
		width: 100%;
		max-width: 200px;
		height: 2px;
		background: linear-gradient(90deg, transparent, rgba(225, 176, 88, 0.5), transparent);
		border: none;
		margin: 0;
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

	/* Fair Trade Image */
	.fair-trade-image {
		display: flex;
		justify-content: center;
		margin-top: 2rem;
	}

	.fair-trade-image img {
		max-width: 100%;
		max-height: 500px;
		width: auto;
		border-radius: 8px;
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
	}

	/* About Us / Bio Cards */
	.about-section {
		min-height: auto;
		padding-top: 4rem;
		padding-bottom: 4rem;
	}

	.bio-cards {
		display: flex;
		flex-wrap: wrap;
		gap: 2rem;
		justify-content: center;
		max-width: 1200px;
		margin: 0 auto;
	}

	.bio-card {
		background: rgba(10, 6, 4, 0.96);
		border-radius: 8px;
		border: 1px solid rgba(255, 224, 189, 0.35);
		box-shadow: 0 12px 40px rgba(5, 2, 1, 0.7);
		padding: 1.5rem;
		width: 320px;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}

	.bio-image {
		width: 120px;
		height: 120px;
		border-radius: 50%;
		overflow: hidden;
		border: 3px solid rgba(225, 176, 88, 0.6);
		margin-bottom: 1rem;
	}

	.bio-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.bio-info {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.bio-name {
		font-family: 'Playfair Display', 'Times New Roman', serif;
		color: rgba(255, 248, 240, 0.96);
		font-size: 1.4rem;
		margin: 0;
		font-weight: 600;
	}

	.bio-fav {
		color: rgba(255, 248, 240, 0.85);
		font-size: 0.95rem;
		margin: 0;
	}

	.bio-fav strong {
		color: rgba(225, 176, 88, 1);
	}

	.bio-why {
		color: rgba(255, 248, 240, 0.75);
		font-size: 0.9rem;
		line-height: 1.6;
		margin: 0.5rem 0 0 0;
	}

	@media (max-width: 768px) {
		.bio-cards {
			flex-direction: column;
			align-items: center;
		}

		.bio-card {
			width: 100%;
			max-width: 360px;
		}
	}

	/* Works Cited */
	.works-cited-section {
		min-height: auto;
		padding-bottom: 6rem;
	}

	.works-cited {
		text-align: left;
		max-width: 700px;
	}

	.works-cited .section-title {
		text-align: center;
		margin-bottom: 2rem;
	}

	.citations {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.citations li {
		color: rgba(255, 248, 240, 0.75);
		font-size: 0.95rem;
		line-height: 1.6;
		padding-left: 1rem;
		border-left: 2px solid rgba(225, 176, 88, 0.4);
	}

	.citations li a {
		color: rgba(225, 176, 88, 1);
		text-decoration: none;
		font-weight: 600;
		transition: color 0.2s ease;
	}

	.citations li a:hover {
		text-decoration: underline;
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

	.swiper-container {
		min-height: 600px;
	}

	.producers-container {
		min-height: 700px;
	}

	.income-container {
		min-height: 500px;
	}

	.environment-container {
		min-height: 800px;
	}

	/* Ownership card styling */
	.ownership-card {
		background: rgba(10, 6, 4, 0.96);
		border-radius: 8px;
		border: 1px solid rgba(255, 224, 189, 0.35);
		padding: 2rem;
		box-shadow: 0 20px 50px rgba(5, 2, 1, 0.7);
		max-width: 600px;
		margin: 0 auto;
		display: flex;
		gap: 2rem;
		align-items: center;
	}

	.selected-bar-visual {
		flex: 0 0 auto;
		width: clamp(120px, 20vw, 180px);
	}

	.selected-bar-img {
		display: block;
		width: 100%;
		height: auto;
		object-fit: contain;
		filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.5));
	}

	.ownership-details {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.company-logo-pill {
		padding: 0.5rem 0.75rem;
		border-radius: 999px;
		background: rgba(23, 14, 9, 0.96);
		border: 1px solid rgba(255, 224, 189, 0.55);
		box-shadow: 0 12px 30px rgba(5, 2, 1, 0.7);
		display: inline-flex;
		align-self: flex-start;
	}

	.company-logo-pill img {
		display: block;
		height: 32px;
		width: auto;
		object-fit: contain;
	}

	.ownership-text {
		margin: 0;
		font-size: 1.1rem;
		line-height: 1.6;
		color: rgba(255, 245, 234, 0.9);
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

		.swiper-container {
			min-height: 500px;
		}

		.producers-container {
			min-height: 500px;
		}

		.environment-container {
			min-height: 600px;
		}

		.interaction-cue {
			font-size: 0.8rem;
			padding: 0.4rem 0.8rem;
		}
	}
</style>
