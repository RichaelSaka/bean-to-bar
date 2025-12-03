<script>
	import { onMount, tick } from "svelte";
	import arrowLeft from "$svg/arrow-left.svg";
	import arrowRight from "$svg/arrow-right.svg";

	let {
		onStepChange = () => {}
	} = $props();

	let mounted = $state(false);

	onMount(async () => {
		const { register } = await import("swiper/element/bundle");
		register();
		mounted = true;

		// Wait for next tick then reset to first slide
		await tick();
		setTimeout(() => {
			if (swiperEl?.swiper) {
				swiperEl.swiper.slideTo(0, 0);
				active = 0;
			}
		}, 50);
	});

	const examples = [
		{
			src: "/assets/Cocoa-Production/Harvesting.png",
			irlSrc: "/assets/Cocoa-Production/Harvesting-irl.png",
			alt: "Harvesting cocoa pods",
			title: "Harvesting",
			description: "Farmers carefully cut the ripe cocoa pods from the tree by hand."
		},
		{
			src: "/assets/Cocoa-Production/Fermenting.png",
			irlSrc: "/assets/Cocoa-Production/Fermenting-irl.png",
			alt: "Fermenting cocoa beans",
			title: "Fermenting",
			description: "Fresh beans are scooped out and left to ferment for several days. This transforms their flavor and color."
		},
		{
			src: "/assets/Cocoa-Production/Drying.png",
			irlSrc: "/assets/Cocoa-Production/Drying-irl.png",
			alt: "Drying cocoa beans",
			title: "Drying",
			description: "After fermenting, the beans are dried under the sun on wooden trays."
		},
		{
			src: "/assets/Cocoa-Production/Sorting-and-Roasting.png",
			irlSrc: "/assets/Cocoa-Production/Sorting-and-Roasting-irl.png",
			alt: "Sorting and roasting cocoa beans",
			title: "Sorting & Roasting",
			description: "At the factory, beans are sorted and roasted to bring out their chocolate aroma."
		},
		{
			src: "/assets/Cocoa-Production/Winnowing.png",
			irlSrc: "/assets/Cocoa-Production/Winnowing-irl.png",
			alt: "Winnowing cocoa beans",
			title: "Winnowing",
			description: "Roasted beans are cracked open, and the shells are removed, leaving behind pure cocoa nibs."
		},
		{
			src: "/assets/Cocoa-Production/Grinding-and-Conching.png",
			irlSrc: "/assets/Cocoa-Production/Grinding-and-Conching-irl.png",
			alt: "Grinding and conching chocolate",
			title: "Grinding & Conching",
			description: "The nibs are ground into cocoa liquor and conched for hours until smooth and silky."
		},
		{
			src: "/assets/Cocoa-Production/Tempering.png",
			irlSrc: "/assets/Cocoa-Production/Tempering-irl.png",
			alt: "Tempering chocolate",
			title: "Tempering",
			description: "The warm chocolate is cooled and reheated in a special way to make it shiny and snappy."
		},
		{
			src: "/assets/Cocoa-Production/Molding.png",
			irlSrc: "/assets/Cocoa-Production/Molding-irl.png",
			alt: "Molding chocolate bars",
			title: "Molding",
			description: "The tempered chocolate is poured into molds and cooled until it sets into solid bars."
		},
		{
			src: "/assets/Cocoa-Production/Wrapping.png",
			irlSrc: "/assets/Cocoa-Production/Wrapping-irl.png",
			alt: "Wrapping chocolate bars",
			title: "Wrapping",
			description: "Finally, the finished chocolate bars are wrapped and packaged, ready to be enjoyed."
		}
	];

	let hoveredIndex = $state(null);

	let swiperEl = $state();
	let active = $state(0);
	let currentCaption = $derived(examples[active]?.description);

	const onSlideChange = (e) => {
		const [swiper] = e.detail;
		active = swiper.activeIndex;
		onStepChange(active);
	};

	const onClick = (index) => {
		if (swiperEl) {
			swiperEl.swiper.slideTo(index);
		}
	};

	const onKeyDown = (e, index) => {
		if (e.key === "Enter") {
			onClick(index);
		}
	};
</script>

<figure class="swiper-examples has-images">
	{#if examples[active]?.title}
		<h3 class="step-title">{examples[active].title}</h3>
	{/if}

	{#if mounted}
		<div class="outer">
			<button
				onclick={() => swiperEl.swiper.slidePrev()}
				disabled={active === 0}
				aria-label="left arrow">{@html arrowLeft}</button
			>

			<swiper-container
				bind:this={swiperEl}
				effect="coverflow"
				coverflowEffect={{ scale: 0.75, stretch: 50 }}
				speed={500}
				slides-per-view={"auto"}
				centered-slides={true}
				initial-slide="0"
				onswiperslidechange={onSlideChange}
			>
				{#each examples as example, i}
					<swiper-slide
						onclick={() => onClick(i)}
						onkeydown={(e) => onKeyDown(e, i)}
						onmouseenter={() => hoveredIndex = i}
						onmouseleave={() => hoveredIndex = null}
						tabindex="0"
						role="button"
					>
						<div class="slide-images">
							<img
								src={example.src}
								alt={example.alt}
								class="illustration"
								class:hidden={hoveredIndex === i && example.irlSrc}
							/>
							{#if example.irlSrc}
								<img
									src={example.irlSrc}
									alt={`${example.alt} - real photo`}
									class="irl-photo"
									class:visible={hoveredIndex === i}
								/>
							{/if}
						</div>
					</swiper-slide>
				{/each}
			</swiper-container>

			<button
				onclick={() => swiperEl.swiper.slideNext()}
				disabled={active === examples.length - 1}
				aria-label="right arrow">{@html arrowRight}</button
			>
		</div>
	{/if}

	{#if currentCaption}
		<figcaption>{currentCaption}</figcaption>
	{/if}

	<div class="pagination">
		{#each examples as _, i}
			<button
				class="dot"
				class:active={i === active}
				onclick={() => onClick(i)}
				aria-label={`Go to step ${i + 1}`}
			></button>
		{/each}
	</div>

	<div class="step-counter">
		Step {active + 1} of {examples.length}
	</div>
</figure>

<style>
	/* Variables for chocolate theme */
	:root {
		--color-chocolate-dark: #3d2314;
		--color-chocolate-medium: #5c3a21;
		--color-chocolate-light: #8b5a2b;
		--color-gold: #d4af37;
		--color-cream: #fff8f0;
		--border-radius: 12px;
		--14px: 0.875rem;
		--20px: 1.25rem;
	}

	swiper-container {
		width: 100%;
		overflow: hidden;
		pointer-events: none;
		padding: 1em 0;
	}

	swiper-slide {
		position: relative;
		width: fit-content;
		pointer-events: auto;
		height: auto;
		padding-bottom: 2rem;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	swiper-slide:hover {
		cursor: pointer;
	}

	figure {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: 0;
		padding: 3rem 1rem 4rem;
		background: transparent;
		width: 100%;
		height: 100%;
	}

	.step-title {
		color: var(--color-cream);
		font-size: 1.5rem;
		margin: 0 0 1rem;
		text-align: center;
		font-weight: 600;
	}

	figcaption {
		font-size: var(--14px);
		text-align: center;
		max-width: 480px;
		margin-top: 8px;
		line-height: 1.4;
		color: rgba(255, 248, 240, 0.8);
		min-height: 3em;
	}

	.slide-images {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.slide-images img {
		max-height: 480px;
		border: 12px solid #ffffff;
		border-radius: var(--border-radius);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
		transition: opacity 0.3s ease, transform 0.3s ease;
	}

	.slide-images .illustration {
		opacity: 1;
	}

	.slide-images .illustration.hidden {
		opacity: 0;
	}

	.slide-images .irl-photo {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%) scale(0.95);
		opacity: 0;
		pointer-events: none;
	}

	.slide-images .irl-photo.visible {
		opacity: 1;
		transform: translate(-50%, -50%) scale(1);
	}

	.swiper-examples .outer {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		width: 100%;
	}

	:global(.swiper-slide-shadow-left) {
		background: transparent;
	}

	:global(.swiper-slide-shadow-right) {
		background: transparent;
	}

	button {
		background: transparent;
		border: none;
		cursor: pointer;
		padding: 0;
		transition: opacity 0.2s ease, transform 0.2s ease;
	}

	button:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	button:not(:disabled):hover {
		transform: scale(1.1);
	}

	.outer > button {
		width: 4em;
	}

	:global(.swiper-examples button svg) {
		display: block;
		width: 100%;
		height: auto;
	}

	:global(.swiper-examples button svg path) {
		fill: var(--color-gold);
		stroke: #1a1410;
		stroke-width: 2px;
	}

	:global(.swiper-examples button:disabled svg path) {
		fill: #5a4a3a;
	}

	.pagination {
		display: flex;
		gap: 0.5rem;
		margin-top: 1.5rem;
	}

	.dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: rgba(255, 248, 240, 0.3);
		border: none;
		cursor: pointer;
		transition: background 0.2s ease, transform 0.2s ease;
	}

	.dot:hover {
		background: rgba(255, 248, 240, 0.5);
	}

	.dot.active {
		background: var(--color-gold);
		transform: scale(1.2);
	}

	.step-counter {
		margin-top: 1rem;
		color: rgba(255, 248, 240, 0.5);
		font-size: 0.8rem;
		letter-spacing: 0.05em;
	}

	@media (max-width: 600px) {
		figure {
			margin: 0;
			padding: 2rem 0.5rem 3rem;
		}

		.step-title {
			font-size: 1.25rem;
		}

		figcaption {
			font-size: 0.9rem;
			padding: 0 1rem;
		}

		.outer {
			position: relative;
		}

		.outer > button {
			width: 3em;
			position: absolute;
			bottom: 0;
		}

		.outer > button:first-of-type {
			left: 0;
		}

		.outer > button:last-of-type {
			right: 0;
		}

		swiper-container {
			padding-bottom: 4rem;
		}

		.slide-images img {
			max-height: 300px;
		}
	}
</style>
