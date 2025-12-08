<script>
	// Constants matching the original MSthesis visualization exactly
	const CHOCOLATE_BEANS = 400; // 1 pound of chocolate = 400 cacao beans
	const TREE_BEANS = 1200; // 1 cacao tree annual production = 1200 cacao beans
	const POD_BEANS = 40; // 1 cacao pod = 40 cacao beans

	// Grid settings - matching original exactly: size=12, groupSpacing=5, cellSpacing=1
	const size = 12;
	const cellSpacing = 1;
	const groupSpacing = 5;

	// Active mode state
	let activeMode = $state("chocolate");

	// Reactive values based on active mode
	let beanCount = $derived(
		activeMode === "chocolate"
			? CHOCOLATE_BEANS
			: activeMode === "tree"
				? TREE_BEANS
				: POD_BEANS
	);

	let title = $derived(
		activeMode === "chocolate"
			? "1 pound of chocolate"
			: activeMode === "tree"
				? "1 cacao tree"
				: "1 cacao pod"
	);

	let subtitle = $derived(activeMode === "tree" ? "(annual production)" : "");

	let beanLabel = $derived(
		activeMode === "chocolate"
			? "400 cacao beans"
			: activeMode === "tree"
				? "1200 cacao beans"
				: "40 cacao beans"
	);

	// Calculate grid position for each bean - matching original algorithm exactly
	function getBeanPosition(index) {
		const x0 = Math.floor(index / 100) % 5;
		const x1 = Math.floor(index % 10);
		const y0 = Math.floor(index / 500);
		const y1 = Math.floor((index % 100) / 10);

		const x = groupSpacing * x0 + (cellSpacing + size) * (x1 + x0 * 10);
		const y = groupSpacing * y0 + (cellSpacing + size) * (y1 + y0 * 10);

		return { x, y };
	}

	// Generate bean data
	let beans = $derived(
		Array.from({ length: beanCount }, (_, i) => ({
			id: i,
			...getBeanPosition(i)
		}))
	);

	// Hover state
	let hoveredBean = $state(null);

	// Calculate SVG height based on mode
	// Last bean (1199): y = 5*2 + 13*(9 + 20) = 10 + 377 = 387 + 12 (bean) + 30 (offset) = 429
	// Last bean (499): y = 5*0 + 13*(9 + 0) = 117 + 12 + 30 = 159
	// Last bean (39): y = 5*0 + 13*(3 + 0) = 39 + 12 + 30 = 81
	// Add padding for explanation text
	let svgHeight = $derived(
		activeMode === "tree" ? 530 : activeMode === "chocolate" ? 250 : 180
	);
</script>

<section class="calculator-section">
	<div class="calculator-content">
		<h5 class="section-label">How many cacao beans are in...</h5>

		<div class="button-group">
			<button
				class="calc-button"
				class:active={activeMode === "tree"}
				onclick={() => (activeMode = "tree")}
			>
				Cacao Tree
			</button>
			<button
				class="calc-button"
				class:active={activeMode === "pod"}
				onclick={() => (activeMode = "pod")}
			>
				Cacao Pod
			</button>
			<button
				class="calc-button"
				class:active={activeMode === "chocolate"}
				onclick={() => (activeMode = "chocolate")}
			>
				Chocolate
			</button>
		</div>

		<!-- SVG with dynamic viewBox based on mode -->
		<svg class="calculator-svg" viewBox="0 0 1100 {svgHeight}" preserveAspectRatio="xMinYMin meet">
			<!-- Formula title text -->
			<text x="20" y="45" class="formula-title">{title}</text>
			{#if subtitle}
				<text x="20" y="75" class="formula-subtitle">{subtitle}</text>
			{/if}

			<!-- Equals sign -->
			<text x="270" y="45" class="formula-equals">=</text>

			<!-- Bean count label -->
			<text x="320" y="20" class="bean-label">{beanLabel}</text>

			<!-- Beans grid -->
			<g transform="translate(320, 30)">
				{#each beans as bean (bean.id)}
					<rect
						x={bean.x}
						y={bean.y}
						width={size}
						height={size}
						rx={10}
						ry={10}
						class="bean"
						class:hovered={hoveredBean === bean.id}
						role="img"
						aria-label="cacao bean"
						onmouseenter={() => (hoveredBean = bean.id)}
						onmouseleave={() => (hoveredBean = null)}
					/>
				{/each}
			</g>

			<!-- Explanation text - positioned relative to svgHeight -->
			<text x="0" y={svgHeight - 50} class="explanation-text">
				The calculation model is based on the prerequisite of nice weathers with no natural or
			</text>
			<text x="0" y={svgHeight - 35} class="explanation-text">
				human catastrophe intervened which means if there are any other additional factors happened,
			</text>
			<text x="0" y={svgHeight - 20} class="explanation-text">
				each pound of chocolate will cost more tree's production.
			</text>
		</svg>
	</div>

	<div class="floating-explanation">
		<p>
			A healthy cacao tree can produce approximately 30 cocoa pods a year in average, and inside
			each pod typically there are 40 cocoa beans. It's inevitable that there will be some losses
			at each stage so roughly <b>1 pound of chocolate</b> needs <b>500 cocoa beans</b> as raw
			materials. In a nutshell a whole year's yield from <b>one tree</b> can make
			<b>2 pounds of chocolate</b>.
		</p>
	</div>
</section>

<style>
	.calculator-section {
		width: 100%;
		min-height: 150vh;
		position: relative;
		display: flex;
		padding: 4rem 2rem;
		gap: 2rem;
	}

	.calculator-content {
		position: sticky;
		top: 25px;
		height: fit-content;
		flex: 1;
		padding: 30px 0;
	}

	.section-label {
		color: rgba(255, 248, 240, 0.96);
		font-family: "Courier New", courier-std, monospace;
		font-style: normal;
		font-weight: 800;
		font-size: 14px;
		margin: 0 0 20px 0;
	}

	.button-group {
		display: flex;
		gap: 10px;
		margin-bottom: 20px;
		flex-wrap: wrap;
	}

	.calc-button {
		border: 1px solid rgba(255, 248, 240, 0.6);
		border-radius: 20px;
		font-size: 12px;
		font-weight: 400;
		font-family: "Courier New", courier, monospace;
		color: rgba(255, 248, 240, 0.85);
		background: none;
		width: 150px;
		padding: 10px;
		text-align: center;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.calc-button:hover {
		border-color: rgba(225, 176, 88, 0.8);
		color: rgba(255, 248, 240, 1);
	}

	.calc-button.active {
		background: rgba(225, 176, 88, 1);
		border-color: rgba(225, 176, 88, 1);
		color: #000000;
	}

	.calculator-svg {
		width: 100%;
		height: auto;
		display: block;
	}

	.formula-title {
		font-family: "gopher", sans-serif;
		font-size: 24px;
		font-weight: 800;
		fill: rgba(255, 248, 240, 0.96);
	}

	.formula-subtitle {
		font-family: "gopher", sans-serif;
		font-size: 24px;
		font-weight: 800;
		fill: rgba(255, 248, 240, 0.96);
	}

	.formula-equals {
		font-family: "gopher", sans-serif;
		font-size: 24px;
		font-weight: 800;
		fill: rgba(225, 176, 88, 1);
	}

	.bean-label {
		font-family: "Courier New", courier, monospace;
		font-size: 14px;
		font-weight: 800;
		fill: rgba(255, 248, 240, 0.85);
	}

	.bean {
		fill: rgba(255, 248, 240, 0.9);
		transition: fill 0.15s ease;
		cursor: pointer;
	}

	.bean:hover,
	.bean.hovered {
		fill: #8B4513;
	}

	.explanation-text {
		font-family: "Courier New", courier, monospace;
		font-size: 10px;
		font-weight: 800;
		fill: rgba(255, 248, 240, 0.5);
	}

	.floating-explanation {
		position: sticky;
		top: 500px;
		background-color: #fffaf0;
		padding: 20px;
		width: 450px;
		height: fit-content;
		align-self: flex-start;
		flex-shrink: 0;
	}

	.floating-explanation p {
		color: #000000;
		font-family: "Courier New", courier-std, monospace;
		font-style: normal;
		font-weight: 400;
		font-size: 12px;
		margin: 0;
		line-height: 1.6;
	}

	.floating-explanation b {
		color: tomato;
		font-style: normal;
		font-weight: 800;
	}

	@media (max-width: 1200px) {
		.calculator-section {
			flex-direction: column;
			min-height: 100vh;
			padding: 2rem;
		}

		.calculator-content {
			position: relative;
			top: 0;
			width: 100%;
		}

		.floating-explanation {
			position: relative;
			top: 0;
			width: 100%;
			margin-top: 2rem;
		}
	}

	@media (max-width: 768px) {
		.calculator-section {
			padding: 1rem;
		}

		.button-group {
			justify-content: center;
		}

		.calc-button {
			width: auto;
			flex: 1;
			min-width: 100px;
		}

		.floating-explanation {
			width: 100%;
		}
	}
</style>
