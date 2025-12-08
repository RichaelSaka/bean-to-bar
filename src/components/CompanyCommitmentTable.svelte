<script>
	// Props - selected chocolate from the beginning
	let { selectedChocolate = null } = $props();

	// Company scorecard data based on the Chocolate Scorecard
	const categories = [
		"Traceability & Transparency",
		"Child Labor",
		"Living Income",
		"Deforestation",
		"Agroforestry",
		"Climate",
		"Pollutants",
		"Water"
	];

	// Sort state - which category to sort by and direction
	let sortBy = $state(null); // null means default order (overall score)
	let sortDirection = $state('desc'); // 'asc' or 'desc'

	// Threshold definitions:
	// >= 60% = Yes (check), < 40% = No (X), 40-59% = Maybe (M)
	const companies = [
		{
			name: "Tony's Chocolonely",
			scores: {
				"Traceability & Transparency": 100,
				"Child Labor": 97.8,
				"Living Income": 93.3,
				"Deforestation": 100,
				"Agroforestry": 100,
				"Climate": 80,
				"Pollutants": 80,
				"Water": 100
			}
		},
		{
			name: "Lindt & Sprungli",
			scores: {
				"Traceability & Transparency": 62.5,
				"Child Labor": 60.9,
				"Living Income": 40,
				"Deforestation": 75,
				"Agroforestry": 53.3,
				"Climate": 60,
				"Pollutants": 40,
				"Water": 60
			}
		},
		{
			name: "Barry Callebaut",
			scores: {
				"Traceability & Transparency": 55,
				"Child Labor": 54.3,
				"Living Income": 33.3,
				"Deforestation": 65,
				"Agroforestry": 46.7,
				"Climate": 46.7,
				"Pollutants": 30,
				"Water": 40
			}
		},
		{
			name: "Nestle",
			scores: {
				"Traceability & Transparency": 45,
				"Child Labor": 43.5,
				"Living Income": 26.7,
				"Deforestation": 60,
				"Agroforestry": 33.3,
				"Climate": 53.3,
				"Pollutants": 30,
				"Water": 40
			}
		},
		{
			name: "Mondelez",
			scores: {
				"Traceability & Transparency": 40,
				"Child Labor": 39.1,
				"Living Income": 20,
				"Deforestation": 50,
				"Agroforestry": 26.7,
				"Climate": 40,
				"Pollutants": 20,
				"Water": 20
			}
		},
		{
			name: "Mars Wrigley",
			scores: {
				"Traceability & Transparency": 37.5,
				"Child Labor": 39.1,
				"Living Income": 16.7,
				"Deforestation": 40,
				"Agroforestry": 20,
				"Climate": 40,
				"Pollutants": 20,
				"Water": 20
			}
		},
		{
			name: "Cargill",
			scores: {
				"Traceability & Transparency": 35,
				"Child Labor": 34.8,
				"Living Income": 13.3,
				"Deforestation": 35,
				"Agroforestry": 13.3,
				"Climate": 33.3,
				"Pollutants": 20,
				"Water": 20
			}
		},
		{
			name: "Ferrero",
			scores: {
				"Traceability & Transparency": 30,
				"Child Labor": 32.6,
				"Living Income": 10,
				"Deforestation": 30,
				"Agroforestry": 13.3,
				"Climate": 26.7,
				"Pollutants": 10,
				"Water": 20
			}
		},
		{
			name: "Hershey",
			scores: {
				"Traceability & Transparency": 25,
				"Child Labor": 26.1,
				"Living Income": 6.7,
				"Deforestation": 20,
				"Agroforestry": 6.7,
				"Climate": 20,
				"Pollutants": 10,
				"Water": 0
			}
		}
	];

	// Get status symbol based on score percentage
	function getStatus(score) {
		if (score >= 60) return "yes";
		if (score >= 40) return "maybe";
		return "no";
	}

	// Toggle sort by category
	function toggleSort(category) {
		if (sortBy === category) {
			// Toggle direction if same category
			if (sortDirection === 'desc') {
				sortDirection = 'asc';
			} else {
				// Reset to default if clicking again
				sortBy = null;
				sortDirection = 'desc';
			}
		} else {
			// New category, start with descending
			sortBy = category;
			sortDirection = 'desc';
		}
	}

	// Calculate overall score for default sorting
	function getOverallScore(company) {
		const total = categories.reduce((sum, cat) => sum + company.scores[cat], 0);
		return total / categories.length;
	}

	// Sort companies based on current sort state
	let sortedCompanies = $derived(
		[...companies].sort((a, b) => {
			let scoreA, scoreB;

			if (sortBy === null) {
				// Default: sort by overall score
				scoreA = getOverallScore(a);
				scoreB = getOverallScore(b);
			} else {
				// Sort by specific category
				scoreA = a.scores[sortBy];
				scoreB = b.scores[sortBy];
			}

			if (sortDirection === 'desc') {
				return scoreB - scoreA;
			} else {
				return scoreA - scoreB;
			}
		})
	);

	// Map parent company names to scorecard company names
	const parentToScorecard = {
		'Mars': 'Mars Wrigley',
		'Ferrero': 'Ferrero',
		'Mondelez': 'Mondelez',
		'Nestle': 'Nestle',
		'Hershey': 'Hershey',
		'Lindt & Spruengli': "Lindt & Sprungli",
		'Barry Callebaut': 'Barry Callebaut',
		'Cargill': 'Cargill',
		"Tony's": "Tony's Chocolonely"
	};

	// Get the matched company from scorecard based on selected chocolate
	let matchedCompanyName = $derived(
		selectedChocolate?.parent ? parentToScorecard[selectedChocolate.parent] : null
	);

	// Find the rank of the matched company in current sort order
	let matchedCompanyRank = $derived(
		matchedCompanyName
			? sortedCompanies.findIndex(c => c.name === matchedCompanyName) + 1
			: null
	);

	// Get ordinal suffix for rank (1st, 2nd, 3rd, etc.)
	function getOrdinal(n) {
		const s = ['th', 'st', 'nd', 'rd'];
		const v = n % 100;
		return n + (s[(v - 20) % 10] || s[v] || s[0]);
	}
</script>

<div class="commitment-section">
	<div class="commitment-header">
		<h2 class="commitment-title">Commitment to Ethical Practices</h2>
		<p class="commitment-description">
			The following table showcases whether leading confectionery companies have made commitments
			towards ethical and sustainable cocoa practices based on the <a href="https://www.chocolatescorecard.com" target="_blank" rel="noopener noreferrer">Chocolate Scorecard</a>.
		</p>
		<div class="legend">
			<div class="legend-item">
				<span class="symbol yes">&#10003;</span>
				<span class="legend-label">Good (60%+)</span>
			</div>
			<div class="legend-item">
				<span class="symbol maybe">&#9680;</span>
				<span class="legend-label">Fair (40-59%)</span>
			</div>
			<div class="legend-item">
				<span class="symbol no">&#10005;</span>
				<span class="legend-label">Poor (&lt;40%)</span>
			</div>
		</div>

		</div>

	<div class="table-wrapper">
		<table class="commitment-table">
			<thead>
				<tr>
					<th class="company-header">Confectionery<br/>Companies</th>
					{#each categories as category}
						<th
							class="category-header sortable"
							class:active={sortBy === category}
							onclick={() => toggleSort(category)}
						>
							<span class="header-text">{category}</span>
							<span class="sort-indicator">
								{#if sortBy === category}
									{#if sortDirection === 'desc'}
										&#9660;
									{:else}
										&#9650;
									{/if}
								{:else}
									&#8645;
								{/if}
							</span>
						</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each sortedCompanies as company, index (company.name)}
					<tr class:highlighted={company.name === matchedCompanyName}>
						<td class="company-name">
							<span class="rank">{index + 1}.</span>
							<span class="company-name-wrapper" class:has-tooltip={company.name === matchedCompanyName}>
								{company.name}
								{#if company.name === matchedCompanyName}
									<span class="your-pick-tooltip">Your pick</span>
								{/if}
							</span>
						</td>
						{#each categories as category}
							{@const status = getStatus(company.scores[category])}
							<td class="status-cell">
								{#if status === "yes"}
									<span class="symbol yes">&#10003;</span>
								{:else if status === "no"}
									<span class="symbol no">&#10005;</span>
								{:else}
									<span class="symbol maybe">&#9680;</span>
								{/if}
							</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	{#if matchedCompanyName && matchedCompanyRank}
		<div class="scrolly-card-container">
			<div class="scrolly-card">
				<p class="scrolly-card-text">
					{#if sortBy}
						{#if sortDirection === 'desc'}
							When ranked by <strong>best</strong> performance in <strong>{sortBy}</strong>, <strong>{matchedCompanyName}</strong>, the company that produced your favorite chocolate <strong>{selectedChocolate?.name}</strong>, placed <strong>{getOrdinal(matchedCompanyRank)}</strong> out of 9 companies.
						{:else}
							When ranked by <strong>worst</strong> performance in <strong>{sortBy}</strong>, <strong>{matchedCompanyName}</strong>, the company that produced your favorite chocolate <strong>{selectedChocolate?.name}</strong>, placed <strong>{getOrdinal(matchedCompanyRank)}</strong> out of 9 companies.
						{/if}
					{:else}
						Overall, <strong>{matchedCompanyName}</strong>, the company that produced your favorite chocolate <strong>{selectedChocolate?.name}</strong>, placed <strong>{getOrdinal(matchedCompanyRank)}</strong> out of 9 companies across all categories.
					{/if}
				</p>
			</div>
		</div>
	{/if}
</div>

<style>
	.commitment-section {
		width: 100%;
		padding: 4rem 2rem;
		background-color: #000000;
	}

	.commitment-header {
		max-width: 1200px;
		margin: 0 auto 2rem auto;
	}

	.commitment-title {
		font-family: 'Playfair Display', 'Times New Roman', serif;
		color: rgba(255, 248, 240, 0.96);
		font-size: clamp(1.8rem, 4vw, 2.5rem);
		margin: 0 0 1rem 0;
		line-height: 1.3;
	}

	.commitment-description {
		color: rgba(255, 248, 240, 0.75);
		font-family: 'Courier', 'Courier New', monospace;
		font-size: 0.9rem;
		line-height: 1.6;
		margin: 0 0 1.5rem 0;
		max-width: 600px;
	}

	.commitment-description a {
		color: rgba(225, 176, 88, 1);
		text-decoration: none;
	}

	.commitment-description a:hover {
		text-decoration: underline;
	}

	.scrolly-card-container {
		position: sticky;
		bottom: 2rem;
		display: flex;
		justify-content: center;
		padding: 0 2rem;
		margin-top: 2rem;
		z-index: 10;
		pointer-events: none;
	}

	.scrolly-card {
		background: #fffaf0;
		padding: 20px;
		width: 450px;
		max-width: 100%;
		pointer-events: auto;
	}

	.scrolly-card-text {
		color: #1a1a1a;
		font-family: "Courier New", Courier, monospace;
		font-style: normal;
		font-weight: 500;
		font-size: 14px;
		line-height: 1.7;
		margin: 0;
		letter-spacing: -0.01em;
	}

	.scrolly-card-text strong {
		color: tomato;
		font-weight: 800;
	}

	.legend {
		display: flex;
		gap: 2rem;
		flex-wrap: wrap;
		margin-bottom: 1rem;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.legend-label {
		color: rgba(255, 248, 240, 0.75);
		font-family: 'Courier', 'Courier New', monospace;
		font-size: 0.85rem;
	}

	.table-wrapper {
		max-width: 1200px;
		margin: 0 auto;
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
	}

	.commitment-table {
		width: 100%;
		border-collapse: collapse;
		border-spacing: 0;
		font-family: 'Courier', 'Courier New', monospace;
	}

	.commitment-table thead {
		border-bottom: 2px solid tomato;
	}

	.commitment-table th {
		color: rgba(255, 248, 240, 0.85);
		font-weight: normal;
		font-size: 0.75rem;
		text-align: center;
		padding: 1rem 1rem;
		vertical-align: bottom;
		line-height: 1.3;
	}

	.company-header {
		text-align: left !important;
		min-width: 160px;
		padding-left: 0 !important;
		padding-right: 1.5rem !important;
	}

	.category-header {
		min-width: 100px;
		max-width: 130px;
		padding: 1rem 0.75rem;
	}

	.category-header.sortable {
		cursor: pointer;
		transition: background-color 0.2s ease, color 0.2s ease;
		user-select: none;
	}

	.category-header.sortable:hover {
		background-color: rgba(255, 248, 240, 0.1);
		color: rgba(255, 248, 240, 1);
	}

	.category-header.sortable.active {
		background-color: rgba(225, 176, 88, 0.2);
		color: rgba(225, 176, 88, 1);
	}

	.header-text {
		display: block;
	}

	.sort-indicator {
		display: block;
		font-size: 0.7rem;
		margin-top: 0.25rem;
		opacity: 0.5;
		transition: opacity 0.2s ease;
	}

	.category-header.sortable:hover .sort-indicator,
	.category-header.sortable.active .sort-indicator {
		opacity: 1;
	}

	.commitment-table tbody tr {
		border-bottom: 1px solid rgba(255, 248, 240, 0.1);
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	.commitment-table tbody tr:last-child {
		border-bottom: none;
	}

	.commitment-table tbody tr:hover {
		background-color: rgba(255, 248, 240, 0.05);
	}

	.commitment-table tbody tr.highlighted {
		background-color: rgba(225, 176, 88, 0.15);
	}

	.commitment-table tbody tr.highlighted:hover {
		background-color: rgba(225, 176, 88, 0.25);
	}

	.commitment-table tbody tr:hover .company-name {
		padding-left: 0.75rem;
		font-weight: 600;
		color: rgba(255, 248, 240, 1);
	}

	.company-name-wrapper {
		position: relative;
		display: inline-block;
	}

	.your-pick-tooltip {
		position: absolute;
		bottom: 100%;
		left: 50%;
		transform: translateX(-50%);
		background: rgba(225, 176, 88, 0.95);
		color: #000000;
		font-size: 0.65rem;
		font-weight: 600;
		padding: 0.3rem 0.5rem;
		border-radius: 3px;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		white-space: nowrap;
		opacity: 0;
		visibility: hidden;
		transition: opacity 0.2s ease, visibility 0.2s ease;
		margin-bottom: 0.4rem;
		z-index: 20;
	}

	.your-pick-tooltip::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		border: 5px solid transparent;
		border-top-color: rgba(225, 176, 88, 0.95);
	}

	.company-name-wrapper.has-tooltip:hover .your-pick-tooltip {
		opacity: 1;
		visibility: visible;
	}

	.company-name {
		color: rgba(255, 248, 240, 0.9);
		font-size: 0.85rem;
		padding: 1rem 1.5rem 1rem 0.50rem;
		text-align: left;
		white-space: nowrap;
		transition: padding-left 0.2s ease, font-weight 0.2s ease, color 0.2s ease;
	}

	.rank {
		color: rgba(225, 176, 88, 0.8);
		margin-right: 0.25rem;
		font-weight: 600;
		display: inline-block;
		min-width: 1.2rem;
	}

	.status-cell {
		text-align: center;
		padding: 1rem 0.75rem;
	}

	.symbol {
		font-size: 1.1rem;
		font-weight: bold;
	}

	.symbol.yes {
		color: rgba(255, 248, 240, 0.9);
	}

	.symbol.no {
		color: tomato;
	}

	.symbol.maybe {
		color: #e1b058;
		font-weight: normal;
	}

	/* Responsive adjustments */
	@media (max-width: 900px) {
		.commitment-section {
			padding: 3rem 1rem;
		}

		.commitment-table th,
		.commitment-table td {
			padding: 0.75rem 0.5rem;
			font-size: 0.7rem;
		}

		.category-header {
			min-width: 70px;
			padding: 0.75rem 0.4rem;
		}

		.company-name {
			font-size: 0.75rem;
			padding-right: 1rem;
		}

		.symbol {
			font-size: 0.95rem;
		}
	}

	@media (max-width: 600px) {
		.legend {
			gap: 1rem;
		}

		.legend-label {
			font-size: 0.75rem;
		}

		.scrolly-card-container {
			padding: 0 1rem;
			bottom: 1rem;
		}

		.scrolly-card {
			padding: 15px;
		}

		.scrolly-card-text {
			font-size: 13px;
		}

		.commitment-table th {
			font-size: 0.65rem;
		}

		.category-header {
			min-width: 55px;
		}
	}
</style>
