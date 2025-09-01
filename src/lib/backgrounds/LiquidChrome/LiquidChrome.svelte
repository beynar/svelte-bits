<script lang="ts">
	// @ts-ignore
	import { Renderer, Program, Mesh, Triangle } from 'ogl';

	interface LiquidChromeProps {
		baseColor?: [number, number, number];
		speed?: number;
		amplitude?: number;
		frequencyX?: number;
		frequencyY?: number;
		interactive?: boolean;
		className?: string;
	}

	let {
		baseColor = [0.1, 0.1, 0.1],
		speed = 0.2,
		amplitude = 0.5,
		frequencyX = 3,
		frequencyY = 2,
		interactive = true,
		className = ''
	}: LiquidChromeProps = $props();

	const vertexShader = `
      attribute vec2 position;
      attribute vec2 uv;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

	const fragmentShader = `
      precision highp float;
      uniform float uTime;
      uniform vec3 uResolution;
      uniform vec3 uBaseColor;
      uniform float uAmplitude;
      uniform float uFrequencyX;
      uniform float uFrequencyY;
      uniform vec2 uMouse;
      varying vec2 vUv;

      vec4 renderImage(vec2 uvCoord) {
          vec2 fragCoord = uvCoord * uResolution.xy;
          vec2 uv = (2.0 * fragCoord - uResolution.xy) / min(uResolution.x, uResolution.y);

          for (float i = 1.0; i < 10.0; i++){
              uv.x += uAmplitude / i * cos(i * uFrequencyX * uv.y + uTime + uMouse.x * 3.14159);
              uv.y += uAmplitude / i * cos(i * uFrequencyY * uv.x + uTime + uMouse.y * 3.14159);
          }

          vec2 diff = (uvCoord - uMouse);
          float dist = length(diff);
          float falloff = exp(-dist * 20.0);
          float ripple = sin(10.0 * dist - uTime * 2.0) * 0.03;
          uv += (diff / (dist + 0.0001)) * ripple * falloff;

          vec3 color = uBaseColor / abs(sin(uTime - uv.y - uv.x));
          return vec4(color, 1.0);
      }

      void main() {
          vec4 col = vec4(0.0);
          int samples = 0;
          for (int i = -1; i <= 1; i++){
              for (int j = -1; j <= 1; j++){
                  vec2 offset = vec2(float(i), float(j)) * (1.0 / min(uResolution.x, uResolution.y));
                  col += renderImage(vUv + offset);
                  samples++;
              }
          }
          gl_FragColor = col / float(samples);
      }
    `;

	// WebGL state variables
	let rendererRef: Renderer | null = null;
	let programRef: Program | null = null;
	let meshRef: Mesh<Triangle> | null = null;
	let geometryRef: Triangle | null = null;
	let rafRef: number | null = null;

	const createLiquidChrome = (containerElement: HTMLDivElement) => {
		const renderer = new Renderer({ antialias: true });
		rendererRef = renderer;
		const gl = renderer.gl;
		gl.clearColor(1, 1, 1, 1);

		const geometry = new Triangle(gl);
		geometryRef = geometry;

		const program = new Program(gl, {
			vertex: vertexShader,
			fragment: fragmentShader,
			uniforms: {
				uTime: { value: 0 },
				uResolution: {
					value: new Float32Array([
						gl.canvas.width,
						gl.canvas.height,
						gl.canvas.width / gl.canvas.height
					])
				},
				uBaseColor: { value: new Float32Array(baseColor) },
				uAmplitude: { value: amplitude },
				uFrequencyX: { value: frequencyX },
				uFrequencyY: { value: frequencyY },
				uMouse: { value: new Float32Array([0, 0]) }
			}
		});
		programRef = program;

		const mesh = new Mesh(gl, { geometry, program });
		meshRef = mesh;

		const resize = () => {
			const scale = 1;
			renderer.setSize(containerElement.offsetWidth * scale, containerElement.offsetHeight * scale);
			const resUniform = program.uniforms.uResolution.value as Float32Array;
			resUniform[0] = gl.canvas.width;
			resUniform[1] = gl.canvas.height;
			resUniform[2] = gl.canvas.width / gl.canvas.height;
		};
		window.addEventListener('resize', resize);
		resize();

		const handleMouseMove = (event: MouseEvent) => {
			if (!interactive || !programRef) return;
			const rect = containerElement.getBoundingClientRect();
			const x = (event.clientX - rect.left) / rect.width;
			const y = 1 - (event.clientY - rect.top) / rect.height;
			const mouseUniform = programRef.uniforms.uMouse.value as Float32Array;
			mouseUniform[0] = x;
			mouseUniform[1] = y;
		};

		const handleTouchMove = (event: TouchEvent) => {
			if (!interactive || !programRef) return;
			if (event.touches.length > 0) {
				const touch = event.touches[0];
				const rect = containerElement.getBoundingClientRect();
				const x = (touch.clientX - rect.left) / rect.width;
				const y = 1 - (touch.clientY - rect.top) / rect.height;
				const mouseUniform = programRef.uniforms.uMouse.value as Float32Array;
				mouseUniform[0] = x;
				mouseUniform[1] = y;
			}
		};

		if (interactive) {
			containerElement.addEventListener('mousemove', handleMouseMove);
			containerElement.addEventListener('touchmove', handleTouchMove);
		}

		const update = (t: number) => {
			rafRef = requestAnimationFrame(update);
			if (programRef) {
				programRef.uniforms.uTime.value = t * 0.001 * speed;

				// Update reactive uniforms
				const baseColorArray = programRef.uniforms.uBaseColor.value as Float32Array;
				baseColorArray[0] = baseColor[0];
				baseColorArray[1] = baseColor[1];
				baseColorArray[2] = baseColor[2];
				programRef.uniforms.uAmplitude.value = amplitude;
				programRef.uniforms.uFrequencyX.value = frequencyX;
				programRef.uniforms.uFrequencyY.value = frequencyY;
			}
			renderer.render({ scene: mesh });
		};
		rafRef = requestAnimationFrame(update);

		containerElement.appendChild(gl.canvas);

		return () => {
			if (rafRef) cancelAnimationFrame(rafRef);
			window.removeEventListener('resize', resize);
			if (interactive) {
				containerElement.removeEventListener('mousemove', handleMouseMove);
				containerElement.removeEventListener('touchmove', handleTouchMove);
			}
			if (gl.canvas.parentElement) {
				gl.canvas.parentElement.removeChild(gl.canvas);
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

<div {@attach createLiquidChrome} class="liquidChrome-container {className}"></div>

<style>
	.liquidChrome-container {
		width: 100%;
		height: 100%;
		display: block;
	}
</style>
