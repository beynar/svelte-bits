<script>
	import Galaxy from '$lib/backgrounds/Galaxy/Galaxy.svelte';

	let density = $state(2);
	let hueShift = $state(0.5);
</script>

<div
	style:width={'100%'}
	style:height={'50vh'}
	style:display={'block'}
	style:background-color={'black'}
>
	<Galaxy
		{density}
		{hueShift}
		starSpeed={0.8}
		mouseRepulsion={true}
		transparent={true}
		saturation={0.8}
		glowIntensity={0.5}
	/>
</div>
<button on:click={() => density++}>Add Density {density}</button>
<button on:click={() => density--}>Remove Density</button>

<button on:click={() => hueShift++}>Add Hue Shift {hueShift}</button>
<button on:click={() => hueShift--}>Remove Hue Shift {hueShift}</button>
