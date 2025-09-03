<script lang="ts">
	import Canvas from '$lib/ogl/Canvas.svelte';
	import Program from '$lib/ogl/Program.svelte';
	import Mesh from '$lib/ogl/Mesh.svelte';
	import Triangle from '$lib/ogl/Triangle.svelte';
	import type { OglContext } from '$lib/ogl/Canvas.svelte';

	interface GradientBlindsProps {
		className?: string;
		dpr?: number;
		paused?: boolean;
		gradientColors?: string[];
		angle?: number;
		noise?: number;
		blindCount?: number;
		blindMinWidth?: number;
		mouseDampening?: number;
		mirrorGradient?: boolean;
		spotlightRadius?: number;
		spotlightSoftness?: number;
		spotlightOpacity?: number;
		distortAmount?: number;
		shineDirection?: 'left' | 'right';
		mixBlendMode?: string;
	}

	let {
		className = '',
		dpr,
		paused = false,
		gradientColors,
		angle = 0,
		noise = 0.3,
		blindCount = 16,
		blindMinWidth = 60,
		mouseDampening = 0.15,
		mirrorGradient = false,
		spotlightRadius = 0.5,
		spotlightSoftness = 1,
		spotlightOpacity = 1,
		distortAmount = 0,
		shineDirection = 'left',
		mixBlendMode = 'darken'
	}: GradientBlindsProps = $props();

	const MAX_COLORS = 8;

	const hexToRGB = (hex: string): [number, number, number] => {
		const c = hex.replace('#', '').padEnd(6, '0');
		const r = parseInt(c.slice(0, 2), 16) / 255;
		const g = parseInt(c.slice(2, 4), 16) / 255;
		const b = parseInt(c.slice(4, 6), 16) / 255;
		return [r, g, b];
	};

	const prepStops = (stops?: string[]) => {
		const base = (stops && stops.length ? stops : ['#FF9FFC', '#5227FF']).slice(0, MAX_COLORS);
		if (base.length === 1) base.push(base[0]);
		while (base.length < MAX_COLORS) base.push(base[base.length - 1]);
		const arr: [number, number, number][] = [];
		for (let i = 0; i < MAX_COLORS; i++) arr.push(ogl?.color.hexToArray(base[i]) || [1, 0, 1]);
		const count = Math.max(2, Math.min(MAX_COLORS, stops?.length ?? 2));
		return { arr, count };
	};

	let ogl = $state<OglContext | null>(null);
	let mouseTarget = $state([0, 0]);
	let lastTime = 0;
	let firstResize = $state(true);

	// Derived values
	const colorData = $derived(prepStops(gradientColors));

	// Mouse interaction handler - convert normalized coords to canvas pixels like original
	const handleMouseMove = ({ x, y, rect }: { x: number; y: number; rect: DOMRect }) => {
		if (!ogl?.gl) return;
		const scale = dpr ?? (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
		// Convert normalized coordinates (0-1) to canvas pixel coordinates
		const canvasX = x * ogl.gl.canvas.width;
		const canvasY = y * ogl.gl.canvas.height; // Don't flip Y - Canvas already provides correct coordinates
		mouseTarget = [canvasX, canvasY];
	};
	const vertex = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

	const fragment = `
#ifdef GL_ES
precision mediump float;
#endif

uniform vec3  iResolution;
uniform vec2  iMouse;
uniform float iTime;

uniform float uAngle;
uniform float uNoise;
uniform float uBlindCount;
uniform float uSpotlightRadius;
uniform float uSpotlightSoftness;
uniform float uSpotlightOpacity;
uniform float uMirror;
uniform float uDistort;
uniform float uShineFlip;
uniform vec3  uColor0;
uniform vec3  uColor1;
uniform vec3  uColor2;
uniform vec3  uColor3;
uniform vec3  uColor4;
uniform vec3  uColor5;
uniform vec3  uColor6;
uniform vec3  uColor7;
uniform int   uColorCount;

varying vec2 vUv;

float rand(vec2 co){
  return fract(sin(dot(co, vec2(12.9898,78.233))) * 43758.5453);
}

vec2 rotate2D(vec2 p, float a){
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c) * p;
}

vec3 getGradientColor(float t){
  float tt = clamp(t, 0.0, 1.0);
  int count = uColorCount;
  if (count < 2) count = 2;
  float scaled = tt * float(count - 1);
  float seg = floor(scaled);
  float f = fract(scaled);

  if (seg < 1.0) return mix(uColor0, uColor1, f);
  if (seg < 2.0 && count > 2) return mix(uColor1, uColor2, f);
  if (seg < 3.0 && count > 3) return mix(uColor2, uColor3, f);
  if (seg < 4.0 && count > 4) return mix(uColor3, uColor4, f);
  if (seg < 5.0 && count > 5) return mix(uColor4, uColor5, f);
  if (seg < 6.0 && count > 6) return mix(uColor5, uColor6, f);
  if (seg < 7.0 && count > 7) return mix(uColor6, uColor7, f);
  if (count > 7) return uColor7;
  if (count > 6) return uColor6;
  if (count > 5) return uColor5;
  if (count > 4) return uColor4;
  if (count > 3) return uColor3;
  if (count > 2) return uColor2;
  return uColor1;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv0 = fragCoord.xy / iResolution.xy;

    float aspect = iResolution.x / iResolution.y;
    vec2 p = uv0 * 2.0 - 1.0;
    p.x *= aspect;
    vec2 pr = rotate2D(p, uAngle);
    pr.x /= aspect;
    vec2 uv = pr * 0.5 + 0.5;

    vec2 uvMod = uv;
    if (uDistort > 0.0) {
      float a = uvMod.y * 6.0;
      float b = uvMod.x * 6.0;
      float w = 0.01 * uDistort;
      uvMod.x += sin(a) * w;
      uvMod.y += cos(b) * w;
    }
    float t = uvMod.x;
    if (uMirror > 0.5) {
      t = 1.0 - abs(1.0 - 2.0 * fract(t));
    }
    vec3 base = getGradientColor(t);

    vec2 offset = vec2(iMouse.x/iResolution.x, iMouse.y/iResolution.y);
  float d = length(uv0 - offset);
  float r = max(uSpotlightRadius, 1e-4);
  float dn = d / r;
  float spot = (1.0 - 2.0 * pow(dn, uSpotlightSoftness)) * uSpotlightOpacity;
  vec3 cir = vec3(spot);
  float stripe = fract(uvMod.x * max(uBlindCount, 1.0));
  if (uShineFlip > 0.5) stripe = 1.0 - stripe;
    vec3 ran = vec3(stripe);

    vec3 col = cir + base - ran;
    col += (rand(gl_FragCoord.xy + iTime) - 0.5) * uNoise;

    fragColor = vec4(col, 1.0);
}

void main() {
    vec4 color;
    mainImage(color, vUv * iResolution.xy);
    gl_FragColor = color;
}
`;
</script>

<Canvas
	{dpr}
	alpha={true}
	antialias={true}
	bind:ogl
	onMouseMove={handleMouseMove}
	class={className}
>
	<!-- style:mix-blend-mode={mixBlendMode} -->
	<Program
		{vertex}
		{fragment}
		uniforms={{
			iTime: { value: 0 },
			iResolution: { value: [1, 1, 1] },
			iMouse: { value: [0, 0] },
			uAngle: { value: (angle * Math.PI) / 180 },
			uNoise: { value: noise },
			uBlindCount: { value: Math.max(1, blindCount) },
			uSpotlightRadius: { value: spotlightRadius },
			uSpotlightSoftness: { value: spotlightSoftness },
			uSpotlightOpacity: { value: spotlightOpacity },
			uMirror: { value: mirrorGradient ? 1.0 : 0.0 },
			uDistort: { value: distortAmount },
			uShineFlip: { value: shineDirection === 'right' ? 1.0 : 0.0 },
			uColor0: { value: colorData.arr[0] || [1, 0, 1] },
			uColor1: { value: colorData.arr[1] || [0.32, 0.15, 1] },
			uColor2: { value: colorData.arr[2] || [0.32, 0.15, 1] },
			uColor3: { value: colorData.arr[3] || [0.32, 0.15, 1] },
			uColor4: { value: colorData.arr[4] || [0.32, 0.15, 1] },
			uColor5: { value: colorData.arr[5] || [0.32, 0.15, 1] },
			uColor6: { value: colorData.arr[6] || [0.32, 0.15, 1] },
			uColor7: { value: colorData.arr[7] || [0.32, 0.15, 1] },
			uColorCount: { value: colorData.count }
		}}
		onResize={({ width, height }, program) => {
			// Exact copy of original resize logic
			program.program.uniforms.iResolution.value = [width, height, 1];

			if (blindMinWidth && blindMinWidth > 0) {
				const maxByMinWidth = Math.max(1, Math.floor(width / blindMinWidth));
				const effective = blindCount ? Math.min(blindCount, maxByMinWidth) : maxByMinWidth;
				program.program.uniforms.uBlindCount.value = Math.max(1, effective);
			} else {
				program.program.uniforms.uBlindCount.value = Math.max(1, blindCount);
			}

			if (firstResize) {
				firstResize = false;
				const cx = width / 2;
				const cy = height / 2;
				program.program.uniforms.iMouse.value = [cx, cy];
				mouseTarget = [cx, cy];
			}
		}}
		onUpdate={({ time }, { program }) => {
			if (paused) return;

			// Exact copy of original loop logic
			const elapsed = time * 0.001;
			program.uniforms.iTime.value = elapsed;

			if (mouseDampening > 0) {
				if (!lastTime) lastTime = time;
				const dt = (time - lastTime) / 1000;
				lastTime = time;
				const tau = Math.max(1e-4, mouseDampening);
				let factor = 1 - Math.exp(-dt / tau);
				if (factor > 1) factor = 1;
				const target = mouseTarget;
				const cur = program.uniforms.iMouse.value;
				cur[0] += (target[0] - cur[0]) * factor;
				cur[1] += (target[1] - cur[1]) * factor;
			} else {
				lastTime = time;
			}

			// Update reactive uniforms
			program.uniforms.uAngle.value = (angle * Math.PI) / 180;
			program.uniforms.uNoise.value = noise;
			program.uniforms.uSpotlightRadius.value = spotlightRadius;
			program.uniforms.uSpotlightSoftness.value = spotlightSoftness;
			program.uniforms.uSpotlightOpacity.value = spotlightOpacity;
			program.uniforms.uMirror.value = mirrorGradient ? 1.0 : 0.0;
			program.uniforms.uDistort.value = distortAmount;
			program.uniforms.uShineFlip.value = shineDirection === 'right' ? 1.0 : 0.0;

			// Update blindCount reactively (respecting blindMinWidth if set)
			if (blindMinWidth && blindMinWidth > 0 && ogl?.gl) {
				const maxByMinWidth = Math.max(1, Math.floor(ogl.gl.canvas.width / blindMinWidth));
				const effective = blindCount ? Math.min(blindCount, maxByMinWidth) : maxByMinWidth;
				program.uniforms.uBlindCount.value = Math.max(1, effective);
			} else {
				program.uniforms.uBlindCount.value = Math.max(1, blindCount);
			}

			program.uniforms.uColor0.value = colorData.arr[0];
			program.uniforms.uColor1.value = colorData.arr[1];
			program.uniforms.uColor2.value = colorData.arr[2];
			program.uniforms.uColor3.value = colorData.arr[3];
			program.uniforms.uColor4.value = colorData.arr[4];
			program.uniforms.uColor5.value = colorData.arr[5];
			program.uniforms.uColor6.value = colorData.arr[6];
			program.uniforms.uColor7.value = colorData.arr[7];
			program.uniforms.uColorCount.value = colorData.count;
		}}
	>
		<Triangle>
			<Mesh
				onUpdate={({ time }, mesh) => {
					mesh.ogl.renderer?.render({ scene: mesh.mesh });
				}}
			/>
		</Triangle>
	</Program>
</Canvas>
