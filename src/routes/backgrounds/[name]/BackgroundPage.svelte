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

	function copyPropsToClipboard() {
		const propsString = Object.entries(inputs)
			.map(([key, value]) => `${key}=${value.value}`)
			.join(' ');

		navigator.clipboard
			.writeText(propsString)
			.then(() => {
				console.log('Props copied to clipboard:', propsString);
			})
			.catch((err) => {
				console.error('Failed to copy props:', err);
			});
	}
</script>

<svelte:head>
	<title>{component.name} - Svelte Bits</title>
	<meta name="description" content={component.description} />
</svelte:head>

<div class="flex flex-col gap-6">
	<h1 class="text-2xl font-bold">{component.name}</h1>
	<!-- Installation Section -->
	<div class="bg-secondary rounded-xl border border-border bg-bg-secondary p-6">
		<div class="mb-4 flex items-center gap-3">
			<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
				<svg class="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					></path>
				</svg>
			</div>
			<div>
				<h2 class="text-lg font-semibold text-fg">Install with shadcn</h2>
			</div>
		</div>
		<div class="rounded-lg border border-border bg-bg p-4">
			<div class="flex items-center justify-between gap-3">
				<code class="flex-1 font-mono text-sm break-all text-fg">
					npx shadcn@latest add https://svelte-bits.beynar.workers.dev/backgrounds/{name?.toLowerCase()}.json
				</code>
				<button
					onclick={() => {
						if (!name) return;
						const command = `npx shadcn@latest add https://svelte-bits.beynar.workers.dev/backgrounds/${name.toLowerCase()}.json`;
						navigator.clipboard
							.writeText(command)
							.then(() => {
								console.log('Command copied to clipboard:', command);
							})
							.catch((err) => {
								console.error('Failed to copy command:', err);
							});
					}}
					class="transition-color rounded-lg bg-accent px-4 py-2 text-sm font-medium whitespace-nowrap text-white"
				>
					Copy
				</button>
			</div>
		</div>
	</div>

	<!-- Background Preview -->
	<div
		class="h-[500px] w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700"
	>
		<svelte:component this={component.Render} {...props} />
	</div>

	<!-- Controls Section -->
	<div class="controls-overlay">
		<div class="controls">
			<Knob bind:inputs presets={component.presets} />
			<button
				onclick={copyPropsToClipboard}
				class="mt-4 rounded-lg bg-accent px-4 py-2 text-white transition-colors"
			>
				Copy Props
			</button>
		</div>
	</div>
</div>
