<script lang="ts">
	import Intro from "$components/Intro.svelte";
	import CompanyReveal from "$components/CompanyReveal.svelte";
</script>

<svelte:boundary onerror={(e) => console.error(e)}>
	<Intro />
	<CompanyReveal />
</svelte:boundary>

<style>
	/* Styles moved to individual components */
</style>
