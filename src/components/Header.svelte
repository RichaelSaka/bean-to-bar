<script>
	const title = "Bean to Bar";
</script>

<header>
	<div class="wordmark" aria-label={title}>
		<span>{title}</span>
	</div>
</header>

<style>
	.wordmark {
		max-width: 14em;
		margin: 0 auto;
		padding: 32px 0;
		transform: rotate(-4deg);
	}

	.wordmark span {
		display: block;
		color: var(--color-fg);
		border: none;
	}
</style>
