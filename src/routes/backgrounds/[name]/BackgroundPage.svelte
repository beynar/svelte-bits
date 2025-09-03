<script lang="ts">
	import { page } from '$app/state';
	import { useTheme } from 'svelte-themes';
	import Knob from '../../../components/Knob.svelte';
	import { components } from '../../components.js';

	let name = $derived(page.params.name);

	let component = $derived(components.find((c) => c.name.toLowerCase() === name))!;

	let inputs = $state(component.inputs);

	const theme = useTheme();

	let defaultProps = $derived.by(() => {
		console.log({ inputs });
		if (component.name === 'Aurora') {
			return {
				colorStops: [inputs.color1?.value, inputs.color2?.value, inputs.color3?.value]
			};
		}

		if (component.name === 'Particles') {
			return {
				particleColors:
					theme.theme === 'dark' ? ['#ffffff', '#ffffff', '#ffffff'] : ['#000', '#000', '#000']
			};
		}
		return {};
	});
	let props = $derived(
		Object.entries(inputs).reduce((acc, [key, value]) => {
			Object.defineProperty(acc, key, {
				get: () => value.value,
				set: (v) => {
					value.value = v;
				}
			});
			return acc;
		}, defaultProps)
	);
	console.log({ props });
</script>

<svelte:head>
	<title>{component.name} - Svelte Bits</title>
	<meta name="description" content={component.description} />
</svelte:head>

<div class="flex flex-col gap-10">
	<div class="h-[500px] w-full overflow-hidden rounded-lg">
		<svelte:component this={component.Render} {...props} />
	</div>

	<div class="controls-overlay">
		<div class="controls">
			<h1>{component.name}</h1>
			<Knob bind:inputs presets={component.presets} />
		</div>
	</div>
</div>
