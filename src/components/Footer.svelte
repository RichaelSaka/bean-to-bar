<script>
	const currentYear = new Date().getFullYear();
</script>

<footer class="footer">
	<div class="footer-content">
		<div class="footer-brand">
			<span class="footer-title">Bean to Bar</span>
			<p class="footer-tagline">A data story about chocolate, farmers, and global trade.</p>
		</div>

		<div class="footer-links">
			<div class="footer-column">
				<h4>Data Sources</h4>
				<ul>
					<li><a href="https://www.fao.org/faostat/en/#data/QCL" target="_blank" rel="noopener noreferrer">FAOSTAT</a></li>
					<li><a href="https://www.globalforestwatch.org/dashboards/country/GHA/" target="_blank" rel="noopener noreferrer">Global Forest Watch</a></li>
					<li><a href="https://oec.world" target="_blank" rel="noopener noreferrer">OEC</a></li>
					<li><a href="https://www.chocolatescorecard.com" target="_blank" rel="noopener noreferrer">Chocolate Scorecard</a></li>
				</ul>
			</div>
			<div class="footer-column">
				<h4>Learn More</h4>
				<ul>
					<li><a href="https://www.fairtrade.net/product/cocoa" target="_blank" rel="noopener noreferrer">Fair Trade Cocoa</a></li>
					<li><a href="https://www.worldcocoafoundation.org" target="_blank" rel="noopener noreferrer">World Cocoa Foundation</a></li>
				</ul>
			</div>
		</div>
	</div>

	<div class="footer-bottom">
		<p class="copyright">&copy; {currentYear} Bean to Bar. Created with care for cocoa farmers everywhere.</p>
	</div>
</footer>

<style>
	.footer {
		background: linear-gradient(180deg, transparent 0%, rgba(10, 6, 4, 0.98) 20%);
		padding: 4rem 2rem 2rem;
		color: rgba(255, 248, 240, 0.8);
	}

	.footer-content {
		max-width: 1000px;
		margin: 0 auto;
		display: flex;
		flex-wrap: wrap;
		gap: 3rem;
		justify-content: space-between;
		padding-bottom: 2rem;
		border-bottom: 1px solid rgba(255, 224, 189, 0.15);
	}

	.footer-brand {
		flex: 1;
		min-width: 250px;
	}

	.footer-title {
		font-family: 'Playfair Display', 'Times New Roman', serif;
		font-size: 1.5rem;
		font-weight: 600;
		color: rgba(255, 248, 240, 0.95);
		display: block;
		margin-bottom: 0.5rem;
	}

	.footer-tagline {
		font-size: 0.9rem;
		color: rgba(255, 248, 240, 0.6);
		margin: 0;
		line-height: 1.5;
	}

	.footer-links {
		display: flex;
		flex-wrap: wrap;
		gap: 3rem;
	}

	.footer-column h4 {
		font-family: 'Playfair Display', 'Times New Roman', serif;
		font-size: 0.9rem;
		font-weight: 600;
		color: rgba(225, 176, 88, 0.9);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		margin: 0 0 1rem 0;
	}

	.footer-column ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.footer-column a {
		color: rgba(255, 248, 240, 0.7);
		text-decoration: none;
		font-size: 0.9rem;
		transition: color 0.2s ease;
	}

	.footer-column a:hover {
		color: rgba(225, 176, 88, 1);
	}

	.footer-bottom {
		max-width: 1000px;
		margin: 0 auto;
		padding-top: 1.5rem;
		text-align: center;
	}

	.copyright {
		font-size: 0.8rem;
		color: rgba(255, 248, 240, 0.5);
		margin: 0;
	}

	@media (max-width: 600px) {
		.footer {
			padding: 3rem 1.5rem 1.5rem;
		}

		.footer-content {
			flex-direction: column;
			gap: 2rem;
		}

		.footer-links {
			flex-direction: column;
			gap: 2rem;
		}
	}
</style>
