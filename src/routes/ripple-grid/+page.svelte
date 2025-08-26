<script lang="ts">
	import RippleGrid from '$lib/backgrounds/RippleGrid/RippleGrid.svelte';

	let enableRainbow = $state(false);
	let gridColor = $state('#00ffff');
	let rippleIntensity = $state(0.05);
	let gridSize = $state(10.0);
	let gridThickness = $state(15.0);
	let fadeDistance = $state(1.5);
	let vignetteStrength = $state(2.0);
	let glowIntensity = $state(0.1);
	let opacity = $state(1.0);
	let gridRotation = $state(0);
	let mouseInteraction = $state(true);
	let mouseInteractionRadius = $state(1);
</script>

<svelte:head>
	<title>Ripple Grid - Interactive WebGL Background</title>
	<meta name="description" content="Interactive ripple grid effect with WebGL shaders" />
</svelte:head>

<main class="page-container">
	<div class="background">
		<RippleGrid
			{enableRainbow}
			{gridColor}
			{rippleIntensity}
			{gridSize}
			{gridThickness}
			{fadeDistance}
			{vignetteStrength}
			{glowIntensity}
			{opacity}
			{gridRotation}
			{mouseInteraction}
			{mouseInteractionRadius}
		/>
	</div>

	<div class="controls-overlay">
		<div class="controls">
			<h1>Ripple Grid</h1>
			<p class="description">Interactive ripple grid effect with customizable parameters</p>

			<div class="control-group">
				<h3>Appearance</h3>
				<label>
					<input type="checkbox" bind:checked={enableRainbow} />
					Rainbow Mode
				</label>

				{#if !enableRainbow}
					<label>
						Grid Color
						<input type="color" bind:value={gridColor} />
					</label>
				{/if}

				<label>
					Opacity: {opacity.toFixed(2)}
					<input type="range" bind:value={opacity} min="0" max="1" step="0.01" />
				</label>
			</div>

			<div class="control-group">
				<h3>Grid Properties</h3>
				<label>
					Grid Size: {gridSize.toFixed(1)}
					<input type="range" bind:value={gridSize} min="1" max="20" step="0.1" />
				</label>

				<label>
					Grid Thickness: {gridThickness.toFixed(1)}
					<input type="range" bind:value={gridThickness} min="1" max="30" step="0.1" />
				</label>

				<label>
					Grid Rotation: {gridRotation}°
					<input type="range" bind:value={gridRotation} min="0" max="360" step="1" />
				</label>
			</div>

			<div class="control-group">
				<h3>Effects</h3>
				<label>
					Ripple Intensity: {rippleIntensity.toFixed(3)}
					<input type="range" bind:value={rippleIntensity} min="0" max="0.2" step="0.001" />
				</label>

				<label>
					Fade Distance: {fadeDistance.toFixed(1)}
					<input type="range" bind:value={fadeDistance} min="0.1" max="3" step="0.1" />
				</label>

				<label>
					Vignette Strength: {vignetteStrength.toFixed(1)}
					<input type="range" bind:value={vignetteStrength} min="0" max="5" step="0.1" />
				</label>

				<label>
					Glow Intensity: {glowIntensity.toFixed(2)}
					<input type="range" bind:value={glowIntensity} min="0" max="1" step="0.01" />
				</label>
			</div>

			<div class="control-group">
				<h3>Mouse Interaction</h3>
				<label>
					<input type="checkbox" bind:checked={mouseInteraction} />
					Enable Mouse Interaction
				</label>

				{#if mouseInteraction}
					<label>
						Interaction Radius: {mouseInteractionRadius.toFixed(1)}
						<input type="range" bind:value={mouseInteractionRadius} min="0.1" max="3" step="0.1" />
					</label>
				{/if}
			</div>

			<div class="preset-buttons">
				<button
					onclick={() => {
						enableRainbow = true;
						rippleIntensity = 0.08;
						gridSize = 8;
						glowIntensity = 0.3;
					}}
				>
					Rainbow Preset
				</button>

				<button
					onclick={() => {
						enableRainbow = false;
						gridColor = '#00ffff';
						rippleIntensity = 0.05;
						gridSize = 10;
						gridThickness = 15;
						glowIntensity = 0.1;
					}}
				>
					Default Preset
				</button>

				<button
					onclick={() => {
						enableRainbow = false;
						gridColor = '#ff00ff';
						rippleIntensity = 0.12;
						gridSize = 15;
						gridThickness = 8;
						glowIntensity = 0.5;
						vignetteStrength = 1;
					}}
				>
					Intense Preset
				</button>
			</div>
		</div>
	</div>
</main>

<style>
	.page-container {
		position: relative;
		width: 100vw;
		height: 100vh;
		overflow: hidden;
	}

	.background {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: #000;
	}

	.controls-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		display: flex;
		align-items: flex-start;
		justify-content: flex-end;
		padding: 20px;
		box-sizing: border-box;
	}

	.controls {
		background: rgba(0, 0, 0, 0.8);
		backdrop-filter: blur(10px);
		padding: 20px;
		border-radius: 10px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		max-width: 300px;
		max-height: 90vh;
		overflow-y: auto;
		pointer-events: all;
	}

	h1 {
		color: #fff;
		margin: 0 0 10px 0;
		font-size: 1.5rem;
		font-weight: 600;
	}

	.description {
		color: #ccc;
		margin: 0 0 20px 0;
		font-size: 0.9rem;
		line-height: 1.4;
	}

	.control-group {
		margin-bottom: 20px;
	}

	.control-group h3 {
		color: #fff;
		margin: 0 0 10px 0;
		font-size: 1rem;
		font-weight: 500;
		border-bottom: 1px solid rgba(255, 255, 255, 0.2);
		padding-bottom: 5px;
	}

	label {
		display: block;
		color: #fff;
		margin-bottom: 8px;
		font-size: 0.9rem;
		line-height: 1.4;
	}

	input[type='range'] {
		width: 100%;
		margin-top: 5px;
		accent-color: #00ffff;
	}

	input[type='color'] {
		width: 50px;
		height: 30px;
		border: none;
		border-radius: 5px;
		cursor: pointer;
		margin-left: 10px;
	}

	input[type='checkbox'] {
		margin-right: 8px;
		accent-color: #00ffff;
	}

	.preset-buttons {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-top: 20px;
	}

	button {
		background: rgba(0, 255, 255, 0.1);
		border: 1px solid rgba(0, 255, 255, 0.3);
		color: #00ffff;
		padding: 8px 12px;
		border-radius: 5px;
		cursor: pointer;
		font-size: 0.85rem;
		transition: all 0.2s ease;
	}

	button:hover {
		background: rgba(0, 255, 255, 0.2);
		border-color: rgba(0, 255, 255, 0.5);
	}

	/* Custom scrollbar for controls */
	.controls::-webkit-scrollbar {
		width: 6px;
	}

	.controls::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 3px;
	}

	.controls::-webkit-scrollbar-thumb {
		background: rgba(0, 255, 255, 0.5);
		border-radius: 3px;
	}

	.controls::-webkit-scrollbar-thumb:hover {
		background: rgba(0, 255, 255, 0.7);
	}
</style>
