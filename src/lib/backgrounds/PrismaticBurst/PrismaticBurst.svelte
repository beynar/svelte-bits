<script lang="ts">
	import { Canvas, Program, Mesh, Triangle, Texture } from 'svogl';

	type Offset = { x?: number | string; y?: number | string };
	type AnimationType = 'rotate' | 'rotate3d' | 'hover';

	interface Props {
		intensity?: number;
		speed?: number;
		animationType?: AnimationType;
		colors?: string[];
		distort?: number;
		paused?: boolean;
		offset?: Offset;
		hoverDampness?: number;
		rayCount?: number;
		mixBlendMode?: string;
		class?: string;
	}

	let {
		intensity = 2,
		speed = 0.5,
		animationType = 'rotate',
		colors,
		distort = 0,
		paused = false,
		offset = { x: 0, y: 0 },
		hoverDampness = 0,
		rayCount,
		mixBlendMode = 'lighten',
		class: className = ''
	}: Props = $props();

	// Utility functions
	const hexToRgb01 = (hex: string): [number, number, number] => {
		let h = hex.trim();
		if (h.startsWith('#')) h = h.slice(1);
		if (h.length === 3) {
			const r = h[0],
				g = h[1],
				b = h[2];
			h = r + r + g + g + b + b;
		}
		const intVal = parseInt(h, 16);
		if (isNaN(intVal) || (h.length !== 6 && h.length !== 8)) return [1, 1, 1];
		const r = ((intVal >> 16) & 255) / 255;
		const g = ((intVal >> 8) & 255) / 255;
		const b = (intVal & 255) / 255;
		return [r, g, b];
	};

	const toPx = (v: number | string | undefined): number => {
		if (v == null) return 0;
		if (typeof v === 'number') return v;
		const s = String(v).trim();
		const num = parseFloat(s.replace('px', ''));
		return isNaN(num) ? 0 : num;
	};

	// Animation state
	let mouseTarget = $state([0.5, 0.5]);
	let mouseSmooth = $state([0.5, 0.5]);
	let accumTime = $state(0);
	let lastTime = $state(0);

	// Animation type mapping
	const animTypeMap: Record<AnimationType, number> = {
		rotate: 0,
		rotate3d: 1,
		hover: 2
	};

	const vertex = `#version 300 es
  in vec2 position;
  in vec2 uv;
  out vec2 vUv;
  void main() {
	  vUv = uv;
	  gl_Position = vec4(position, 0.0, 1.0);
  }
  `;

	const fragment = `#version 300 es
  precision highp float;
  precision highp int;
  
  out vec4 fragColor;
  
  uniform vec2  uResolution;
  uniform float uTime;
  
  uniform float uIntensity;
  uniform float uSpeed;
  uniform int   uAnimType;
  uniform vec2  uMouse;
  uniform int   uColorCount;
  uniform float uDistort;
  uniform vec2  uOffset;
  uniform sampler2D uGradient;
  uniform float uNoiseAmount;
  uniform int   uRayCount;
  
  in vec2 vUv;
  
  float hash21(vec2 p){
	  p = floor(p);
	  float f = 52.9829189 * fract(dot(p, vec2(0.065, 0.005)));
	  return fract(f);
  }
  
  mat2 rot30(){ return mat2(0.8, -0.5, 0.5, 0.8); }
  
  float layeredNoise(vec2 fragPx){
	  vec2 p = mod(fragPx + vec2(uTime * 30.0, -uTime * 21.0), 1024.0);
	  vec2 q = rot30() * p;
	  float n = 0.0;
	  n += 0.40 * hash21(q);
	  n += 0.25 * hash21(q * 2.0 + 17.0);
	  n += 0.20 * hash21(q * 4.0 + 47.0);
	  n += 0.10 * hash21(q * 8.0 + 113.0);
	  n += 0.05 * hash21(q * 16.0 + 191.0);
	  return n;
  }
  
  vec3 rayDir(vec2 frag, vec2 res, vec2 offset, float dist){
	  float focal = res.y * max(dist, 1e-3);
	  return normalize(vec3(2.0 * (frag - offset) - res, focal));
  }
  
  float edgeFade(vec2 frag, vec2 res, vec2 offset){
	  vec2 toC = frag - 0.5 * res - offset;
	  float r = length(toC) / (0.5 * min(res.x, res.y));
	  float x = clamp(r, 0.0, 1.0);
	  float q = x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
	  float s = q * 0.5;
	  s = pow(s, 1.5);
	  float tail = 1.0 - pow(1.0 - s, 2.0);
	  s = mix(s, tail, 0.2);
	  float dn = (layeredNoise(frag * 0.15) - 0.5) * 0.0015 * s;
	  return clamp(s + dn, 0.0, 1.0);
  }
  
  mat3 rotX(float a){ float c = cos(a), s = sin(a); return mat3(1.0,0.0,0.0, 0.0,c,-s, 0.0,s,c); }
  mat3 rotY(float a){ float c = cos(a), s = sin(a); return mat3(c,0.0,s, 0.0,1.0,0.0, -s,0.0,c); }
  mat3 rotZ(float a){ float c = cos(a), s = sin(a); return mat3(c,-s,0.0, s,c,0.0, 0.0,0.0,1.0); }
  
  vec3 sampleGradient(float t){
	  t = clamp(t, 0.0, 1.0);
	  return texture(uGradient, vec2(t, 0.5)).rgb;
  }
  
  vec2 rot2(vec2 v, float a){
	  float s = sin(a), c = cos(a);
	  return mat2(c, -s, s, c) * v;
  }
  
  float bendAngle(vec3 q, float t){
	  float a = 0.8 * sin(q.x * 0.55 + t * 0.6)
			  + 0.7 * sin(q.y * 0.50 - t * 0.5)
			  + 0.6 * sin(q.z * 0.60 + t * 0.7);
	  return a;
  }
  
  void main(){
	  vec2 frag = gl_FragCoord.xy;
	  float t = uTime * uSpeed;
	  float jitterAmp = 0.1 * clamp(uNoiseAmount, 0.0, 1.0);
	  vec3 dir = rayDir(frag, uResolution, uOffset, 1.0);
	  float marchT = 0.0;
	  vec3 col = vec3(0.0);
	  float n = layeredNoise(frag);
	  vec4 c = cos(t * 0.2 + vec4(0.0, 33.0, 11.0, 0.0));
	  mat2 M2 = mat2(c.x, c.y, c.z, c.w);
	  float amp = clamp(uDistort, 0.0, 50.0) * 0.15;
  
	  mat3 rot3dMat = mat3(1.0);
	  if(uAnimType == 1){
		vec3 ang = vec3(t * 0.31, t * 0.21, t * 0.17);
		rot3dMat = rotZ(ang.z) * rotY(ang.y) * rotX(ang.x);
	  }
	  mat3 hoverMat = mat3(1.0);
	  if(uAnimType == 2){
		vec2 m = uMouse * 2.0 - 1.0;
		vec3 ang = vec3(m.y * 0.6, m.x * 0.6, 0.0);
		hoverMat = rotY(ang.y) * rotX(ang.x);
	  }
  
	  for (int i = 0; i < 44; ++i) {
		  vec3 P = marchT * dir;
		  P.z -= 2.0;
		  float rad = length(P);
		  vec3 Pl = P * (10.0 / max(rad, 1e-6));
  
		  if(uAnimType == 0){
			  Pl.xz *= M2;
		  } else if(uAnimType == 1){
		Pl = rot3dMat * Pl;
		  } else {
		Pl = hoverMat * Pl;
		  }
  
		  float stepLen = min(rad - 0.3, n * jitterAmp) + 0.1;
  
		  float grow = smoothstep(0.35, 3.0, marchT);
		  float a1 = amp * grow * bendAngle(Pl * 0.6, t);
		  float a2 = 0.5 * amp * grow * bendAngle(Pl.zyx * 0.5 + 3.1, t * 0.9);
		  vec3 Pb = Pl;
		  Pb.xz = rot2(Pb.xz, a1);
		  Pb.xy = rot2(Pb.xy, a2);
  
		  float rayPattern = smoothstep(
			  0.5, 0.7,
			  sin(Pb.x + cos(Pb.y) * cos(Pb.z)) *
			  sin(Pb.z + sin(Pb.y) * cos(Pb.x + t))
		  );
  
		  if (uRayCount > 0) {
			  float ang = atan(Pb.y, Pb.x);
			  float comb = 0.5 + 0.5 * cos(float(uRayCount) * ang);
			  comb = pow(comb, 3.0);
			  rayPattern *= smoothstep(0.15, 0.95, comb);
		  }
  
		  vec3 spectralDefault = 1.0 + vec3(
			  cos(marchT * 3.0 + 0.0),
			  cos(marchT * 3.0 + 1.0),
			  cos(marchT * 3.0 + 2.0)
		  );
  
		  float saw = fract(marchT * 0.25);
		  float tRay = saw * saw * (3.0 - 2.0 * saw);
		  vec3 userGradient = 2.0 * sampleGradient(tRay);
		  vec3 spectral = (uColorCount > 0) ? userGradient : spectralDefault;
		  vec3 base = (0.05 / (0.4 + stepLen))
					* smoothstep(5.0, 0.0, rad)
					* spectral;
  
		  col += base * rayPattern;
		  marchT += stepLen;
	  }
  
	  col *= edgeFade(frag, uResolution, uOffset);
	  col *= uIntensity;
  
	  fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
  }`;

	const gradientTextureValue = $derived.by(() => {
		if (!colors || colors.length === 0) {
			return {
				image: new Uint8Array([255, 255, 255, 255]),
				width: 1
			};
		}
		const capped = colors.slice(0, 64);
		const count = capped.length;
		const data = new Uint8Array(count * 4);

		for (let i = 0; i < count; i++) {
			const [r, g, b] = hexToRgb01(capped[i]);
			data[i * 4 + 0] = Math.round(r * 255);
			data[i * 4 + 1] = Math.round(g * 255);
			data[i * 4 + 2] = Math.round(b * 255);
			data[i * 4 + 3] = 255;
		}

		return {
			image: data,
			width: count
		};
	});
	// Computed values
	const offsetX = $derived(toPx(offset?.x));
	const offsetY = $derived(toPx(offset?.y));
	const colorCount = $derived(Array.isArray(colors) ? colors.length : 0);
	const rayCountValue = $derived(Math.max(0, Math.floor(rayCount ?? 0)));
</script>

<Canvas
	class={className}
	style={mixBlendMode && mixBlendMode !== 'none' ? `mix-blend-mode: ${mixBlendMode}` : ''}
	onMouseMove={({ e, rect, x, y }) => {
		mouseTarget = [Math.min(Math.max(x, 0), 1), Math.min(Math.max(y, 0), 1)];
	}}
>
	{#snippet children(ogl)}
		<Texture
			{...gradientTextureValue}
			width={1}
			height={1}
			generateMipmaps={false}
			flipY={false}
			minFilter={ogl.gl.LINEAR}
			magFilter={ogl.gl.LINEAR}
			wrapS={ogl.gl.CLAMP_TO_EDGE}
			wrapT={ogl.gl.CLAMP_TO_EDGE}
			{...colors && colors.length > 0
				? {
						format: ogl.gl.RGBA,
						type: ogl.gl.UNSIGNED_BYTE,
						needsUpdate: true
					}
				: {}}
		>
			{#snippet children(texture)}
				<Program
					{vertex}
					{fragment}
					uniforms={{
						uResolution: {
							value: [ogl.containerSize[0], ogl.containerSize[1]],
							noUpdate: true
						},
						uTime: { value: accumTime },
						uIntensity: { value: intensity },
						uSpeed: { value: speed },
						uAnimType: { value: animTypeMap[animationType] },
						uMouse: { value: mouseSmooth },
						uColorCount: { value: colorCount },
						uDistort: { value: distort },
						uOffset: { value: [offsetX, offsetY] },
						uGradient: { value: texture.texture },
						uNoiseAmount: { value: 0.8 },
						uRayCount: { value: rayCountValue }
					}}
					onResize={({ width, height }, program) => {
						program.program.uniforms.uResolution.value = [width, height];
					}}
					onUpdate={({ time }, program) => {
						const currentTime = time * 0.001;
						const dt = lastTime > 0 ? currentTime - lastTime : 0;
						lastTime = currentTime;

						if (!paused) {
							accumTime += dt;
						}

						// Update time uniform
						program.program.uniforms.uTime.value = accumTime;

						// Smooth mouse interpolation for hover mode
						if (animationType === 'hover') {
							const tau = 0.02 + Math.max(0, Math.min(1, hoverDampness)) * 0.5;
							const alpha = 1 - Math.exp(-dt / tau);
							mouseSmooth[0] += (mouseTarget[0] - mouseSmooth[0]) * alpha;
							mouseSmooth[1] += (mouseTarget[1] - mouseSmooth[1]) * alpha;
						}

						// Update mouse uniform
						program.program.uniforms.uMouse.value = mouseSmooth;
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
		</Texture>
	{/snippet}
</Canvas>
