<script lang="ts">
	// @ts-ignore
	import { gsap } from 'gsap';
	import { onMount } from 'svelte';

	interface GridMotionProps {
		items?: string[];
		gradientColor?: string;
		className?: string;
	}

	let { items = [], gradientColor = 'black', className = '' }: GridMotionProps = $props();

	let gridRef: HTMLDivElement;
	let rowRefs: (HTMLDivElement | null)[] = [];
	let mouseX = $state(typeof window !== 'undefined' ? window.innerWidth / 2 : 0);

	const totalItems = 28;
	const defaultItems = Array.from({ length: totalItems }, (_, index) => `Item ${index + 1}`);
	const combinedItems = items.length > 0 ? items.slice(0, totalItems) : defaultItems;

	onMount(() => {
		gsap.ticker.lagSmoothing(0);

		const handleMouseMove = (e: MouseEvent): void => {
			mouseX = e.clientX;
		};

		const updateMotion = (): void => {
			const maxMoveAmount = 300;
			const baseDuration = 0.8;
			const inertiaFactors = [0.6, 0.4, 0.3, 0.2];

			rowRefs.forEach((row, index) => {
				if (row) {
					const direction = index % 2 === 0 ? 1 : -1;
					const moveAmount =
						((mouseX / window.innerWidth) * maxMoveAmount - maxMoveAmount / 2) * direction;

					gsap.to(row, {
						x: moveAmount,
						duration: baseDuration + inertiaFactors[index % inertiaFactors.length],
						ease: 'power3.out',
						overwrite: 'auto'
					});
				}
			});
		};

		const removeAnimationLoop = gsap.ticker.add(updateMotion);
		window.addEventListener('mousemove', handleMouseMove);

		return () => {
			window.removeEventListener('mousemove', handleMouseMove);
			removeAnimationLoop();
		};
	});
</script>

<div class="noscroll loading {className}" bind:this={gridRef}>
	<section
		class="intro"
		style="background: radial-gradient(circle, {gradientColor} 0%, transparent 100%)"
	>
		<div class="gridMotion-container">
			{#each Array.from({ length: 4 }) as _, rowIndex}
				<div class="row" bind:this={rowRefs[rowIndex]}>
					{#each Array.from({ length: 7 }) as _, itemIndex}
						{@const content = combinedItems[rowIndex * 7 + itemIndex]}
						<div class="row__item">
							<div class="row__item-inner" style="background-color: #111">
								{#if typeof content === 'string' && content.startsWith('http')}
									<div class="row__item-img" style="background-image: url({content})"></div>
								{:else}
									<div class="row__item-content">{content}</div>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{/each}
		</div>
		<div class="fullview"></div>
	</section>
</div>

<style>
	.noscroll {
		height: 100%;
		width: 100%;
		max-width: 100%;
		overflow: hidden;
	}

	.intro {
		width: 100%;
		height: 100vh;
		overflow: hidden;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.intro::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-size: 250px;
		pointer-events: none;
		z-index: 4;
	}

	.gridMotion-container {
		gap: 1rem;
		flex: none;
		position: absolute;
		top: -50vh;
		left: -50vw;
		width: 150vw;
		height: 150vh;
		display: grid;
		grid-template-rows: repeat(4, 1fr);
		grid-template-columns: 100%;
		transform: rotate(-15deg);
		transform-origin: center center;
		z-index: 2;
	}

	.row {
		display: grid;
		gap: 1rem;
		grid-template-columns: repeat(7, 1fr);
		will-change: transform, filter;
	}

	.row__item {
		position: relative;
	}

	.row__item-inner {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
		border-radius: 10px;
		background-color: #111;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 1.5rem;
	}

	.row__item-img {
		width: 100%;
		height: 100%;
		background-size: cover;
		background-position: 50% 50%;
		position: absolute;
		top: 0;
		left: 0;
	}

	.row__item-content {
		padding: 1rem;
		text-align: center;
		z-index: 1;
	}

	.fullview {
		position: relative;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
		pointer-events: none;
	}

	.fullview .row__item-inner {
		border-radius: 0px;
	}
</style>
