<script lang="ts">
	// @ts-ignore
	import { Renderer, Program, Mesh, Color, Triangle } from 'ogl';

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

	const vertexShader = `
attribute vec2 uv;
attribute vec2 position;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

	const fragmentShader = `
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

	// WebGL state variables
	let rendererRef: Renderer | null = null;
	let programRef: Program | null = null;
	let meshRef: Mesh<Triangle> | null = null;
	let geometryRef: Triangle | null = null;
	let rafRef: number | null = null;
	let mousePos = { x: 0.5, y: 0.5 };

	const createIridescence = (containerElement: HTMLDivElement) => {
		const renderer = new Renderer();
		rendererRef = renderer;
		const gl = renderer.gl;
		gl.clearColor(1, 1, 1, 1);

		const resize = () => {
			const scale = 1;
			renderer.setSize(containerElement.offsetWidth * scale, containerElement.offsetHeight * scale);
			if (programRef) {
				programRef.uniforms.uResolution.value = new Color(
					gl.canvas.width,
					gl.canvas.height,
					gl.canvas.width / gl.canvas.height
				);
			}
		};

		window.addEventListener('resize', resize, false);
		resize();

		const geometry = new Triangle(gl);
		geometryRef = geometry;

		const program = new Program(gl, {
			vertex: vertexShader,
			fragment: fragmentShader,
			uniforms: {
				uTime: { value: 0 },
				uColor: { value: new Color(...color) },
				uResolution: {
					value: new Color(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height)
				},
				uMouse: { value: new Float32Array([mousePos.x, mousePos.y]) },
				uAmplitude: { value: amplitude },
				uSpeed: { value: speed }
			}
		});
		programRef = program;

		const mesh = new Mesh(gl, { geometry, program });
		meshRef = mesh;

		const update = (t: number) => {
			rafRef = requestAnimationFrame(update);
			program.uniforms.uTime.value = t * 0.001;

			// Update uniforms with current prop values for reactivity
			program.uniforms.uColor.value = new Color(...color);
			program.uniforms.uAmplitude.value = amplitude;
			program.uniforms.uSpeed.value = speed;
			program.uniforms.uMouse.value[0] = mousePos.x;
			program.uniforms.uMouse.value[1] = mousePos.y;

			renderer.render({ scene: mesh });
		};

		const handleMouseMove = (e: MouseEvent) => {
			const rect = containerElement.getBoundingClientRect();
			const x = (e.clientX - rect.left) / rect.width;
			const y = 1.0 - (e.clientY - rect.top) / rect.height;
			mousePos = { x, y };
		};

		rafRef = requestAnimationFrame(update);
		containerElement.appendChild(gl.canvas);

		if (mouseReact) {
			containerElement.addEventListener('mousemove', handleMouseMove);
		}

		return () => {
			if (rafRef) cancelAnimationFrame(rafRef);
			window.removeEventListener('resize', resize);
			if (mouseReact) {
				containerElement.removeEventListener('mousemove', handleMouseMove);
			}
			if (gl.canvas.parentElement === containerElement) {
				containerElement.removeChild(gl.canvas);
			}
			gl.getExtension('WEBGL_lose_context')?.loseContext();

			// Cleanup refs
			rendererRef = null;
			programRef = null;
			meshRef = null;
			geometryRef = null;
			rafRef = null;
		};
	};
</script>

<div {@attach createIridescence} class="iridescence-container {className}"></div>

<style>
	.iridescence-container {
		width: 100%;
		height: 100%;
		display: block;
	}
</style>
