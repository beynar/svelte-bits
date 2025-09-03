<script lang="ts">
	// @ts-ignore
	import { Renderer, Program, Mesh, Triangle } from 'ogl';

	interface PlasmaProps {
		color?: string;
		speed?: number;
		direction?: 'forward' | 'reverse' | 'pingpong';
		scale?: number;
		opacity?: number;
		mouseInteractive?: boolean;
		className?: string;
	}

	let {
		color = '#ffffff',
		speed = 1,
		direction = 'forward',
		scale = 1,
		opacity = 1,
		mouseInteractive = true,
		className = ''
	}: PlasmaProps = $props();

	const hexToRgb = (hex: string): [number, number, number] => {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		if (!result) return [1, 0.5, 0.2];
		return [
			parseInt(result[1], 16) / 255,
			parseInt(result[2], 16) / 255,
			parseInt(result[3], 16) / 255
		];
	};

	const vertexShader = `#version 300 es
precision highp float;
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

	const fragmentShader = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform vec3 uCustomColor;
uniform float uUseCustomColor;
uniform float uSpeed;
uniform float uDirection;
uniform float uScale;
uniform float uOpacity;
uniform vec2 uMouse;
uniform float uMouseInteractive;
out vec4 fragColor;

void mainImage(out vec4 o, vec2 C) {
  vec2 center = iResolution.xy * 0.5;
  C = (C - center) / uScale + center;
  
  vec2 mouseOffset = (uMouse - center) * 0.0002;
  C += mouseOffset * length(C - center) * step(0.5, uMouseInteractive);
  
  float i, d, z, T = iTime * uSpeed * uDirection;
  vec3 O, p, S;

  for (vec2 r = iResolution.xy, Q; ++i < 60.; O += o.w/d*o.xyz) {
    p = z*normalize(vec3(C-.5*r,r.y)); 
    p.z -= 4.; 
    S = p;
    d = p.y-T;
    
    p.x += .4*(1.+p.y)*sin(d + p.x*0.1)*cos(.34*d + p.x*0.05); 
    Q = p.xz *= mat2(cos(p.y+vec4(0,11,33,0)-T)); 
    z+= d = abs(sqrt(length(Q*Q)) - .25*(5.+S.y))/3.+8e-4; 
    o = 1.+sin(S.y+p.z*.5+S.z-length(S-p)+vec4(2,1,0,8));
  }
  
  o.xyz = tanh(O/1e4);
}

bool finite1(float x){ return !(isnan(x) || isinf(x)); }
vec3 sanitize(vec3 c){
  return vec3(
    finite1(c.r) ? c.r : 0.0,
    finite1(c.g) ? c.g : 0.0,
    finite1(c.b) ? c.b : 0.0
  );
}

void main() {
  vec4 o = vec4(0.0);
  mainImage(o, gl_FragCoord.xy);
  vec3 rgb = sanitize(o.rgb);
  
  float intensity = (rgb.r + rgb.g + rgb.b) / 3.0;
  vec3 customColor = intensity * uCustomColor;
  vec3 finalColor = mix(rgb, customColor, step(0.5, uUseCustomColor));
  
  float alpha = length(rgb) * uOpacity;
  fragColor = vec4(finalColor, alpha);
}`;

	// WebGL state variables
	let rendererRef: Renderer | null = null;
	let programRef: Program | null = null;
	let meshRef: Mesh<Triangle> | null = null;
	let geometryRef: Triangle | null = null;
	let rafRef: number | null = null;
	let resizeObserverRef: ResizeObserver | null = null;
	let mousePos = { x: 0, y: 0 };

	const createPlasma = (containerElement: HTMLDivElement) => {
		const useCustomColor = color ? 1.0 : 0.0;
		const customColorRgb = color ? hexToRgb(color) : [1, 1, 1];
		const directionMultiplier = direction === 'reverse' ? -1.0 : 1.0;

		const renderer = new Renderer({
			webgl: 2,
			alpha: true,
			antialias: false,
			dpr: Math.min(window.devicePixelRatio || 1, 2)
		});
		rendererRef = renderer;

		const gl = renderer.gl;
		const canvas = gl.canvas as HTMLCanvasElement;
		canvas.style.display = 'block';
		canvas.style.width = '100%';
		canvas.style.height = '100%';
		containerElement.appendChild(canvas);

		const geometry = new Triangle(gl);
		geometryRef = geometry;

		const program = new Program(gl, {
			vertex: vertexShader,
			fragment: fragmentShader,
			uniforms: {
				iTime: { value: 0 },
				iResolution: { value: new Float32Array([1, 1]) },
				uCustomColor: { value: new Float32Array(customColorRgb) },
				uUseCustomColor: { value: useCustomColor },
				uSpeed: { value: speed * 0.4 },
				uDirection: { value: directionMultiplier },
				uScale: { value: scale },
				uOpacity: { value: opacity },
				uMouse: { value: new Float32Array([0, 0]) },
				uMouseInteractive: { value: mouseInteractive ? 1.0 : 0.0 }
			}
		});
		programRef = program;

		const mesh = new Mesh(gl, { geometry, program });
		meshRef = mesh;

		const handleMouseMove = (e: MouseEvent) => {
			if (!mouseInteractive) return;
			const rect = containerElement.getBoundingClientRect();
			mousePos.x = e.clientX - rect.left;
			mousePos.y = e.clientY - rect.top;
			const mouseUniform = program.uniforms.uMouse.value as Float32Array;
			mouseUniform[0] = mousePos.x;
			mouseUniform[1] = mousePos.y;
		};

		if (mouseInteractive) {
			containerElement.addEventListener('mousemove', handleMouseMove);
		}

		const setSize = () => {
			const rect = containerElement.getBoundingClientRect();
			const width = Math.max(1, Math.floor(rect.width));
			const height = Math.max(1, Math.floor(rect.height));
			renderer.setSize(width, height);
			const res = program.uniforms.iResolution.value as Float32Array;
			res[0] = gl.drawingBufferWidth;
			res[1] = gl.drawingBufferHeight;
		};

		const ro = new ResizeObserver(setSize);
		resizeObserverRef = ro;
		ro.observe(containerElement);
		setSize();

		const t0 = performance.now();
		const loop = (t: number) => {
			let timeValue = (t - t0) * 0.001;

			// Update reactive props
			if (programRef) {
				// Update color
				const currentUseCustomColor = color ? 1.0 : 0.0;
				const currentCustomColorRgb = color ? hexToRgb(color) : [1, 1, 1];
				const colorArray = programRef.uniforms.uCustomColor.value as Float32Array;
				colorArray[0] = currentCustomColorRgb[0];
				colorArray[1] = currentCustomColorRgb[1];
				colorArray[2] = currentCustomColorRgb[2];
				programRef.uniforms.uUseCustomColor.value = currentUseCustomColor;

				// Update other uniforms
				programRef.uniforms.uSpeed.value = speed * 0.4;
				programRef.uniforms.uScale.value = scale;
				programRef.uniforms.uOpacity.value = opacity;
				programRef.uniforms.uMouseInteractive.value = mouseInteractive ? 1.0 : 0.0;

				// Handle direction changes
				if (direction === 'pingpong') {
					const cycle = Math.sin(timeValue * 0.5) * (direction === 'reverse' ? -1.0 : 1.0);
					programRef.uniforms.uDirection.value = cycle;
				} else {
					const currentDirectionMultiplier = direction === 'reverse' ? -1.0 : 1.0;
					programRef.uniforms.uDirection.value = currentDirectionMultiplier;
				}

				programRef.uniforms.iTime.value = timeValue;
				renderer.render({ scene: mesh });
			}
			rafRef = requestAnimationFrame(loop);
		};
		rafRef = requestAnimationFrame(loop);

		return () => {
			if (rafRef) cancelAnimationFrame(rafRef);
			if (resizeObserverRef) resizeObserverRef.disconnect();
			if (mouseInteractive && containerElement) {
				containerElement.removeEventListener('mousemove', handleMouseMove);
			}
			try {
				if (containerElement && canvas.parentNode === containerElement) {
					containerElement.removeChild(canvas);
				}
			} catch (e) {
				// Ignore cleanup errors
			}
			gl.getExtension('WEBGL_lose_context')?.loseContext();

			// Cleanup refs
			rendererRef = null;
			programRef = null;
			meshRef = null;
			geometryRef = null;
			rafRef = null;
			resizeObserverRef = null;
		};
	};
</script>

<div {@attach createPlasma} class="plasma-container {className}"></div>

<style>
	.plasma-container {
		width: 100%;
		height: 100%;
		display: block;
	}
</style>
