<script>
	import GradientBlinds from '$lib/backgrounds/GradientBlinds/GradientBlinds.svelte';
	import FaultyTerminal from '$lib/backgrounds/FaultyTerminal/FaultyTerminal.svelte';
	import Galaxy from '$lib/backgrounds/Galaxy/Galaxy.svelte';
	import Aurora from '$lib/backgrounds/Aurora/Aurora.svelte';
	import Balatro from '$lib/backgrounds/Balatro/Balatro.svelte';
	import DarkVeil from '$lib/backgrounds/DarkVeil/DarkVeil.svelte';
	import GridMotion from '$lib/backgrounds/GridMotion/GridMotion.svelte';
	import Iridescence from '$lib/backgrounds/Iridescence/Iridescence.svelte';
	import LightRays from '$lib/backgrounds/LightRays/LightRays.svelte';
	import LiquidChrome from '$lib/backgrounds/LiquidChrome/LiquidChrome.svelte';
	import Orb from '$lib/backgrounds/Orb/Orb.svelte';
	import Particles from '$lib/backgrounds/Particles/Particles.svelte';
	import Plasma from '$lib/backgrounds/Plasma/Plasma.svelte';
	import RippleGrid from '$lib/backgrounds/RippleGrid/RippleGrid.svelte';
	import { useTheme } from 'svelte-themes';
	import { components } from './components.js';
	import { render } from 'svelte/server';

	const theme = useTheme();

	console.log(theme);
</script>

{#snippet card(Component, title)}
	<div class="flex flex-col gap-2 p-2">
		<h2 class="text-lg font-bold">{title}</h2>
		<div class="card border border-dashed border-border bg-bg-secondary p-1">
			<Component />
		</div>
	</div>
{/snippet}

{#each Object.entries(components) as [name, component]}
	{@render card(component.Render, component.name)}
{/each}

<style>
	.card {
		overflow: hidden;
		position: relative;
		border-radius: 0.5rem;
		box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
		display: block;
		width: 100%;
		max-width: 100%;
		margin: 2rem auto;
		height: 500px;
	}
</style>
