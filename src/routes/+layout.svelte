<script lang="ts">
	import '../app.css';
	import { SvelteTheme } from 'svelte-themes';
	import { components } from './components.js';

	let { children: CHILDREN } = $props();
</script>

<SvelteTheme enableSystem attribute="data-theme">
	{#snippet children(theme)}
		<div class="bg-bg">
			<header
				class="sticky top-0 z-10 border-b border-dashed border-border bg-bg/35 backdrop-blur-3xl"
			>
				<nav
					class="mx-auto flex max-w-[1300px] items-center justify-between border-r border-l border-dashed border-border px-4 py-2 text-lg text-fg-secondary"
				>
					<ul class="flex gap-6">
						<li>
							<a href="/">Home</a>
						</li>
						<li>
							<a href="https://github.com/beynar/svelte-bits">Github</a>
						</li>
					</ul>

					<button
						class="ml-4 rounded border border-border bg-bg/70 px-3 py-1 text-sm transition hover:bg-bg/90"
						onclick={() =>
							theme.theme == 'dark' ? (theme.theme = 'light') : (theme.theme = 'dark')}
						aria-label="Toggle light/dark mode"
					>
						{theme.theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
					</button>
				</nav>
			</header>

			<div class="mx-auto flex max-w-[1300px] border-r border-l border-dashed border-border">
				<aside class="sticky top-0 hidden w-64 md:block">
					<ul class="flex flex-col gap-2 px-2 py-4">
						{#each components as component}
							<li>
								<a
									href={`/backgrounds/${component.name.toLowerCase()}`}
									class="p-2 py-4 text-fg-secondary hover:underline">{component.name}</a
								>
							</li>
						{/each}
					</ul>
				</aside>
				<main
					class="mx-auto grid min-h-screen flex-1 gap-4 border-l border-dashed border-border px-4 py-2"
				>
					{@render CHILDREN()}
				</main>
			</div>
		</div>
	{/snippet}
</SvelteTheme>
