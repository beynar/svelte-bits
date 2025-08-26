<script>
	import FaultyTerminal from '$lib/backgrounds/FaultyTerminal/FaultyTerminal.svelte';

	let scale = $state(1);
	let gridMul = $state([2, 1]);
	let digitSize = $state(1.5);
	let timeScale = $state(0.3);
	let pause = $state(false);
	let scanlineIntensity = $state(0.3);
	let glitchAmount = $state(1);
	let flickerAmount = $state(1);
	let noiseAmp = $state(1);
	let chromaticAberration = $state(0);
	let dither = $state(0);
	let curvature = $state(0.2);
	let tint = $state('#56d345');
	let mouseReact = $state(true);
	let mouseStrength = $state(0.2);
</script>

<div
	style:width={'100%'}
	style:height={'50vh'}
	style:display={'block'}
	style:background-color={'white'}
>
	<FaultyTerminal
		{scale}
		{digitSize}
		{timeScale}
		{pause}
		{scanlineIntensity}
		{glitchAmount}
		{flickerAmount}
		{noiseAmp}
		{chromaticAberration}
		{dither}
		{curvature}
		{tint}
		{mouseReact}
		{mouseStrength}
	/>
</div>
<div style="margin: 1em 0;">
	<label>
		Scale: {scale}
		<input type="range" min="0.5" max="4" step="0.01" bind:value={scale} />
	</label>
</div>
<div style="margin: 1em 0;">
	<label>
		Digit Size: {digitSize}
		<input type="range" min="0.5" max="4" step="0.01" bind:value={digitSize} />
	</label>
</div>
<div style="margin: 1em 0;">
	<label>
		Time Scale: {timeScale}
		<input type="range" min="0" max="2" step="0.01" bind:value={timeScale} />
	</label>
</div>
<div style="margin: 1em 0;">
	<label>
		Scanline Intensity: {scanlineIntensity}
		<input type="range" min="0" max="2" step="0.01" bind:value={scanlineIntensity} />
	</label>
</div>
<div style="margin: 1em 0;">
	<label>
		Glitch Amount: {glitchAmount}
		<input type="range" min="0" max="5" step="0.01" bind:value={glitchAmount} />
	</label>
</div>
<div style="margin: 1em 0;">
	<label>
		Flicker Amount: {flickerAmount}
		<input type="range" min="0" max="5" step="0.01" bind:value={flickerAmount} />
	</label>
</div>
<div style="margin: 1em 0;">
	<label>
		Noise Amp: {noiseAmp}
		<input type="range" min="0" max="5" step="0.01" bind:value={noiseAmp} />
	</label>
</div>
<div style="margin: 1em 0;">
	<label>
		Chromatic Aberration: {chromaticAberration}
		<input type="range" min="0" max="2" step="0.01" bind:value={chromaticAberration} />
	</label>
</div>
