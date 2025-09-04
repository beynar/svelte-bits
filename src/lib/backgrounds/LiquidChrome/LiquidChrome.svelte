<script lang="ts">
	import { Canvas, OglContext, Program, Mesh, Triangle } from 'svogl';

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

	let ogl = $state<OglContext | null>(null);
	let mousePos = $state([0, 0]);

	// Mouse interaction handler
	const handleMouseMove = ({ x, y }: { x: number; y: number }) => {
		if (interactive) {
			mousePos = [x, 1 - y]; // Flip Y coordinate like original
		}
	};

	const vertex = `
      attribute vec2 position;
      attribute vec2 uv;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

	const fragment = `
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
</script>

<Canvas
	bind:ogl
	onMouseMove={handleMouseMove}
	class={className}
	antialias={true}
	onMount={({ gl }) => {
		gl?.clearColor(1, 1, 1, 1);
	}}
>
	<Program
		{vertex}
		{fragment}
		uniforms={{
			uTime: { value: 0 },
			uResolution: { value: [1, 1, 1], noUpdate: true },
			uBaseColor: { value: baseColor },
			uAmplitude: { value: amplitude },
			uFrequencyX: { value: frequencyX },
			uFrequencyY: { value: frequencyY },
			uMouse: { value: mousePos }
		}}
		onResize={({ width, height }, program) => {
			program.program.uniforms.uResolution.value = [width, height, width / height];
		}}
		onUpdate={({ time }, { program }) => {
			// Update uniforms with current prop values for reactivity
			program.uniforms.uTime.value = time * 0.001 * speed;
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
