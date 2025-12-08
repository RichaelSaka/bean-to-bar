<script lang="ts">
	import TitlePage from "$components/TitlePage.svelte";
	import Intro from "$components/Intro.svelte";
	import CompanyReveal from "$components/CompanyReveal.svelte";
</script>

<svelte:boundary onerror={(e) => console.error(e)}>
	<TitlePage />
	<Intro />
	<CompanyReveal />
</svelte:boundary>

<style>
	/* Styles moved to individual components */
</style>
