<script>
	import { onMount } from "svelte";
	import { selectedChocolateId } from "$runes/selectedChocolate.svelte.js";

	let selectedId = $state(null);

	$effect(() => {
		const unsubscribe = selectedChocolateId.subscribe((value) => {
			selectedId = value;
			// Enable scrolling once a bar is selected
			if (value && typeof document !== 'undefined') {
				document.body.style.overflow = 'auto';
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
			// Lock scroll until chocolate is selected
			document.body.style.overflow = 'hidden';
			document.body.style.position = 'relative';
		}

		return () => {
			if (typeof document !== 'undefined') {
				document.body.style.overflow = 'auto';
				document.body.style.position = '';
			}
		};
	});

	const subtitle = "We're curious which chocolate you love most. Tap your favorite bar to begin.";
	const hint = "Tap on a bar to start, horizontal scroll for more options";

	const chocolates = [
		{
			id: "cadbury",
			name: "Cadbury Dairy Milk",
			src: "/assets/chocolate-bars/Cadburry dairy milk.png"
		},
		{
			id: "ferrero",
			name: "Ferrero Rocher",
			src: "/assets/chocolate-bars/Ferrero Rocher.png"
		},
		{
			id: "hersheys",
			name: "Hershy's Bar",
			src: "/assets/chocolate-bars/Hershy's Bar.png"
		},
		{
			id: "kinder",
			name: "Kinder",
			src: "/assets/chocolate-bars/Kinder.png"
		},
		{
			id: "kitkat",
			name: "KitKat",
			src: "/assets/chocolate-bars/KitKat.png"
		},
		{
			id: "lindt",
			name: "Lindt",
			src: "/assets/chocolate-bars/Lindt.png"
		},
		{
			id: "mm",
			name: "M&M",
			src: "/assets/chocolate-bars/M&M.png"
		},
		{
			id: "milka",
			name: "Milka",
			src: "/assets/chocolate-bars/Milka.png"
		},
		{
			id: "milky-way",
			name: "Milky Way",
			src: "/assets/chocolate-bars/Milky Way.png"
		},
		{
			id: "nutella",
			name: "Nutella",
			src: "/assets/chocolate-bars/Nutella.png"
		},
		{
			id: "oreo",
			name: "Oreo",
			src: "/assets/chocolate-bars/Oreo.png"
		},
		{
			id: "reeses",
			name: "Reese's",
			src: "/assets/chocolate-bars/Reese's.png"
		},
		{
			id: "snickers",
			name: "Snickers",
			src: "/assets/chocolate-bars/Snickers.png"
		},
		{
			id: "toblerone",
			name: "Toblerone",
			src: "/assets/chocolate-bars/Toblerone.png"
		},
		{
			id: "twix",
			name: "Twix",
			src: "/assets/chocolate-bars/Twix.png"
		}
	];

	// repeat the chocolates so the rail feels like it can scroll "forever"
	const railItems = [...chocolates, ...chocolates, ...chocolates];

	function handleSelect(chocolate) {
		selectedId = chocolate.id;
		selectedChocolateId.set(chocolate.id);
		console.log("Selected chocolate bar:", chocolate.id, chocolate.name);
	}
</script>

<section class="intro" aria-label="Choose your favorite chocolate bar">
	<div class="intro__inner">
		<header class="intro__copy" aria-label="Story intro">
			<p class="intro__subtitle">{subtitle}</p>
			<p class="intro__hint">
				<span class="intro__hint-icon" aria-hidden="true">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
					>
						<path d="M5 12h12" stroke="#f9b44c" stroke-width="2" stroke-linecap="round" />
						<path
							d="M13 7l4 5-4 5"
							stroke="#f9b44c"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</span>
				<span class="intro__hint-text">{hint}</span>
			</p>
		</header>

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

		{#if selectedId}
			<div class="scroll-cue">
				<span class="scroll-text">Scroll to explore</span>
				<div class="scroll-arrow">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M12 5v14M5 12l7 7 7-7"/>
					</svg>
				</div>
			</div>
		{/if}
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

	.intro__copy {
		max-width: 560px;
		margin: 1.75rem auto 1.75rem;
		padding: 1.75rem 1.5rem;
		background: rgba(10, 6, 4, 0.96);
		border-radius: 4px;
		border: 1px solid rgba(255, 224, 189, 0.35);
		box-shadow: 0 20px 50px rgba(5, 2, 1, 0.7);
		text-align: left;
	}

	.intro__subtitle {
		font-size: 1.05rem;
		line-height: 1.6;
		margin-bottom: 1.25rem;
		color: rgba(255, 255, 255, 0.9);
	}

	.intro__hint {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
		color: #f9b44c;
		font-weight: 500;
	}

	.intro__hint-icon svg {
		display: block;
		width: 1.1rem;
		height: 1.1rem;
	}

	.intro__hint-text {
		display: inline-block;
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

		.intro__copy {
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

		.intro__choices {
			gap: 0.5rem;
		}
	}

	/* Scroll cue */
	.scroll-cue {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		margin-top: 0.10rem;
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
</style>
