<script>
	import Scrolly from "$components/helpers/Scrolly.svelte";

	let currentStep = $state(0);

	const steps = [
		{
			src: "/assets/Cocoa-Production/Harvesting.png",
			irlSrc: "/assets/Cocoa-Production/Harvesting-irl.png",
			alt: "Harvesting cocoa pods",
			title: "Harvesting",
			stepNumber: "01",
			description: "Farmers carefully cut the ripe cocoa pods from the tree by hand. Each pod contains 20-50 cocoa beans surrounded by sweet white pulp."
		},
		{
			src: "/assets/Cocoa-Production/Fermenting.png",
			irlSrc: "/assets/Cocoa-Production/Fermenting-irl.png",
			alt: "Fermenting cocoa beans",
			title: "Fermenting",
			stepNumber: "02",
			description: "Fresh beans are scooped out and left to ferment for several days. This transforms their flavor and color, developing the chocolate taste we love."
		},
		{
			src: "/assets/Cocoa-Production/Drying.png",
			irlSrc: "/assets/Cocoa-Production/Drying-irl.png",
			alt: "Drying cocoa beans",
			title: "Drying",
			stepNumber: "03",
			description: "After fermenting, the beans are dried under the sun on wooden trays. Workers turn them regularly to ensure even drying over 5-7 days."
		},
		{
			src: "/assets/Cocoa-Production/Sorting-and-Roasting.png",
			irlSrc: "/assets/Cocoa-Production/Sorting-and-Roasting-irl.png",
			alt: "Sorting and roasting cocoa beans",
			title: "Sorting & Roasting",
			stepNumber: "04",
			description: "At the factory, beans are sorted by quality and roasted to bring out their chocolate aroma. Temperature and time are carefully controlled."
		},
		{
			src: "/assets/Cocoa-Production/Winnowing.png",
			irlSrc: "/assets/Cocoa-Production/Winnowing-irl.png",
			alt: "Winnowing cocoa beans",
			title: "Winnowing",
			stepNumber: "05",
			description: "Roasted beans are cracked open, and the shells are removed, leaving behind pure cocoa nibs—the essence of chocolate."
		},
		{
			src: "/assets/Cocoa-Production/Grinding-and-Conching.png",
			irlSrc: "/assets/Cocoa-Production/Grinding-and-Conching-irl.png",
			alt: "Grinding and conching chocolate",
			title: "Grinding & Conching",
			stepNumber: "06",
			description: "The nibs are ground into cocoa liquor and conched for hours until smooth and silky. This process can take 24-72 hours for premium chocolate."
		},
		{
			src: "/assets/Cocoa-Production/Tempering.png",
			irlSrc: "/assets/Cocoa-Production/Tempering-irl.png",
			alt: "Tempering chocolate",
			title: "Tempering",
			stepNumber: "07",
			description: "The warm chocolate is cooled and reheated in a special way to make it shiny and snappy. This gives chocolate its satisfying break."
		},
		{
			src: "/assets/Cocoa-Production/Molding.png",
			irlSrc: "/assets/Cocoa-Production/Molding-irl.png",
			alt: "Molding chocolate bars",
			title: "Molding",
			stepNumber: "08",
			description: "The tempered chocolate is poured into molds and cooled until it sets into solid bars. Vibration removes any air bubbles."
		},
		{
			src: "/assets/Cocoa-Production/Wrapping.png",
			irlSrc: "/assets/Cocoa-Production/Wrapping-irl.png",
			alt: "Wrapping chocolate bars",
			title: "Wrapping",
			stepNumber: "09",
			description: "Finally, the finished chocolate bars are wrapped and packaged, ready to be enjoyed around the world."
		}
	];

	let currentImage = $derived(steps[currentStep]?.src || steps[0].src);
	let currentIrlImage = $derived(steps[currentStep]?.irlSrc || steps[0].irlSrc);
	let showIrl = $state(false);
</script>

<section class="bean-to-bar-scrolly">
	<div class="scrolly-container">
		<!-- Sticky visualization -->
		<div class="sticky-viz">
			<div class="image-container">
				{#each steps as step, i}
					<img
						src={showIrl ? step.irlSrc : step.src}
						alt={step.alt}
						class="step-image"
						class:active={currentStep === i}
					/>
				{/each}
			</div>
			<button
				class="toggle-btn"
				onclick={() => showIrl = !showIrl}
			>
				{showIrl ? "Show illustration" : "Show real photo"}
			</button>
		</div>

		<!-- Scrolly steps -->
		<div class="steps-container">
			<Scrolly bind:value={currentStep}>
				{#each steps as step, i}
					<div class="step" class:active={currentStep === i}>
						<div class="step-card">
							<div class="card-line"></div>

							<div class="step-header">
								<span class="step-number">{step.stepNumber}</span>
								<h3 class="step-title">{step.title}</h3>
							</div>

							<div class="card-divider">- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -</div>

							<p class="step-description">{step.description}</p>

							<div class="card-line bottom"></div>

							{#if i < steps.length - 1}
								<p class="scroll-hint">(scroll to continue)</p>
							{:else}
								<p class="scroll-hint final">(end of journey)</p>
							{/if}
						</div>
					</div>
				{/each}
			</Scrolly>
		</div>
	</div>

	<!-- Progress indicator -->
	<div class="progress-bar">
		<div class="progress-fill" style="width: {((currentStep + 1) / steps.length) * 100}%"></div>
	</div>
	<div class="progress-text">Step {currentStep + 1} of {steps.length}</div>
</section>

<style>
	.bean-to-bar-scrolly {
		position: relative;
		width: 100%;
	}

	.scrolly-container {
		display: flex;
		position: relative;
	}

	/* Sticky visualization */
	.sticky-viz {
		position: sticky;
		top: 10vh;
		width: 50%;
		height: 80vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem;
	}

	.image-container {
		position: relative;
		width: 100%;
		max-width: 500px;
		aspect-ratio: 1;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.step-image {
		position: absolute;
		max-width: 100%;
		max-height: 100%;
		border: 12px solid #ffffff;
		border-radius: 12px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
		opacity: 0;
		transform: scale(0.95);
		transition: opacity 0.5s ease, transform 0.5s ease;
	}

	.step-image.active {
		opacity: 1;
		transform: scale(1);
	}

	.toggle-btn {
		margin-top: 1.5rem;
		font-family: "Courier New", Courier, monospace;
		font-size: 0.8rem;
		font-weight: 600;
		color: #1a1a1a;
		background: #f5e6d3;
		border: none;
		padding: 8px 16px;
		cursor: pointer;
		transition: background 0.2s ease;
	}

	.toggle-btn:hover {
		background: #e8d5be;
	}

	/* Steps container */
	.steps-container {
		width: 50%;
		position: relative;
	}

	.step {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: flex-start;
		padding: 2rem;
	}

	/* MS Project style card */
	.step-card {
		max-width: 420px;
		padding: 25px 30px;
		background: #f5e6d3;
		text-align: left;
		opacity: 0.4;
		transform: translateY(20px);
		transition: opacity 0.4s ease, transform 0.4s ease;
	}

	.step.active .step-card {
		opacity: 1;
		transform: translateY(0);
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

	.step-header {
		display: flex;
		align-items: baseline;
		gap: 12px;
	}

	.step-number {
		font-family: "Courier New", Courier, monospace;
		font-size: 0.75rem;
		font-weight: 700;
		color: tomato;
	}

	.step-title {
		font-family: "gopher", Georgia, serif;
		font-size: 1.5rem;
		font-weight: 700;
		color: #1a1a1a;
		margin: 0;
		line-height: 1.2;
	}

	.step-description {
		font-family: "Courier New", Courier, monospace;
		font-size: 0.9rem;
		font-weight: 500;
		line-height: 1.7;
		margin: 0;
		color: #1a1a1a;
	}

	.scroll-hint {
		font-family: "Courier New", Courier, monospace;
		font-size: 0.8rem;
		font-weight: 700;
		color: #1a1a1a;
		margin: 0;
		text-align: center;
		animation: blink 1.5s ease-in-out infinite;
	}

	.scroll-hint.final {
		animation: none;
		color: tomato;
	}

	@keyframes blink {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.3;
		}
	}

	/* Progress bar */
	.progress-bar {
		position: fixed;
		bottom: 60px;
		left: 50%;
		transform: translateX(-50%);
		width: 200px;
		height: 4px;
		background: rgba(255, 248, 240, 0.2);
		border-radius: 2px;
		z-index: 100;
	}

	.progress-fill {
		height: 100%;
		background: tomato;
		border-radius: 2px;
		transition: width 0.3s ease;
	}

	.progress-text {
		position: fixed;
		bottom: 30px;
		left: 50%;
		transform: translateX(-50%);
		font-family: "Courier New", Courier, monospace;
		font-size: 0.75rem;
		color: rgba(255, 248, 240, 0.6);
		z-index: 100;
	}

	/* Responsive */
	@media (max-width: 900px) {
		.scrolly-container {
			flex-direction: column;
		}

		.sticky-viz {
			width: 100%;
			height: 50vh;
			top: 0;
		}

		.image-container {
			max-width: 300px;
		}

		.steps-container {
			width: 100%;
		}

		.step {
			min-height: 60vh;
			justify-content: center;
		}

		.step-card {
			max-width: 100%;
		}
	}

	@media (max-width: 600px) {
		.sticky-viz {
			height: 40vh;
			padding: 1rem;
		}

		.image-container {
			max-width: 250px;
		}

		.step-image {
			border-width: 8px;
		}

		.step {
			padding: 1rem;
		}

		.step-card {
			padding: 20px;
		}

		.step-title {
			font-size: 1.25rem;
		}

		.step-description {
			font-size: 0.85rem;
		}

		.toggle-btn {
			font-size: 0.7rem;
			padding: 6px 12px;
		}
	}
</style>
