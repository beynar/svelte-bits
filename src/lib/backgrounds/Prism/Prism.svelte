<script lang="ts">
	import { Canvas, Program, Mesh, Triangle } from 'svogl';

	interface Props {
		height?: number;
		baseWidth?: number;
		animationType?: 'rotate' | 'hover' | '3drotate';
		glow?: number;
		offset?: { x?: number; y?: number };
		noise?: number;
		transparent?: boolean;
		scale?: number;
		hueShift?: number;
		colorFrequency?: number;
		hoverStrength?: number;
		inertia?: number;
		bloom?: number;
		suspendWhenOffscreen?: boolean;
		timeScale?: number;
		class: string;
	}

	let {
		height = 3.5,
		baseWidth = 5.5,
		animationType = 'rotate',
		glow = 1,
		offset = { x: 0, y: 0 },
		noise = 0.5,
		transparent = true,
		scale = 3.6,
		hueShift = 0,
		colorFrequency = 1,
		hoverStrength = 2,
		inertia = 0.05,
		bloom = 1,
		suspendWhenOffscreen = false,
		timeScale = 0.5,
		class: className = ''
	}: Props = $props();

	// Rotation matrix utilities
	const rotBuf = new Float32Array(9);
	function setMat3FromEuler(
		yawY: number,
		pitchX: number,
		rollZ: number,
		out: Float32Array
	): Float32Array {
		const cy = Math.cos(yawY),
			sy = Math.sin(yawY);
		const cx = Math.cos(pitchX),
			sx = Math.sin(pitchX);
		const cz = Math.cos(rollZ),
			sz = Math.sin(rollZ);

		const r00 = cy * cz + sy * sx * sz;
		const r01 = -cy * sz + sy * sx * cz;
		const r02 = sy * cx;

		const r10 = cx * sz;
		const r11 = cx * cz;
		const r12 = -sx;

		const r20 = -sy * cz + cy * sx * sz;
		const r21 = sy * sz + cy * sx * cz;
		const r22 = cy * cx;

		out[0] = r00;
		out[1] = r10;
		out[2] = r20;
		out[3] = r01;
		out[4] = r11;
		out[5] = r21;
		out[6] = r02;
		out[7] = r12;
		out[8] = r22;
		return out;
	}

	function lerp(a: number, b: number, t: number): number {
		return a + (b - a) * t;
	}

	// Animation state
	let yaw = 0,
		pitch = 0,
		roll = 0;
	let targetYaw = 0,
		targetPitch = 0;
	let pointer = { x: 0, y: 0, inside: false };

	// Animation control
	let canvasElement: HTMLCanvasElement | null = null;
	let intersectionObserver: IntersectionObserver | null = null;

	// Lifecycle management
	$effect(() => {
		if (suspendWhenOffscreen && canvasElement) {
			intersectionObserver = new IntersectionObserver((entries) => {
				const isVisible = entries.some((e) => e.isIntersecting);
				// svogl handles animation automatically, we just track visibility
			});
			intersectionObserver.observe(canvasElement);
		}

		return () => {
			if (intersectionObserver) {
				intersectionObserver.disconnect();
				intersectionObserver = null;
			}
		};
	});

	// 3D rotation parameters (matching React version)
	const wX = 0.3;
	const wY = 0.2;
	const wZ = 0.4;
	const phX = 1.2;
	const phZ = 0.8;

	const vertex = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

	const fragment = `
precision highp float;

uniform vec2  iResolution;
uniform float iTime;

uniform float uHeight;
uniform float uBaseHalf;
uniform mat3  uRot;
uniform int   uUseBaseWobble;
uniform float uGlow;
uniform vec2  uOffsetPx;
uniform float uNoise;
uniform float uSaturation;
uniform float uScale;
uniform float uHueShift;
uniform float uColorFreq;
uniform float uBloom;
uniform float uCenterShift;
uniform float uInvBaseHalf;
uniform float uInvHeight;
uniform float uMinAxis;
uniform float uPxScale;
uniform float uTimeScale;

vec4 tanh4(vec4 x){
  vec4 e2x = exp(2.0*x);
  return (e2x - 1.0) / (e2x + 1.0);
}

float rand(vec2 co){
  return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453123);
}

float sdOctaAnisoInv(vec3 p){
  vec3 q = vec3(abs(p.x) * uInvBaseHalf, abs(p.y) * uInvHeight, abs(p.z) * uInvBaseHalf);
  float m = q.x + q.y + q.z - 1.0;
  return m * uMinAxis * 0.5773502691896258;
}

float sdPyramidUpInv(vec3 p){
  float oct = sdOctaAnisoInv(p);
  float halfSpace = -p.y;
  return max(oct, halfSpace);
}

mat3 hueRotation(float a){
  float c = cos(a), s = sin(a);
  mat3 W = mat3(
    0.299, 0.587, 0.114,
    0.299, 0.587, 0.114,
    0.299, 0.587, 0.114
  );
  mat3 U = mat3(
     0.701, -0.587, -0.114,
    -0.299,  0.413, -0.114,
    -0.300, -0.588,  0.886
  );
  mat3 V = mat3(
     0.168, -0.331,  0.500,
     0.328,  0.035, -0.500,
    -0.497,  0.296,  0.201
  );
  return W + U * c + V * s;
}

void main(){
  vec2 f = (gl_FragCoord.xy - 0.5 * iResolution.xy - uOffsetPx) * uPxScale;

  float z = 5.0;
  float d = 0.0;

  vec3 p;
  vec4 o = vec4(0.0);

  float centerShift = uCenterShift;
  float cf = uColorFreq;

  mat2 wob = mat2(1.0);
  if (uUseBaseWobble == 1) {
    float t = iTime * uTimeScale;
    float c0 = cos(t + 0.0);
    float c1 = cos(t + 33.0);
    float c2 = cos(t + 11.0);
    wob = mat2(c0, c1, c2, c0);
  }

  const int STEPS = 100;
  for (int i = 0; i < STEPS; i++) {
    p = vec3(f, z);
    p.xz = p.xz * wob;
    p = uRot * p;
    vec3 q = p;
    q.y += centerShift;
    d = 0.1 + 0.2 * abs(sdPyramidUpInv(q));
    z -= d;
    o += (sin((p.y + z) * cf + vec4(0.0, 1.0, 2.0, 3.0)) + 1.0) / d;
  }

  o = tanh4(o * o * (uGlow * uBloom) / 1e5);

  vec3 col = o.rgb;
  float n = rand(gl_FragCoord.xy + vec2(iTime));
  col += (n - 0.5) * uNoise;
  col = clamp(col, 0.0, 1.0);

  float L = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = clamp(mix(vec3(L), col, uSaturation), 0.0, 1.0);

  if(abs(uHueShift) > 0.0001){
    col = clamp(hueRotation(uHueShift) * col, 0.0, 1.0);
  }

  gl_FragColor = vec4(col, o.a);
}
`;
</script>

<Canvas
	class={className}
	onMouseMove={({ e, rect, x, y }) => {
		if (animationType === 'hover') {
			// Use window coordinates like React version
			const ww = Math.max(1, window.innerWidth);
			const wh = Math.max(1, window.innerHeight);
			const cx = ww * 0.5;
			const cy = wh * 0.5;
			const nx = (e.clientX - cx) / (ww * 0.5);
			const ny = (e.clientY - cy) / (wh * 0.5);
			pointer.x = Math.max(-1, Math.min(1, nx));
			pointer.y = Math.max(-1, Math.min(1, ny));
			pointer.inside = true;
		}
	}}
	onMouseEnter={({ e, rect, x, y }) => {
		if (animationType === 'hover') {
			pointer.inside = true;
		}
	}}
	onMouseLeave={({ e, rect, x, y }) => {
		if (animationType === 'hover') {
			pointer.inside = false;
		}
	}}
>
	{#snippet children(ogl)}
		<Program
			{vertex}
			{fragment}
			uniforms={{
				iResolution: { value: [ogl.containerSize[0], ogl.containerSize[1]], noUpdate: true },
				iTime: { value: 0 },
				uHeight: { value: Math.max(0.001, height) },
				uBaseHalf: { value: Math.max(0.001, baseWidth) * 0.5 },
				uUseBaseWobble: { value: animationType === 'rotate' ? 1 : 0 },
				uRot: { value: new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]) },
				uGlow: { value: Math.max(0.0, glow) },
				uOffsetPx: {
					value: [
						(offset?.x ?? 0) * window.devicePixelRatio,
						(offset?.y ?? 0) * window.devicePixelRatio
					]
				},
				uNoise: { value: Math.max(0.0, noise) },
				uSaturation: { value: transparent ? 1.5 : 1 },
				uScale: { value: Math.max(0.001, scale) },
				uHueShift: { value: hueShift || 0 },
				uColorFreq: { value: Math.max(0.0, colorFrequency || 1) },
				uBloom: { value: Math.max(0.0, bloom || 1) },
				uCenterShift: { value: Math.max(0.001, height) * 0.25 },
				uInvBaseHalf: { value: 1 / (Math.max(0.001, baseWidth) * 0.5) },
				uInvHeight: { value: 1 / Math.max(0.001, height) },
				uMinAxis: { value: Math.min(Math.max(0.001, baseWidth) * 0.5, Math.max(0.001, height)) },
				uPxScale: { value: 1 / ((ogl.containerSize[1] || 1) * 0.1 * Math.max(0.001, scale)) },
				uTimeScale: { value: Math.max(0, timeScale || 1) }
			}}
			onResize={({ width, height: h }, program) => {
				program.program.uniforms.iResolution.value = [width, h];
				program.program.uniforms.uPxScale.value = 1 / ((h || 1) * 0.1 * Math.max(0.001, scale));
			}}
			onUpdate={({ time }, program) => {
				const currentTime = time * 0.001;
				program.program.uniforms.iTime.value = currentTime;

				// Update derived uniforms
				const H = Math.max(0.001, height);
				const BW = Math.max(0.001, baseWidth);
				const BASE_HALF = BW * 0.5;
				program.program.uniforms.uCenterShift.value = H * 0.25;
				program.program.uniforms.uInvBaseHalf.value = 1 / BASE_HALF;
				program.program.uniforms.uInvHeight.value = 1 / H;
				program.program.uniforms.uMinAxis.value = Math.min(BASE_HALF, H);

				// Animation control logic - determine if we should continue animating
				let continueAnimation = true;

				// Handle different animation types
				if (animationType === 'hover') {
					// Mouse-based rotation
					const HOVSTR = Math.max(0, hoverStrength || 1);
					const maxPitch = 0.6 * HOVSTR;
					const maxYaw = 0.6 * HOVSTR;
					targetYaw = (pointer.inside ? -pointer.x : 0) * maxYaw;
					targetPitch = (pointer.inside ? pointer.y : 0) * maxPitch;

					const INERT = Math.max(0, Math.min(1, inertia || 0.12));
					yaw = lerp(yaw, targetYaw, INERT);
					pitch = lerp(pitch, targetPitch, INERT);
					roll = lerp(roll, 0, 0.1);

					program.program.uniforms.uRot.value = setMat3FromEuler(yaw, pitch, roll, rotBuf);
					program.program.uniforms.uUseBaseWobble.value = 0;

					// Check if animation has settled
					const settled =
						Math.abs(yaw - targetYaw) < 1e-4 &&
						Math.abs(pitch - targetPitch) < 1e-4 &&
						Math.abs(roll) < 1e-4;
					if (settled) continueAnimation = false;
				} else if (animationType === '3drotate') {
					// Automatic 3D rotation
					const TS = Math.max(0, timeScale || 1);
					const tScaled = currentTime * TS;
					yaw = tScaled * wY;
					pitch = Math.sin(tScaled * wX + phX) * 0.6;
					roll = Math.sin(tScaled * wZ + phZ) * 0.5;

					program.program.uniforms.uRot.value = setMat3FromEuler(yaw, pitch, roll, rotBuf);
					program.program.uniforms.uUseBaseWobble.value = 0;

					if (TS < 1e-6) continueAnimation = false;
				} else {
					// Default rotation with base wobble
					rotBuf[0] = 1;
					rotBuf[1] = 0;
					rotBuf[2] = 0;
					rotBuf[3] = 0;
					rotBuf[4] = 1;
					rotBuf[5] = 0;
					rotBuf[6] = 0;
					rotBuf[7] = 0;
					rotBuf[8] = 1;
					program.program.uniforms.uRot.value = rotBuf;
					program.program.uniforms.uUseBaseWobble.value = 1;

					if (Math.max(0, timeScale || 1) < 1e-6) continueAnimation = false;
				}

				// Animation continues automatically with svogl
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
	{/snippet}
</Canvas>
