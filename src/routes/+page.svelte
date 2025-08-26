<script>
	import GradientBlinds from '$lib/backgrounds/GradientBlinds/GradientBlinds.svelte';

	let blindCount = $state(20);
</script>

<div
	style:width={'100%'}
	style:height={'50vh'}
	style:display={'block'}
	style:background-color={'black'}
>
	<GradientBlinds
		gradientColors={['#FF9FFC', '#5227FF']}
		{blindCount}
		blindMinWidth={1}
		noise={0.5}
	/>
</div>

<button on:click={() => blindCount++}>Add Blind {blindCount}</button>
<button on:click={() => blindCount--}>Remove Blind</button>
