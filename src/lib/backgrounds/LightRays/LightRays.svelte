<script lang="ts">
	// @ts-ignore
	import { Renderer, Program, Triangle, Mesh } from 'ogl';

	export type RaysOrigin =
		| 'top-center'
		| 'top-left'
		| 'top-right'
		| 'right'
		| 'left'
		| 'bottom-center'
		| 'bottom-right'
		| 'bottom-left';

	interface LightRaysProps {
		raysOrigin?: RaysOrigin;
		raysColor?: string;
		raysSpeed?: number;
		lightSpread?: number;
		rayLength?: number;
		pulsating?: boolean;
		fadeDistance?: number;
		saturation?: number;
		followMouse?: boolean;
		mouseInfluence?: number;
		noiseAmount?: number;
		distortion?: number;
		className?: string;
	}

	let {
		raysOrigin = 'top-center',
		raysColor = '#ffffff',
		raysSpeed = 1,
		lightSpread = 1,
		rayLength = 2,
		pulsating = false,
		fadeDistance = 1.0,
		saturation = 1.0,
		followMouse = true,
		mouseInfluence = 0.1,
		noiseAmount = 0.0,
		distortion = 0.0,
		className = ''
	}: LightRaysProps = $props();

	const hexToRgb = (hex: string): [number, number, number] => {
		const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return m
			? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255]
			: [1, 1, 1];
	};

	const getAnchorAndDir = (
		origin: RaysOrigin,
		w: number,
		h: number
	): { anchor: [number, number]; dir: [number, number] } => {
		const outside = 0.2;
		switch (origin) {
			case 'top-left':
				return { anchor: [0, -outside * h], dir: [0, 1] };
			case 'top-right':
				return { anchor: [w, -outside * h], dir: [0, 1] };
			case 'left':
				return { anchor: [-outside * w, 0.5 * h], dir: [1, 0] };
			case 'right':
				return { anchor: [(1 + outside) * w, 0.5 * h], dir: [-1, 0] };
			case 'bottom-left':
				return { anchor: [0, (1 + outside) * h], dir: [0, -1] };
			case 'bottom-center':
				return { anchor: [0.5 * w, (1 + outside) * h], dir: [0, -1] };
			case 'bottom-right':
				return { anchor: [w, (1 + outside) * h], dir: [0, -1] };
			default: // "top-center"
				return { anchor: [0.5 * w, -outside * h], dir: [0, 1] };
		}
	};

	const vertexShader = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

	const fragmentShader = `precision highp float;

uniform float iTime;
uniform vec2  iResolution;

uniform vec2  rayPos;
uniform vec2  rayDir;
uniform vec3  raysColor;
uniform float raysSpeed;
uniform float lightSpread;
uniform float rayLength;
uniform float pulsating;
uniform float fadeDistance;
uniform float saturation;
uniform vec2  mousePos;
uniform float mouseInfluence;
uniform float noiseAmount;
uniform float distortion;

varying vec2 vUv;

float noise(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord,
                  float seedA, float seedB, float speed) {
  vec2 sourceToCoord = coord - raySource;
  vec2 dirNorm = normalize(sourceToCoord);
  float cosAngle = dot(dirNorm, rayRefDirection);

  float distortedAngle = cosAngle + distortion * sin(iTime * 2.0 + length(sourceToCoord) * 0.01) * 0.2;
  
  float spreadFactor = pow(max(distortedAngle, 0.0), 1.0 / max(lightSpread, 0.001));

  float distance = length(sourceToCoord);
  float maxDistance = iResolution.x * rayLength;
  float lengthFalloff = clamp((maxDistance - distance) / maxDistance, 0.0, 1.0);
  
  float fadeFalloff = clamp((iResolution.x * fadeDistance - distance) / (iResolution.x * fadeDistance), 0.5, 1.0);
  float pulse = pulsating > 0.5 ? (0.8 + 0.2 * sin(iTime * speed * 3.0)) : 1.0;

  float baseStrength = clamp(
    (0.45 + 0.15 * sin(distortedAngle * seedA + iTime * speed)) +
    (0.3 + 0.2 * cos(-distortedAngle * seedB + iTime * speed)),
    0.0, 1.0
  );

  return baseStrength * lengthFalloff * fadeFalloff * spreadFactor * pulse;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);
  
  vec2 finalRayDir = rayDir;
  if (mouseInfluence > 0.0) {
    vec2 mouseScreenPos = mousePos * iResolution.xy;
    vec2 mouseDirection = normalize(mouseScreenPos - rayPos);
    finalRayDir = normalize(mix(rayDir, mouseDirection, mouseInfluence));
  }

  vec4 rays1 = vec4(1.0) *
               rayStrength(rayPos, finalRayDir, coord, 36.2214, 21.11349,
                           1.5 * raysSpeed);
  vec4 rays2 = vec4(1.0) *
               rayStrength(rayPos, finalRayDir, coord, 22.3991, 18.0234,
                           1.1 * raysSpeed);

  fragColor = rays1 * 0.5 + rays2 * 0.4;

  if (noiseAmount > 0.0) {
    float n = noise(coord * 0.01 + iTime * 0.1);
    fragColor.rgb *= (1.0 - noiseAmount + noiseAmount * n);
  }

  float brightness = 1.0 - (coord.y / iResolution.y);
  fragColor.x *= 0.1 + brightness * 0.8;
  fragColor.y *= 0.3 + brightness * 0.6;
  fragColor.z *= 0.5 + brightness * 0.5;

  if (saturation != 1.0) {
    float gray = dot(fragColor.rgb, vec3(0.299, 0.587, 0.114));
    fragColor.rgb = mix(vec3(gray), fragColor.rgb, saturation);
  }

  fragColor.rgb *= raysColor;
}

void main() {
  vec4 color;
  mainImage(color, gl_FragCoord.xy);
  gl_FragColor  = color;
}`;

	// WebGL state variables
	let rendererRef: Renderer | null = null;
	let programRef: Program | null = null;
	let meshRef: Mesh<Triangle> | null = null;
	let geometryRef: Triangle | null = null;
	let rafRef: number | null = null;
	let mouseRef = { x: 0.5, y: 0.5 };
	let smoothMouseRef = { x: 0.5, y: 0.5 };
	let isVisible = $state(false);

	const createLightRays = (containerElement: HTMLDivElement) => {
		// Set up intersection observer for performance
		const observer = new IntersectionObserver(
			(entries) => {
				isVisible = entries[0].isIntersecting;
			},
			{ threshold: 0.1 }
		);
		observer.observe(containerElement);

		// Only initialize WebGL when visible
		if (!isVisible) {
			// Wait for visibility
			const checkVisibility = () => {
				if (isVisible) {
					initWebGL();
				} else {
					requestAnimationFrame(checkVisibility);
				}
			};
			requestAnimationFrame(checkVisibility);
			return () => observer.disconnect();
		}

		function initWebGL() {
			const renderer = new Renderer({
				dpr: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1,
				alpha: true
			});
			rendererRef = renderer;

			const gl = renderer.gl;
			gl.canvas.style.width = '100%';
			gl.canvas.style.height = '100%';

			// Clear container and add canvas
			while (containerElement.firstChild) {
				containerElement.removeChild(containerElement.firstChild);
			}
			containerElement.appendChild(gl.canvas);

			const uniforms = {
				iTime: { value: 0 },
				iResolution: { value: [1, 1] },
				rayPos: { value: [0, 0] },
				rayDir: { value: [0, 1] },
				raysColor: { value: hexToRgb(raysColor) },
				raysSpeed: { value: raysSpeed },
				lightSpread: { value: lightSpread },
				rayLength: { value: rayLength },
				pulsating: { value: pulsating ? 1.0 : 0.0 },
				fadeDistance: { value: fadeDistance },
				saturation: { value: saturation },
				mousePos: { value: [0.5, 0.5] },
				mouseInfluence: { value: mouseInfluence },
				noiseAmount: { value: noiseAmount },
				distortion: { value: distortion }
			};

			const geometry = new Triangle(gl);
			geometryRef = geometry;
			const program = new Program(gl, {
				vertex: vertexShader,
				fragment: fragmentShader,
				uniforms
			});
			programRef = program;
			const mesh = new Mesh(gl, { geometry, program });
			meshRef = mesh;

			const updatePlacement = () => {
				if (!containerElement || !renderer) return;

				renderer.dpr = Math.min(window.devicePixelRatio, 2);

				const { clientWidth: wCSS, clientHeight: hCSS } = containerElement;
				renderer.setSize(wCSS, hCSS);

				const dpr = renderer.dpr;
				const w = wCSS * dpr;
				const h = hCSS * dpr;

				uniforms.iResolution.value = [w, h];

				const { anchor, dir } = getAnchorAndDir(raysOrigin, w, h);
				uniforms.rayPos.value = anchor;
				uniforms.rayDir.value = dir;
			};

			const handleMouseMove = (e: MouseEvent) => {
				if (!containerElement || !rendererRef) return;
				const rect = containerElement.getBoundingClientRect();
				const x = (e.clientX - rect.left) / rect.width;
				const y = (e.clientY - rect.top) / rect.height;
				mouseRef = { x, y };
			};

			const loop = (t: number) => {
				if (!rendererRef || !programRef || !meshRef) return;

				rafRef = requestAnimationFrame(loop);
				uniforms.iTime.value = t * 0.001;

				if (followMouse && mouseInfluence > 0.0) {
					const smoothing = 0.92;
					smoothMouseRef.x = smoothMouseRef.x * smoothing + mouseRef.x * (1 - smoothing);
					smoothMouseRef.y = smoothMouseRef.y * smoothing + mouseRef.y * (1 - smoothing);
					uniforms.mousePos.value = [smoothMouseRef.x, smoothMouseRef.y];
				}

				// Update uniforms with current prop values for reactivity
				uniforms.raysColor.value = hexToRgb(raysColor);
				uniforms.raysSpeed.value = raysSpeed;
				uniforms.lightSpread.value = lightSpread;
				uniforms.rayLength.value = rayLength;
				uniforms.pulsating.value = pulsating ? 1.0 : 0.0;
				uniforms.fadeDistance.value = fadeDistance;
				uniforms.saturation.value = saturation;
				uniforms.mouseInfluence.value = mouseInfluence;
				uniforms.noiseAmount.value = noiseAmount;
				uniforms.distortion.value = distortion;

				// Update ray position and direction based on origin
				const { clientWidth: wCSS, clientHeight: hCSS } = containerElement;
				const dpr = renderer.dpr;
				const { anchor, dir } = getAnchorAndDir(raysOrigin, wCSS * dpr, hCSS * dpr);
				uniforms.rayPos.value = anchor;
				uniforms.rayDir.value = dir;

				try {
					renderer.render({ scene: mesh });
				} catch (error) {
					console.warn('WebGL rendering error:', error);
					return;
				}
			};

			window.addEventListener('resize', updatePlacement);
			if (followMouse) {
				window.addEventListener('mousemove', handleMouseMove);
			}

			updatePlacement();
			rafRef = requestAnimationFrame(loop);

			return () => {
				if (rafRef) cancelAnimationFrame(rafRef);
				window.removeEventListener('resize', updatePlacement);
				if (followMouse) {
					window.removeEventListener('mousemove', handleMouseMove);
				}
			};
		}

		const cleanup = initWebGL();

		return () => {
			observer.disconnect();
			if (cleanup) cleanup();

			if (rendererRef) {
				try {
					const canvas = rendererRef.gl.canvas;
					const loseContextExt = rendererRef.gl.getExtension('WEBGL_lose_context');
					if (loseContextExt) {
						loseContextExt.loseContext();
					}
					if (canvas && canvas.parentNode) {
						canvas.parentNode.removeChild(canvas);
					}
				} catch (error) {
					console.warn('Error during WebGL cleanup:', error);
				}
			}

			// Cleanup refs
			rendererRef = null;
			programRef = null;
			meshRef = null;
			geometryRef = null;
			rafRef = null;
		};
	};
</script>

<div {@attach createLightRays} class="light-rays-container {className}"></div>

<style>
	.light-rays-container {
		width: 100%;
		height: 100%;
		display: block;
	}
</style>
