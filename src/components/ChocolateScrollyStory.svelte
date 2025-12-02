<script>
	import Scrolly from "$components/helpers/Scrolly.svelte";
	import ConglomeratePacking from "$components/ConglomeratePacking.svelte";
	import CocoaProductionRace from "$components/CocoaProductionRace.svelte";
	import ChocolateIncomeShare from "$components/ChocolateIncomeShare.svelte";
	import GhanaTreeImpact from "$components/GhanaTreeImpact.svelte";

	// Props for selected chocolate data
	let { selectedChocolate = null } = $props();

	let scrollIndex = $state(undefined);
	let scrollyContainer;

	// Get chocolate details
	const brand = selectedChocolate?.name || "your chocolate bar";
	const conglomerate = selectedChocolate?.parent_pretty || "a major conglomerate";
	const price = selectedChocolate?.price || 1.99;

	const currency = new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		maximumFractionDigits: 2
	});

	// 10 scroll steps (starting after chocolate selection)
	const steps = [
		{
			text: `Who Owns Your Favorite Bar?`,
			copy: `You picked <strong>${brand}</strong>. Behind that wrapper is one of the biggest players in chocolate: <strong>${conglomerate}</strong>. They own dozens of brands that seem unrelatedyet they're all part of the same global chocolate empire.`,
			showViz: "ownership"
		},
		{
			text: `One Company, Many Wrappers`,
			copy: `This clustered bubble chart shows all the brands owned by ${conglomerate}. Different shapes and flavors, but often the same corporation behind them. Understanding this helps us see how just a handful of companies influence pricing, sourcing, and the global chocolate supply chain.`,
			showViz: "conglomerates"
		},
		{
			text: `But Chocolate Starts Far From the Store Shelf`,
			copy: `Before brands and ads, chocolate begins as cocoa pods grown in tropical countries. Two countriesGhana and C�te d'Ivoireproduce more than 60% of the world's cocoa. The story changes a lot when we zoom in there.`,
			showViz: "conglomerates"
		},
		{
			text: `Who Produces the World's Cocoa?`,
			copy: `This animated bar-race chart shows how cocoa production has shifted over time. Ghana and C�te d'Ivoire dominate the landscape and support millions of farming families.`,
			showViz: "production"
		},
		{
			text: `From Cocoa Pods& to a Chocolate Bar`,
			copy: `Now that we know where cocoa comes from, let's look at how the profits are divided. Farmersthe people who grow and harvest cocoadon't always get a fair share.`,
			showViz: "production"
		},
		{
			text: `Who Gets What From Your ${currency.format(price)} Chocolate Bar?`,
			copy: `Every time you buy ${brand} for ${currency.format(price)}, the money doesn't flow evenly. Farmers often take home the smallest share of the final price. This visualization breaks down who earns what from your chocolate bar.`,
			showViz: "income"
		},
		{
			text: `A Bar Full of Inequality`,
			copy: `Most profits go to manufacturers and retailersfar from the farms where cocoa starts. This imbalance shapes farmer incomes and pressures them to grow more cocoa just to survive.`,
			showViz: "income"
		},
		{
			text: `More Cocoa, More Land`,
			copy: `When farmers earn little, they often need to grow more cocoa to make ends meet. The fastest way is clearing more landwhich puts forests at risk.`,
			showViz: "income"
		},
		{
			text: `The Hidden Cost of Your Chocolate Bar`,
			copy: `This visualization shows tree-cover loss in Ghana. As global demand for chocolate rises, forests shrinkimpacting biodiversity, local communities, and the climate.`,
			showViz: "environment"
		},
		{
			text: `What Your Chocolate Choice Connects To`,
			copy: `A single chocolate bar links to corporations, farmers, global trade, and forests. Understanding this journey helps us appreciate the people and ecosystems behind the sweets we enjoy.`,
			showViz: "environment"
		}
	];

	// Determine which visualization to show based on scroll position
	let currentViz = $derived(scrollIndex !== undefined && steps[scrollIndex] ? steps[scrollIndex].showViz : "ownership");
</script>

<section id="chocolate-story" class="chocolate-story-section">
	<div class="sticky-container">
		<!-- Ownership card (shown initially) -->
		<div class="viz-layer ownership-layer" class:active={currentViz === "ownership"}>
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
		</div>

		<!-- Conglomerate bubbles -->
		<div class="viz-layer" class:active={currentViz === "conglomerates"}>
			<div class="viz-wrapper">
				<ConglomeratePacking />
			</div>
		</div>

		<!-- Cocoa production race -->
		<div class="viz-layer" class:active={currentViz === "production"}>
			<CocoaProductionRace />
		</div>

		<!-- Income share treemap -->
		<div class="viz-layer" class:active={currentViz === "income"}>
			<div class="viz-wrapper centered">
				<ChocolateIncomeShare price={price} />
			</div>
		</div>

		<!-- Ghana tree loss -->
		<div class="viz-layer" class:active={currentViz === "environment"}>
			<GhanaTreeImpact />
		</div>
	</div>

	<Scrolly bind:value={scrollIndex} bind:container={scrollyContainer}>
		{#each steps as step, i}
			<div class="step">
				<div class="step-inner">
					<h3 class="step-title">{step.text}</h3>
					<p class="step-copy">{@html step.copy}</p>
				</div>
			</div>
		{/each}
	</Scrolly>
</section>

<style>
	.chocolate-story-section {
		width: 100%;
		position: relative;
		min-height: 100vh;
	}

	.sticky-container {
		width: 100%;
		height: 100vh;
		position: sticky;
		top: 0;
		left: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		overflow: hidden;
		z-index: 1;
	}

	.viz-layer {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		opacity: 0;
		pointer-events: none;
		transition: opacity 600ms ease-in-out;
	}

	.viz-layer.active {
		opacity: 1;
		pointer-events: auto;
	}

	/* Hide intro text when in scrolly mode */
	.viz-layer :global(.intro__copy) {
		display: none;
	}

	.viz-wrapper {
		max-width: 1200px;
		width: 100%;
		padding: 2rem;
	}

	.viz-wrapper.centered {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	/* Ownership card styling */
	.ownership-layer {
		padding: 2rem;
	}

	.ownership-card {
		background: rgba(10, 6, 4, 0.96);
		border-radius: 8px;
		border: 1px solid rgba(255, 224, 189, 0.35);
		padding: 2rem;
		box-shadow: 0 20px 50px rgba(5, 2, 1, 0.7);
		max-width: 600px;
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

	/* Step cards */
	.step {
		height: 100vh;
		z-index: 1000;
		max-width: 600px;
		margin: 0 0 0 auto;
		opacity: 1;
		pointer-events: none;
		display: flex;
		align-items: center;
		padding: 0 2rem 0 1rem;
		justify-content: flex-end;
	}

	.step:first-of-type {
		margin-top: calc(-100vh + 6rem);
	}

	.step-inner {
		background: rgba(10, 6, 4, 0.98);
		padding: 2rem;
		border: 1px solid rgba(255, 224, 189, 0.35);
		border-radius: 8px;
		box-shadow: 0 20px 50px rgba(5, 2, 1, 0.7);
		position: relative;
		width: 100%;
		pointer-events: auto;
	}

	.step-title {
		font-family: 'Playfair Display', 'Times New Roman', serif;
		color: rgba(255, 248, 240, 0.96);
		font-size: clamp(1.5rem, 3vw, 2rem);
		margin: 0 0 1rem 0;
		line-height: 1.3;
	}

	.step-copy {
		color: rgba(255, 248, 240, 0.85);
		font-size: clamp(1rem, 2vw, 1.15rem);
		line-height: 1.65;
		margin: 0;
	}

	.step-copy :global(strong) {
		color: rgba(225, 176, 88, 1);
		font-weight: 600;
	}

	@media (max-width: 768px) {
		.ownership-card {
			flex-direction: column;
			text-align: center;
		}

		.company-logo-pill {
			align-self: center;
		}

		.step {
			padding: 0 1rem;
			margin: 0 auto;
			justify-content: center;
		}

		.step-inner {
			padding: 1.5rem;
		}
	}
</style>
