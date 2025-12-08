<script>
	import ownership from "$data/chocolate-ownership.json";
	import { selectedChocolateId } from "$runes/selectedChocolate.svelte.js";
	import ChocolateScrollyStory from "$components/ChocolateScrollyStory.svelte";

	// Map chocolate id → ownership info (parent company, logo, bar image)
	const ownershipById = new Map(ownership.map((d) => [d.id, d]));

	// Keep track of which bar was selected in the intro
	let selectedId = $state(null);
	let selectedChocolate = $state(null);

	$effect(() => {
		const unsubscribe = selectedChocolateId.subscribe((value) => {
			selectedId = value;
			if (value) {
				selectedChocolate = ownershipById.get(value);
			}
		});

		return () => {
			unsubscribe?.();
		};
	});
</script>

{#if selectedId && selectedChocolate}
	<ChocolateScrollyStory {selectedChocolate} />
{:else}
	<section class="company-section-empty" aria-label="Choose your chocolate">
		<div class="empty-state">
			<div class="company-card company-card--empty">
				<p class="company__eyebrow">Who owns your favorite bar?</p>
				<p class="company__body">
					Tap a chocolate bar above to see which global company is behind it.
				</p>
			</div>
		</div>
	</section>
{/if}

<style>
	.company-section-empty {
		padding: 5rem 1.5rem 6rem;
		background: none;
		min-height: 60vh;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		z-index: 5;
	}

	.empty-state {
		max-width: 520px;
		width: 100%;
	}

	.company-card {
		background: #f5e6d3;
		border-radius: 0;
		border: none;
		padding: 25px 30px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
		text-align: center;
	}

	.company__eyebrow {
		font-family: "Courier New", Courier, monospace;
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #1a1a1a;
		margin: 0 0 12px 0;
	}

	.company__body {
		margin: 0;
		font-family: "gopher", Georgia, serif;
		font-size: 1.25rem;
		font-weight: 700;
		font-style: italic;
		line-height: 1.4;
		color: #1a1a1a;
	}
</style>
