<script>
	import { page } from '$app/state';
	import BackgroundPage from './BackgroundPage.svelte';
</script>

{#key page.params.name}
	<BackgroundPage />
{/key}
