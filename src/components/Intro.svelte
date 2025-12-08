<script>
	import { onMount } from "svelte";
	import { base } from "$app/paths";
	import { selectedChocolateId } from "$runes/selectedChocolate.svelte.js";

	let selectedId = $state(null);
	let selectedName = $state(null);

	$effect(() => {
		const unsubscribe = selectedChocolateId.subscribe((value) => {
			selectedId = value;
			if (value) {
				const chocolate = chocolates.find(c => c.id === value);
				selectedName = chocolate?.name || null;
			} else {
				selectedName = null;
			}
		});

		return () => {
			unsubscribe?.();
		};
	});

	onMount(() => {
		// Ensure we start at the top of the page
		if (typeof window !== 'undefined') {
			window.scrollTo(0, 0);
		}
	});

	const chocolates = [
		{
			id: "cadbury",
			name: "Cadbury Dairy Milk",
			src: `${base}/assets/chocolate-bars/Cadburry dairy milk.png`
		},
		{
			id: "ferrero",
			name: "Ferrero Rocher",
			src: `${base}/assets/chocolate-bars/Ferrero Rocher.png`
		},
		{
			id: "hersheys",
			name: "Hershy's Bar",
			src: `${base}/assets/chocolate-bars/Hershy's Bar.png`
		},
		{
			id: "kinder",
			name: "Kinder",
			src: `${base}/assets/chocolate-bars/Kinder.png`
		},
		{
			id: "kitkat",
			name: "KitKat",
			src: `${base}/assets/chocolate-bars/KitKat.png`
		},
		{
			id: "lindt",
			name: "Lindt",
			src: `${base}/assets/chocolate-bars/Lindt.png`
		},
		{
			id: "mm",
			name: "M&M",
			src: `${base}/assets/chocolate-bars/M&M.png`
		},
		{
			id: "milka",
			name: "Milka",
			src: `${base}/assets/chocolate-bars/Milka.png`
		},
		{
			id: "milky-way",
			name: "Milky Way",
			src: `${base}/assets/chocolate-bars/Milky Way.png`
		},
		{
			id: "nutella",
			name: "Nutella",
			src: `${base}/assets/chocolate-bars/Nutella.png`
		},
		{
			id: "oreo",
			name: "Oreo",
			src: `${base}/assets/chocolate-bars/Oreo.png`
		},
		{
			id: "reeses",
			name: "Reese's",
			src: `${base}/assets/chocolate-bars/Reese's.png`
		},
		{
			id: "snickers",
			name: "Snickers",
			src: `${base}/assets/chocolate-bars/Snickers.png`
		},
		{
			id: "toblerone",
			name: "Toblerone",
			src: `${base}/assets/chocolate-bars/Toblerone.png`
		},
		{
			id: "twix",
			name: "Twix",
			src: `${base}/assets/chocolate-bars/Twix.png`
		}
	];

	// repeat the chocolates so the rail feels like it can scroll "forever"
	const railItems = [...chocolates, ...chocolates, ...chocolates];

	function handleSelect(chocolate) {
		selectedId = chocolate.id;
		selectedName = chocolate.name;
		selectedChocolateId.set(chocolate.id);
		console.log("Selected chocolate bar:", chocolate.id, chocolate.name);
	}
</script>

<section class="intro" aria-label="Choose your favorite chocolate bar">
	<div class="intro__inner">
		<div class="intro__card">
			<div class="card-line"></div>

			<p class="intro__subtitle">We're curious which chocolate you love most. Tap your favorite bar to begin.</p>

			<div class="card-divider">- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -</div>

			{#if selectedId}
				<p class="selection-text">You selected <strong>{selectedName}</strong></p>
				<p class="selection-hint">(scroll to start)</p>
			{:else}
				<p class="intro__hint">
					<span class="intro__hint-icon" aria-hidden="true">→</span>
					<span class="intro__hint-text">Tap on a bar to start, <strong class="highlight">horizontal scroll for more options</strong></span>
				</p>
			{/if}

			<div class="card-line bottom"></div>
		</div>

		<section class="intro__choices" aria-label="Choose your favorite chocolate bar">
			{#each railItems as chocolate, i (i)}
				<button
					type="button"
					class:intro__choice={true}
					class:selected={selectedId === chocolate.id}
					onclick={() => handleSelect(chocolate)}
					aria-label={`Select ${chocolate.name}`}
				>
					<figure>
						<img src={chocolate.src} alt={chocolate.name} loading="lazy" />
					</figure>
				</button>
			{/each}
		</section>

			</div>
</section>

<style>
	.intro {
		min-height: 100vh;
		background: none;
		color: rgba(255, 248, 240, 0.94);
		padding: 4rem 1.5rem 5rem;
		position: relative;
		z-index: 10;
	}

	.intro__inner {
		max-width: 960px;
		margin: 0 auto;
		text-align: center;
	}

	/* MS Project style card */
	.intro__card {
		max-width: 480px;
		margin: 1.75rem auto 1.75rem;
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
		margin-bottom: 0;
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

	.intro__subtitle {
		font-family: "Courier New", Courier, monospace;
		font-size: 0.95rem;
		font-weight: 700;
		line-height: 1.6;
		margin: 0;
		color: #1a1a1a;
	}

	.intro__hint {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		font-family: "Courier New", Courier, monospace;
		font-size: 0.8rem;
		color: #1a1a1a;
		font-weight: 400;
		margin: 0;
	}

	.intro__hint-icon {
		font-weight: 700;
		flex-shrink: 0;
	}

	.intro__hint-text {
		display: inline-block;
	}

	.intro__hint-text .highlight {
		color: tomato;
	}

	.intro__choices {
		margin-top: 0.25rem;
		width: 100vw;
		margin-left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: 1.25rem;
		align-items: flex-end;
		justify-content: flex-start;
		overflow-x: auto;
		padding-inline: 1.5rem;
		padding-bottom: 0.5rem;
		scroll-snap-type: x mandatory;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none; /* Firefox */
		-ms-overflow-style: none; /* IE/Edge legacy */
	}

	.intro__choices::-webkit-scrollbar {
		display: none; /* Chrome/Safari */
	}

	.intro__choice {
		background: transparent;
		border: none;
		cursor: pointer;
		padding: 0;
		transition: transform 160ms ease-out, box-shadow 160ms ease-out, filter 160ms ease-out;
		outline-offset: 4px;
		flex: 0 0 auto;
		scroll-snap-align: center;
	}

	.intro__choice figure {
		margin: 0;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.intro__choice img {
		display: block;
		height: clamp(440px, 70vh, 620px);
		width: auto;
		object-fit: contain;
		filter: drop-shadow(0 0 0 rgba(0, 0, 0, 0.6));
	}

	.intro__choice:hover,
	.intro__choice:focus-visible {
		transform: translateY(-10px) scale(1.06) rotate(-1.5deg);
		filter: brightness(1.05);
	}

	.intro__choice.selected {
		transform: translateY(-14px) scale(1.1) rotate(-2deg);
		filter: brightness(1.08);
	}

	.intro__choice.selected img {
		filter: drop-shadow(0 16px 40px rgba(0, 0, 0, 0.9));
	}

	@media (max-width: 1024px) {
		.intro__choices {
			gap: 1.25rem;
			padding-inline: 1.25rem;
		}
	}

	@media (max-width: 768px) {
		.intro {
			padding-top: 2.5rem;
		}

		.intro__card {
			margin-bottom: 2.25rem;
		}

		.intro__choices {
			gap: 1rem;
			padding-inline: 1rem;
		}
	}

	@media (max-width: 520px) {
		.intro__choices {
			gap: 0.75rem;
		}
	}

	@media (max-width: 480px) {
		.intro {
			padding-inline: 1.25rem;
		}

		.intro__card {
			padding: 20px;
		}

		.intro__choices {
			gap: 0.5rem;
		}
	}

	/* Selection text (shown inside card when chocolate is selected) */
	.selection-text {
		font-family: "Courier New", Courier, monospace;
		font-size: 0.95rem;
		font-weight: 500;
		color: #1a1a1a;
		margin: 0 0 8px 0;
	}

	.selection-text strong {
		font-weight: 700;
		color: tomato;
	}

	.selection-hint {
		font-family: "Courier New", Courier, monospace;
		font-size: 0.85rem;
		font-weight: 700;
		color: #1a1a1a;
		margin: 0;
		animation: blink 1.5s ease-in-out infinite;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes blink {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.3;
		}
	}
</style>
