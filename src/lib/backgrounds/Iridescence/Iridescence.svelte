<script lang="ts">
	import Canvas from '$lib/ogl/Canvas.svelte';
	import Program from '$lib/ogl/Program.svelte';
	import Mesh from '$lib/ogl/Mesh.svelte';
	import Triangle from '$lib/ogl/Triangle.svelte';
	import type { OglContext } from '$lib/ogl/Canvas.svelte';

	interface IridescenceProps {
		color?: [number, number, number];
		speed?: number;
		amplitude?: number;
		mouseReact?: boolean;
		className?: string;
	}

	let {
		color = [1, 1, 1],
		speed = 1.0,
		amplitude = 0.1,
		mouseReact = true,
		className = ''
	}: IridescenceProps = $props();

	let ogl = $state<OglContext | null>(null);
	let mousePos = $state([0.5, 0.5]);

	// Mouse interaction handler
	const handleMouseMove = ({ x, y }: { x: number; y: number }) => {
		if (mouseReact) {
			mousePos = [x, 1.0 - y]; // Flip Y coordinate like original
		}
	};

	const vertex = `
attribute vec2 uv;
attribute vec2 position;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

	const fragment = `
precision highp float;

uniform float uTime;
uniform vec3 uColor;
uniform vec3 uResolution;
uniform vec2 uMouse;
uniform float uAmplitude;
uniform float uSpeed;

varying vec2 vUv;

void main() {
  float mr = min(uResolution.x, uResolution.y);
  vec2 uv = (vUv.xy * 2.0 - 1.0) * uResolution.xy / mr;

  uv += (uMouse - vec2(0.5)) * uAmplitude;

  float d = -uTime * 0.5 * uSpeed;
  float a = 0.0;
  for (float i = 0.0; i < 8.0; ++i) {
    a += cos(i - d - a * uv.x);
    d += sin(uv.y * i + a);
  }
  d += uTime * 0.5 * uSpeed;
  vec3 col = vec3(cos(uv * vec2(d, a)) * 0.6 + 0.4, cos(a + d) * 0.5 + 0.5);
  col = cos(col * cos(vec3(d, a, 2.5)) * 0.5 + 0.5) * uColor;
  gl_FragColor = vec4(col, 1.0);
}
`;
</script>

<Canvas
	bind:ogl
	onMouseMove={handleMouseMove}
	class="iridescence-container {className}"
	onMount={({ gl }) => {
		gl?.clearColor(1, 1, 1, 1);
	}}
>
	<Program
		{vertex}
		{fragment}
		uniforms={{
			uTime: { value: 0 },
			uColor: { value: color },
			uResolution: { value: [1, 1, 1] },
			uMouse: { value: new Float32Array([0.5, 0.5]) },
			uAmplitude: { value: amplitude },
			uSpeed: { value: speed }
		}}
		onResize={({ width, height }, program) => {
			program.program.uniforms.uResolution.value = [width, height, width / height];
		}}
		onUpdate={({ time }, { program }) => {
			// Update uniforms with current prop values for reactivity
			program.uniforms.uTime.value = time * 0.001;
			program.uniforms.uColor.value = color;
			program.uniforms.uMouse.value = mousePos;
			program.uniforms.uAmplitude.value = amplitude;
			program.uniforms.uSpeed.value = speed;
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

<style>
	.iridescence-container {
		width: 100%;
		height: 100%;
		display: block;
	}
</style>
