<script lang="ts">
	import { Canvas, OglContext, Program, Mesh, Triangle } from 'svogl';

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

	let ogl = $state<OglContext | null>(null);
	let mousePos = $state([0.5, 0.5]);
	let smoothMousePos = $state([0.5, 0.5]);

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

	// Mouse interaction handler
	const handleMouseMove = ({ x, y }: { x: number; y: number }) => {
		if (followMouse) {
			mousePos = [x, y];
		}
	};

	const vertex = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

	const fragment = `precision highp float;

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
</script>

<Canvas
	bind:ogl
	onMouseMove={handleMouseMove}
	class="light-rays-container {className}"
	alpha={true}
	dpr={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1}
>
	<Program
		{vertex}
		{fragment}
		uniforms={{
			iTime: { value: 0 },
			iResolution: { value: [1, 1], noUpdate: true },
			rayPos: { value: [0, 0] },
			rayDir: { value: [0, 1] },
			raysColor: { value: ogl?.color.hexToArray(raysColor) },
			raysSpeed: { value: raysSpeed },
			lightSpread: { value: lightSpread },
			rayLength: { value: rayLength },
			pulsating: { value: pulsating ? 1.0 : 0.0 },
			fadeDistance: { value: fadeDistance },
			saturation: { value: saturation },
			mousePos: { value: smoothMousePos },
			mouseInfluence: { value: mouseInfluence },
			noiseAmount: { value: noiseAmount },
			distortion: { value: distortion }
		}}
		onResize={({ width, height }, program) => {
			const dpr = ogl?.gl ? Math.min(window.devicePixelRatio, 2) : 1;
			const w = width * dpr;
			const h = height * dpr;

			program.program.uniforms.iResolution.value = [w, h];

			const { anchor, dir } = getAnchorAndDir(raysOrigin, w, h);
			program.program.uniforms.rayPos.value = anchor;
			program.program.uniforms.rayDir.value = dir;
		}}
		onUpdate={({ time }, { program }) => {
			// Update time
			program.uniforms.iTime.value = time * 0.001;

			// Mouse smoothing like original
			if (followMouse && mouseInfluence > 0.0) {
				const smoothing = 0.92;
				smoothMousePos[0] = smoothMousePos[0] * smoothing + mousePos[0] * (1 - smoothing);
				smoothMousePos[1] = smoothMousePos[1] * smoothing + mousePos[1] * (1 - smoothing);
				program.uniforms.mousePos.value = smoothMousePos;
			}

			// Update ray position and direction based on origin
			if (ogl?.gl) {
				const dpr = Math.min(window.devicePixelRatio, 2);
				const w = ogl.gl.canvas.width;
				const h = ogl.gl.canvas.height;
				const { anchor, dir } = getAnchorAndDir(raysOrigin, w, h);
				program.uniforms.rayPos.value = anchor;
				program.uniforms.rayDir.value = dir;
			}
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
	.light-rays-container {
		width: 100%;
		height: 100%;
		display: block;
	}
</style>
