<script lang="ts">
	import { Canvas, OglContext, Program, Mesh, Camera, Geometry } from 'svogl';
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

	// Constants
	const defaultColors: string[] = ['#ffffff', '#ffffff', '#ffffff'];

	// Derived values
	const palette = $derived(
		particleColors && particleColors.length > 0 ? particleColors : defaultColors
	);

	// Shader code
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

	let lastTime = performance.now();
	let elapsed = 0;

	let ogl: OglContext | null = null;

	const particleData = $derived.by(() => {
		const count = particleCount;
		const positions = new Float32Array(count * 3);
		const randoms = new Float32Array(count * 4);
		const colors = new Float32Array(count * 3);

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
			const col = ogl?.color.hexToArray(palette[Math.floor(Math.random() * palette.length)])!;
			col && colors.set(col, i * 3);
		}

		console.log({ positions, randoms, colors });
		return { positions, randoms, colors };
	});
</script>

<Canvas
	bind:ogl
	depth={false}
	alpha={true}
	onUpdate={({ time }) => {
		const delta = time - lastTime;
		lastTime = time;
		elapsed += delta * speed;
	}}
	class={className}
>
	{#snippet children(ogl)}
		<Program
			vertex={vertexShader}
			fragment={fragmentShader}
			onUpdate={({ time }, { program }) => {
				program.uniforms.uTime.value = elapsed * 0.001;
			}}
			transparent={true}
			depthTest={false}
			uniforms={{
				uTime: { value: 0 },
				uSpread: { value: particleSpread },
				uBaseSize: { value: particleBaseSize },
				uSizeRandomness: { value: sizeRandomness },
				uAlphaParticles: { value: alphaParticles ? 1 : 0 }
			}}
		>
			<Camera
				fov={15}
				left={0}
				top={0}
				zoom={cameraDistance}
				onUpdate={({ time }, { camera }) => {
					camera.position.z = cameraDistance;
				}}
			>
				{#snippet children({ camera })}
					<Geometry
						attributes={{
							position: { size: 3, data: particleData.positions },
							random: { size: 4, data: particleData.randoms },
							color: { size: 3, data: particleData.colors }
						}}
					>
						<Mesh
							mode={ogl.gl.POINTS}
							onUpdate={({ time }, { mesh }) => {
								if (moveParticlesOnHover) {
									const [x, y] = ogl.mousePosition;
									mesh.position.x = -x * particleHoverFactor;
									mesh.position.y = -y * particleHoverFactor;
								} else {
									mesh.position.x = 0;
									mesh.position.y = 0;
								}

								if (!disableRotation) {
									mesh.rotation.x = Math.sin(elapsed * 0.0002) * 0.1;
									mesh.rotation.y = Math.cos(elapsed * 0.0005) * 0.15;
									mesh.rotation.z += 0.01 * speed;
								}
								ogl.renderer.render({ scene: mesh, camera });
							}}
						/>
					</Geometry>
				{/snippet}
			</Camera>
		</Program>
	{/snippet}
</Canvas>
