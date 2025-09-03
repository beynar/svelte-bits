<script lang="ts">
	import { Aurora } from '$lib/index.js';

	import Knob from '../../components/Knob.svelte';
	import { components } from '../components.js';

	let hueShift = $state(0);
	let noiseIntensity = $state(0);
	let scanlineIntensity = $state(0);
	let speed = $state(0.5);
	let scanlineFrequency = $state(0);
	let warpAmount = $state(0);
	let resolutionScale = $state(1);

	let inputs = $state(components.find((c) => c.name.toLowerCase() === 'aurora')?.inputs);

	let props = $derived(
		Object.entries(inputs).reduce((acc, [key, value]) => {
			acc[key] = value.value;
			return acc;
		}, {})
	);

	console.log({ props });
</script>

<svelte:head>
	<title>Dark Veil - Neural Network Art</title>
	<meta name="description" content="Generative neural network art with customizable effects" />
</svelte:head>

<!-- <div class="background h-[300px]">
	<DarkVeil {...props} />
</div> -->
<div class="mt-10 h-[300px] w-full max-w-full bg-pink-500 text-[100px] text-white"></div>
