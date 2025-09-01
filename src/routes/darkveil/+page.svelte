<script lang="ts">
	import DarkVeil from '$lib/backgrounds/DarkVeil/DarkVeil.svelte';

	let hueShift = $state(0);
	let noiseIntensity = $state(0);
	let scanlineIntensity = $state(0);
	let speed = $state(0.5);
	let scanlineFrequency = $state(0);
	let warpAmount = $state(0);
	let resolutionScale = $state(1);
</script>

<svelte:head>
	<title>Dark Veil - Neural Network Art</title>
	<meta name="description" content="Generative neural network art with customizable effects" />
</svelte:head>

<main class="page-container">
	<div class="background">
		<DarkVeil
			{hueShift}
			{noiseIntensity}
			{scanlineIntensity}
			{speed}
			{scanlineFrequency}
			{warpAmount}
			{resolutionScale}
		/>
	</div>

	<div class="controls-overlay">
		<div class="controls">
			<h1>Dark Veil</h1>
			<p class="description">
				Neural network-generated art with customizable post-processing effects
			</p>

			<div class="control-group">
				<h3>Color & Visual</h3>
				<label>
					Hue Shift: {hueShift.toFixed(0)}°
					<input type="range" bind:value={hueShift} min="-180" max="180" step="1" />
				</label>

				<label>
					Animation Speed: {speed.toFixed(2)}x
					<input type="range" bind:value={speed} min="0" max="2" step="0.01" />
				</label>
			</div>

			<div class="control-group">
				<h3>Effects</h3>
				<label>
					Noise Intensity: {noiseIntensity.toFixed(3)}
					<input type="range" bind:value={noiseIntensity} min="0" max="0.2" step="0.001" />
				</label>

				<label>
					Scanline Intensity: {scanlineIntensity.toFixed(2)}
					<input type="range" bind:value={scanlineIntensity} min="0" max="1" step="0.01" />
				</label>

				<label>
					Scanline Frequency: {scanlineFrequency.toFixed(1)}
					<input type="range" bind:value={scanlineFrequency} min="0" max="0.5" step="0.001" />
				</label>

				<label>
					Warp Amount: {warpAmount.toFixed(2)}
					<input type="range" bind:value={warpAmount} min="0" max="2" step="0.01" />
				</label>
			</div>

			<div class="control-group">
				<h3>Performance</h3>
				<label>
					Resolution Scale: {resolutionScale.toFixed(1)}x
					<input type="range" bind:value={resolutionScale} min="0.25" max="2" step="0.25" />
				</label>
				<p class="hint">Lower resolution for better performance</p>
			</div>

			<div class="preset-buttons">
				<button
					onclick={() => {
						hueShift = 0;
						noiseIntensity = 0;
						scanlineIntensity = 0;
						speed = 0.5;
						scanlineFrequency = 0;
						warpAmount = 0;
						resolutionScale = 1;
					}}
				>
					Clean
				</button>

				<button
					onclick={() => {
						hueShift = 45;
						noiseIntensity = 0.02;
						scanlineIntensity = 0.1;
						speed = 0.8;
						scanlineFrequency = 0.05;
						warpAmount = 0.1;
					}}
				>
					Retro CRT
				</button>

				<button
					onclick={() => {
						hueShift = -90;
						noiseIntensity = 0.05;
						scanlineIntensity = 0.3;
						speed = 1.5;
						scanlineFrequency = 0.1;
						warpAmount = 0.5;
					}}
				>
					Glitch
				</button>

				<button
					onclick={() => {
						hueShift = 120;
						noiseIntensity = 0.01;
						scanlineIntensity = 0.05;
						speed = 0.3;
						scanlineFrequency = 0.02;
						warpAmount = 0.2;
					}}
				>
					Dreamy
				</button>

				<button
					onclick={() => {
						hueShift = 180;
						noiseIntensity = 0.08;
						scanlineIntensity = 0.5;
						speed = 2.0;
						scanlineFrequency = 0.2;
						warpAmount = 1.0;
					}}
				>
					Chaos
				</button>

				<button
					onclick={() => {
						hueShift = -45;
						noiseIntensity = 0.001;
						scanlineIntensity = 0.02;
						speed = 0.1;
						scanlineFrequency = 0.001;
						warpAmount = 0.05;
					}}
				>
					Subtle
				</button>
			</div>

			<div class="info">
				<h4>About Neural Art</h4>
				<p>
					This effect uses a Compositional Pattern Producing Network (CPPN) to generate organic,
					evolving patterns. The neural network creates unique visual structures that blend art and
					mathematics.
				</p>
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
		background: #000;
	}

	.background {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
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
		background: rgba(0, 0, 0, 0.85);
		backdrop-filter: blur(15px);
		padding: 20px;
		border-radius: 12px;
		border: 1px solid rgba(128, 0, 128, 0.3);
		max-width: 320px;
		max-height: 90vh;
		overflow-y: auto;
		pointer-events: all;
		box-shadow: 0 8px 32px rgba(128, 0, 128, 0.2);
	}

	h1 {
		color: #fff;
		margin: 0 0 10px 0;
		font-size: 1.6rem;
		font-weight: 600;
		background: linear-gradient(45deg, #8b5cf6, #a855f7, #c084fc);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		text-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
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
		border-bottom: 1px solid rgba(139, 92, 246, 0.3);
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
		accent-color: #8b5cf6;
	}

	.hint {
		color: #999;
		font-size: 0.8rem;
		margin: 5px 0 0 0;
		font-style: italic;
	}

	.preset-buttons {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
		margin-bottom: 20px;
	}

	button {
		background: linear-gradient(45deg, rgba(139, 92, 246, 0.1), rgba(168, 85, 247, 0.1));
		border: 1px solid rgba(139, 92, 246, 0.3);
		color: #8b5cf6;
		padding: 8px 12px;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.8rem;
		transition: all 0.3s ease;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	button:hover {
		background: linear-gradient(45deg, rgba(139, 92, 246, 0.2), rgba(168, 85, 247, 0.2));
		border-color: rgba(139, 92, 246, 0.6);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
	}

	.info {
		margin-top: 20px;
		padding: 15px;
		background: rgba(139, 92, 246, 0.05);
		border: 1px solid rgba(139, 92, 246, 0.2);
		border-radius: 8px;
	}

	.info h4 {
		color: #8b5cf6;
		margin: 0 0 8px 0;
		font-size: 0.9rem;
		font-weight: 600;
	}

	.info p {
		color: #ccc;
		margin: 0;
		font-size: 0.8rem;
		line-height: 1.4;
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
		background: rgba(139, 92, 246, 0.5);
		border-radius: 3px;
	}

	.controls::-webkit-scrollbar-thumb:hover {
		background: rgba(139, 92, 246, 0.7);
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.controls-overlay {
			padding: 10px;
		}

		.controls {
			max-width: 300px;
		}

		.preset-buttons {
			grid-template-columns: 1fr;
		}
	}
</style>
