<script>
	import { onMount } from "svelte";

	let currentIndex = $state(0);
	let interval;
	let ready = $state(false);

	const chocolates = [
		{ id: "cadbury", src: "/assets/chocolate-bars/Cadburry dairy milk.png" },
		{ id: "ferrero", src: "/assets/chocolate-bars/Ferrero Rocher.png" },
		{ id: "hersheys", src: "/assets/chocolate-bars/Hershy's Bar.png" },
		{ id: "kinder", src: "/assets/chocolate-bars/Kinder.png" },
		{ id: "kitkat", src: "/assets/chocolate-bars/KitKat.png" },
		{ id: "lindt", src: "/assets/chocolate-bars/Lindt.png" },
		{ id: "mm", src: "/assets/chocolate-bars/M&M.png" },
		{ id: "milka", src: "/assets/chocolate-bars/Milka.png" },
		{ id: "snickers", src: "/assets/chocolate-bars/Snickers.png" },
		{ id: "toblerone", src: "/assets/chocolate-bars/Toblerone.png" },
		{ id: "twix", src: "/assets/chocolate-bars/Twix.png" }
	];

	onMount(() => {
		ready = true;
		interval = setInterval(() => {
			currentIndex = (currentIndex + 1) % chocolates.length;
		}, 1800);

		return () => {
			clearInterval(interval);
		};
	});

	function getPosition(i) {
		const total = chocolates.length;
		const diff = (i - currentIndex + total) % total;
		const visualIndex = diff > total / 2 ? diff - total : diff;

		if (visualIndex <= -3) return -120;
		if (visualIndex >= 3) return 220;

		return (visualIndex + 1.5) * 33.33;
	}

	function scrollToIntro() {
		const intro = document.querySelector('.intro');
		if (intro) {
			intro.scrollIntoView({ behavior: 'smooth' });
		}
	}
</script>

<section class="title-page">
	<!-- Decorative cocoa beans background -->
	<div class="bg-decoration">
		<div class="floating-bean bean-1"></div>
		<div class="floating-bean bean-2"></div>
		<div class="floating-bean bean-3"></div>
	</div>

	<div class="title-content">
		<div class="chocolate-carousel" class:ready>
			{#each chocolates as choc, i}
				{@const active = i === currentIndex}
				{@const position = getPosition(i)}
				<img
					class="carousel-bar"
					class:active
					class:hidden={position > 150 || position < -50}
					src={choc.src}
					alt={choc.id}
					style:left="{position}%"
					loading="lazy"
				/>
			{/each}
		</div>

		<h1 class="main-title">
			<span class="title-word">Bean</span>
			<span class="title-connector">to</span>
			<span class="title-word">Bar</span>
		</h1>

		<div class="title-divider"></div>

		<p class="subtitle">The hidden journey of your chocolate</p>

		<button class="start-button" onclick={scrollToIntro}>
			<span>Begin</span>
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M12 5v14M5 12l7 7 7-7"/>
			</svg>
		</button>
	</div>
</section>

<style>
	.title-page {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		text-align: center;
		padding: 2rem;
		position: relative;
		overflow: hidden;
	}

	/* Background decoration */
	.bg-decoration {
		position: absolute;
		inset: 0;
		pointer-events: none;
		overflow: hidden;
	}

	.floating-bean {
		position: absolute;
		width: 60px;
		height: 60px;
		background: radial-gradient(ellipse at 30% 30%, #5c3a21 0%, #3d2314 100%);
		border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
		opacity: 0.15;
		animation: float 8s ease-in-out infinite;
	}

	.bean-1 {
		top: 15%;
		left: 10%;
		animation-delay: 0s;
	}

	.bean-2 {
		top: 60%;
		right: 8%;
		width: 80px;
		height: 80px;
		animation-delay: -3s;
	}

	.bean-3 {
		bottom: 20%;
		left: 15%;
		width: 50px;
		height: 50px;
		animation-delay: -5s;
	}

	@keyframes float {
		0%, 100% {
			transform: translateY(0) rotate(0deg);
		}
		50% {
			transform: translateY(-20px) rotate(10deg);
		}
	}

	/* Title divider */
	.title-divider {
		width: 120px;
		height: 2px;
		background: linear-gradient(90deg, transparent, rgba(225, 176, 88, 0.6), transparent);
		margin: 0.5rem 0;
	}

	.title-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
		width: 100%;
		max-width: 900px;
	}

	.chocolate-carousel {
		position: relative;
		width: 100%;
		height: clamp(200px, 35vh, 320px);
		margin-bottom: 1rem;
		opacity: 0;
		transition: opacity 0.5s ease;
	}

	.chocolate-carousel.ready {
		opacity: 1;
	}

	.carousel-bar {
		position: absolute;
		height: 100%;
		width: auto;
		max-width: 200px;
		object-fit: contain;
		transform: translateX(-50%);
		opacity: 0.3;
		filter: brightness(0.7) saturate(0.8);
		transition: left 0.8s ease, opacity 0.5s ease, filter 0.5s ease, transform 0.5s ease;
	}

	.carousel-bar.active {
		opacity: 1;
		filter: brightness(1.05) saturate(1) drop-shadow(0 20px 40px rgba(0, 0, 0, 0.6));
		transform: translateX(-50%) scale(1.15);
		z-index: 10;
	}

	.carousel-bar.hidden {
		opacity: 0;
		pointer-events: none;
	}

	.main-title {
		font-family: 'Playfair Display', 'Times New Roman', serif;
		font-size: clamp(3.5rem, 12vw, 8rem);
		font-weight: 700;
		color: rgba(255, 248, 240, 0.96);
		margin: 0;
		line-height: 1;
		letter-spacing: -0.02em;
		display: flex;
		align-items: baseline;
		gap: 0.3em;
		flex-wrap: wrap;
		justify-content: center;
	}

	.title-word {
		text-shadow:
			4px 4px 0 rgba(139, 90, 43, 0.4),
			0 8px 30px rgba(0, 0, 0, 0.5);
		transition: transform 0.3s ease, color 0.3s ease;
	}

	.title-word:hover {
		transform: translateY(-4px) rotate(-2deg);
		color: rgba(225, 176, 88, 1);
	}

	.title-connector {
		font-size: 0.5em;
		font-weight: 400;
		font-style: italic;
		color: rgba(225, 176, 88, 0.8);
		text-shadow: none;
	}

	.subtitle {
		font-size: clamp(1rem, 3vw, 1.5rem);
		color: rgba(255, 248, 240, 0.7);
		margin: 0;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.start-button {
		margin-top: 2rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: transparent;
		border: 1px solid rgba(225, 176, 88, 0.6);
		color: rgba(225, 176, 88, 0.9);
		padding: 0.75rem 1.5rem;
		font-size: 1rem;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		cursor: pointer;
		transition: all 200ms ease;
		border-radius: 4px;
	}

	.start-button:hover {
		background: rgba(225, 176, 88, 0.1);
		border-color: rgba(225, 176, 88, 0.9);
		transform: translateY(-2px);
	}

	.start-button svg {
		animation: bounce 2s infinite;
	}

	@keyframes bounce {
		0%, 20%, 50%, 80%, 100% {
			transform: translateY(0);
		}
		40% {
			transform: translateY(4px);
		}
		60% {
			transform: translateY(2px);
		}
	}

	@media (max-width: 768px) {
		.title-page {
			padding: 1.5rem;
		}

		.chocolate-carousel {
			height: clamp(150px, 28vh, 220px);
		}

		.carousel-bar {
			max-width: 140px;
		}

		.start-button {
			margin-top: 1.5rem;
		}
	}

	@media (max-width: 480px) {
		.chocolate-carousel {
			height: 160px;
		}

		.carousel-bar {
			max-width: 100px;
		}
	}
</style>
