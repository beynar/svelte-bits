<script lang="ts">
	// @ts-ignore
	import { Renderer, Camera, Geometry, Program, Mesh } from 'ogl';

	interface ParticlesProps {
		particleCount?: number;
		particleSpread?: number;
		speed?: number;
		particleColors?: string[];
		moveParticlesOnHover?: boolean;
		particleHoverFactor?: number;
		alphaParticles?: boolean;
		particleBaseSize?: number;
		sizeRandomness?: number;
		cameraDistance?: number;
		disableRotation?: boolean;
		className?: string;
	}

	let {
		particleCount = 200,
		particleSpread = 10,
		speed = 0.1,
		particleColors = ['#ffffff', '#ffffff', '#ffffff'],
		moveParticlesOnHover = true,
		particleHoverFactor = 1,
		alphaParticles = false,
		particleBaseSize = 100,
		sizeRandomness = 1,
		cameraDistance = 20,
		disableRotation = false,
		className = ''
	}: ParticlesProps = $props();

	const defaultColors: string[] = ['#ffffff', '#ffffff', '#ffffff'];

	const hexToRgb = (hex: string): [number, number, number] => {
		hex = hex.replace(/^#/, '');
		if (hex.length === 3) {
			hex = hex
				.split('')
				.map((c) => c + c)
				.join('');
		}
		const int = parseInt(hex, 16);
		const r = ((int >> 16) & 255) / 255;
		const g = ((int >> 8) & 255) / 255;
		const b = (int & 255) / 255;
		return [r, g, b];
	};

	const vertexShader = /* glsl */ `
  attribute vec3 position;
  attribute vec4 random;
  attribute vec3 color;
  
  uniform mat4 modelMatrix;
  uniform mat4 viewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uTime;
  uniform float uSpread;
  uniform float uBaseSize;
  uniform float uSizeRandomness;
  
  varying vec4 vRandom;
  varying vec3 vColor;
  
  void main() {
    vRandom = random;
    vColor = color;
    
    vec3 pos = position * uSpread;
    pos.z *= 10.0;
    
    vec4 mPos = modelMatrix * vec4(pos, 1.0);
    float t = uTime;
    mPos.x += sin(t * random.z + 6.28 * random.w) * mix(0.1, 1.5, random.x);
    mPos.y += sin(t * random.y + 6.28 * random.x) * mix(0.1, 1.5, random.w);
    mPos.z += sin(t * random.w + 6.28 * random.y) * mix(0.1, 1.5, random.z);
    
    vec4 mvPos = viewMatrix * mPos;
    gl_PointSize = (uBaseSize * (1.0 + uSizeRandomness * (random.x - 0.5))) / length(mvPos.xyz);
    gl_Position = projectionMatrix * mvPos;
  }
`;

	const fragmentShader = /* glsl */ `
  precision highp float;
  
  uniform float uTime;
  uniform float uAlphaParticles;
  varying vec4 vRandom;
  varying vec3 vColor;
  
  void main() {
    vec2 uv = gl_PointCoord.xy;
    float d = length(uv - vec2(0.5));
    
    if(uAlphaParticles < 0.5) {
      if(d > 0.5) {
        discard;
      }
      gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), 1.0);
    } else {
      float circle = smoothstep(0.5, 0.4, d) * 0.8;
      gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), circle);
    }
  }
`;

	// WebGL state variables
	let rendererRef: Renderer | null = null;
	let cameraRef: Camera | null = null;
	let programRef: Program | null = null;
	let meshRef: Mesh | null = null;
	let geometryRef: Geometry | null = null;
	let rafRef: number | null = null;
	let mouseRef = { x: 0, y: 0 };
	let lastTime = 0;
	let elapsed = 0;

	const createParticles = (containerElement: HTMLDivElement) => {
		const renderer = new Renderer({ depth: false, alpha: true });
		rendererRef = renderer;
		const gl = renderer.gl;
		containerElement.appendChild(gl.canvas);
		gl.clearColor(0, 0, 0, 0);

		const camera = new Camera(gl, { fov: 15 });
		cameraRef = camera;
		camera.position.set(0, 0, cameraDistance);

		const resize = () => {
			const width = containerElement.clientWidth;
			const height = containerElement.clientHeight;
			renderer.setSize(width, height);
			camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
		};
		window.addEventListener('resize', resize, false);
		resize();

		const handleMouseMove = (e: MouseEvent) => {
			const rect = containerElement.getBoundingClientRect();
			const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
			const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
			mouseRef = { x, y };
		};

		if (moveParticlesOnHover) {
			containerElement.addEventListener('mousemove', handleMouseMove);
		}

		const count = particleCount;
		const positions = new Float32Array(count * 3);
		const randoms = new Float32Array(count * 4);
		const colors = new Float32Array(count * 3);
		const palette = particleColors && particleColors.length > 0 ? particleColors : defaultColors;

		for (let i = 0; i < count; i++) {
			let x: number, y: number, z: number, len: number;
			do {
				x = Math.random() * 2 - 1;
				y = Math.random() * 2 - 1;
				z = Math.random() * 2 - 1;
				len = x * x + y * y + z * z;
			} while (len > 1 || len === 0);
			const r = Math.cbrt(Math.random());
			positions.set([x * r, y * r, z * r], i * 3);
			randoms.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
			const col = hexToRgb(palette[Math.floor(Math.random() * palette.length)]);
			colors.set(col, i * 3);
		}

		const geometry = new Geometry(gl, {
			position: { size: 3, data: positions },
			random: { size: 4, data: randoms },
			color: { size: 3, data: colors }
		});
		geometryRef = geometry;

		const program = new Program(gl, {
			vertex: vertexShader,
			fragment: fragmentShader,
			uniforms: {
				uTime: { value: 0 },
				uSpread: { value: particleSpread },
				uBaseSize: { value: particleBaseSize },
				uSizeRandomness: { value: sizeRandomness },
				uAlphaParticles: { value: alphaParticles ? 1 : 0 }
			},
			transparent: true,
			depthTest: false
		});
		programRef = program;

		const particles = new Mesh(gl, { mode: gl.POINTS, geometry, program });
		meshRef = particles;

		lastTime = performance.now();
		elapsed = 0;

		const update = (t: number) => {
			rafRef = requestAnimationFrame(update);
			const delta = t - lastTime;
			lastTime = t;
			elapsed += delta * speed;

			if (programRef) {
				// Update reactive uniforms
				programRef.uniforms.uTime.value = elapsed * 0.001;
				programRef.uniforms.uSpread.value = particleSpread;
				programRef.uniforms.uBaseSize.value = particleBaseSize;
				programRef.uniforms.uSizeRandomness.value = sizeRandomness;
				programRef.uniforms.uAlphaParticles.value = alphaParticles ? 1 : 0;
			}

			if (meshRef) {
				if (moveParticlesOnHover) {
					meshRef.position.x = -mouseRef.x * particleHoverFactor;
					meshRef.position.y = -mouseRef.y * particleHoverFactor;
				} else {
					meshRef.position.x = 0;
					meshRef.position.y = 0;
				}

				if (!disableRotation) {
					meshRef.rotation.x = Math.sin(elapsed * 0.0002) * 0.1;
					meshRef.rotation.y = Math.cos(elapsed * 0.0005) * 0.15;
					meshRef.rotation.z += 0.01 * speed;
				}
			}

			if (cameraRef) {
				cameraRef.position.z = cameraDistance;
			}

			renderer.render({ scene: particles, camera });
		};

		rafRef = requestAnimationFrame(update);

		return () => {
			window.removeEventListener('resize', resize);
			if (moveParticlesOnHover) {
				containerElement.removeEventListener('mousemove', handleMouseMove);
			}
			if (rafRef) cancelAnimationFrame(rafRef);
			if (containerElement.contains(gl.canvas)) {
				containerElement.removeChild(gl.canvas);
			}
			gl.getExtension('WEBGL_lose_context')?.loseContext();

			// Cleanup refs
			rendererRef = null;
			cameraRef = null;
			programRef = null;
			meshRef = null;
			geometryRef = null;
			rafRef = null;
		};
	};
</script>

<div {@attach createParticles} class="particles-container {className}"></div>

<style>
	.particles-container {
		width: 100%;
		height: 100%;
		display: block;
	}
</style>
