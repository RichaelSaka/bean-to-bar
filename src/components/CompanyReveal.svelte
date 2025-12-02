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
		color: rgba(255, 248, 240, 0.94);
		min-height: 60vh;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		z-index: 5;
	}

	.empty-state {
		max-width: 560px;
		width: 100%;
	}

	.company-card {
		background: rgba(10, 6, 4, 0.96);
		border-radius: 4px;
		border: 1px solid rgba(255, 224, 189, 0.35);
		padding: 1.75rem 1.75rem 1.5rem;
		box-shadow: 0 20px 50px rgba(5, 2, 1, 0.7);
		text-align: center;
	}

	.company__eyebrow {
		font-size: 0.8rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: rgba(255, 224, 189, 0.8);
		margin-bottom: 0.5rem;
	}

	.company__body {
		margin: 0;
		font-size: 0.95rem;
		line-height: 1.6;
		color: rgba(255, 245, 234, 0.9);
	}
</style>
