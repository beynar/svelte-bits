<script lang="ts">
	// @ts-ignore
	import { Renderer, Program, Mesh, Color, Triangle } from 'ogl';

	interface AuroraProps {
		colorStops?: string[];
		amplitude?: number;
		blend?: number;
		time?: number;
		speed?: number;
		className?: string;
	}

	let {
		colorStops = ['#5227FF', '#7cff67', '#5227FF'],
		amplitude = 1.0,
		blend = 0.5,
		time,
		speed = 1.0,
		className = ''
	}: AuroraProps = $props();

	const vertexShader = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

	const fragmentShader = `#version 300 es
precision highp float;

uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;
uniform float uBlend;

out vec4 fragColor;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v){
  const vec4 C = vec4(
      0.211324865405187, 0.366025403784439,
      -0.577350269189626, 0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);

  vec3 p = permute(
      permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0)
  );

  vec3 m = max(
      0.5 - vec3(
          dot(x0, x0),
          dot(x12.xy, x12.xy),
          dot(x12.zw, x12.zw)
      ), 
      0.0
  );
  m = m * m;
  m = m * m;

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);

  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

struct ColorStop {
  vec3 color;
  float position;
};

#define COLOR_RAMP(colors, factor, finalColor) {              \
  int index = 0;                                            \
  for (int i = 0; i < 2; i++) {                               \
     ColorStop currentColor = colors[i];                    \
     bool isInBetween = currentColor.position <= factor;    \
     index = int(mix(float(index), float(i), float(isInBetween))); \
  }                                                         \
  ColorStop currentColor = colors[index];                   \
  ColorStop nextColor = colors[index + 1];                  \
  float range = nextColor.position - currentColor.position; \
  float lerpFactor = (factor - currentColor.position) / range; \
  finalColor = mix(currentColor.color, nextColor.color, lerpFactor); \
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  
  ColorStop colors[3];
  colors[0] = ColorStop(uColorStops[0], 0.0);
  colors[1] = ColorStop(uColorStops[1], 0.5);
  colors[2] = ColorStop(uColorStops[2], 1.0);
  
  vec3 rampColor;
  COLOR_RAMP(colors, uv.x, rampColor);
  
  float height = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * 0.5 * uAmplitude;
  height = exp(height);
  height = (uv.y * 2.0 - height + 0.2);
  float intensity = 0.6 * height;
  
  float midPoint = 0.20;
  float auroraAlpha = smoothstep(midPoint - uBlend * 0.5, midPoint + uBlend * 0.5, intensity);
  
  vec3 auroraColor = intensity * rampColor;
  
  fragColor = vec4(auroraColor * auroraAlpha, auroraAlpha);
}
`;

	// WebGL state variables
	let rendererRef: Renderer | null = null;
	let programRef: Program | null = null;
	let meshRef: Mesh<Triangle> | null = null;
	let geometryRef: Triangle | null = null;
	let rafRef: number | null = null;

	const createAurora = (containerElement: HTMLDivElement) => {
		let gl;
		let renderer = rendererRef;
		if (!rendererRef) {
			renderer = new Renderer({ alpha: true, premultipliedAlpha: true, antialias: true });
			rendererRef = renderer;
			gl = renderer.gl;
		} else {
			gl = rendererRef.gl;
			renderer = rendererRef;
		}

		// const renderer = new Renderer({
		// 	alpha: true,
		// 	premultipliedAlpha: true,
		// 	antialias: true
		// });
		// rendererRef = renderer;
		// const gl = renderer.gl;
		console.log('update');
		gl.clearColor(0, 0, 0, 0);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
		gl.canvas.style.backgroundColor = 'transparent';

		const resize = () => {
			if (!containerElement) return;
			const width = containerElement.offsetWidth;
			const height = containerElement.offsetHeight;
			renderer.setSize(width, height);
			if (programRef) {
				programRef.uniforms.uResolution.value = [width, height];
			}
		};

		window.addEventListener('resize', resize);

		const geometry = new Triangle(gl);
		geometryRef = geometry;
		// Remove uv attribute if it exists (as in original code)
		if (geometry.attributes.uv) {
			delete (geometry.attributes as any).uv;
		}

		const colorStopsArray = colorStops.map((hex) => {
			const c = new Color(hex);
			return [c.r, c.g, c.b];
		});

		const program = new Program(gl, {
			vertex: vertexShader,
			fragment: fragmentShader,
			uniforms: {
				uTime: { value: 0 },
				uAmplitude: { value: amplitude },
				uColorStops: { value: colorStopsArray },
				uResolution: { value: [containerElement.offsetWidth, containerElement.offsetHeight] },
				uBlend: { value: blend }
			}
		});
		programRef = program;

		const mesh = new Mesh(gl, { geometry, program });
		meshRef = mesh;
		containerElement.appendChild(gl.canvas);

		const update = (t: number) => {
			rafRef = requestAnimationFrame(update);
			const currentTime = time !== undefined ? time : t * 0.01;
			if (programRef) {
				programRef.uniforms.uTime.value = currentTime * speed * 0.1;

				// Update uniforms with current prop values for reactivity
				programRef.uniforms.uAmplitude.value = amplitude;
				programRef.uniforms.uBlend.value = blend;

				const currentColorStopsArray = colorStops.map((hex: string) => {
					const c = new Color(hex);
					return [c.r, c.g, c.b];
				});
				programRef.uniforms.uColorStops.value = currentColorStopsArray;

				renderer.render({ scene: mesh });
			}
		};

		rafRef = requestAnimationFrame(update);
		resize();

		return () => {
			if (rafRef) cancelAnimationFrame(rafRef);
			window.removeEventListener('resize', resize);
			if (containerElement && gl.canvas.parentNode === containerElement) {
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

<div {@attach createAurora} class="aurora-container {className}"></div>

<style>
	.aurora-container {
		width: 100%;
		height: 100%;
		display: block;
	}
</style>
