<script lang="ts">
	import { Canvas, OglContext, Program, Mesh, Triangle } from 'svogl';

	interface RippleGridProps {
		enableRainbow?: boolean;
		gridColor?: string;
		rippleIntensity?: number;
		gridSize?: number;
		gridThickness?: number;
		fadeDistance?: number;
		vignetteStrength?: number;
		glowIntensity?: number;
		opacity?: number;
		gridRotation?: number;
		mouseInteraction?: boolean;
		mouseInteractionRadius?: number;
		class: string;
	}

	let {
		enableRainbow = false,
		gridColor = '#ffffff',
		rippleIntensity = 0.05,
		gridSize = 10.0,
		gridThickness = 15.0,
		fadeDistance = 1.5,
		vignetteStrength = 2.0,
		glowIntensity = 0.1,
		opacity = 1.0,
		gridRotation = 0,
		mouseInteraction = true,
		mouseInteractionRadius = 1,
		class: className = ''
	}: RippleGridProps = $props();

	const vertex = `#version 300 es
in vec2 position;
out vec2 vUv;
void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
}`;

	const fragment = `#version 300 es
precision highp float;
uniform float iTime;
uniform vec2 iResolution;
uniform bool enableRainbow;
uniform vec3 gridColor;
uniform float rippleIntensity;
uniform float gridSize;
uniform float gridThickness;
uniform float fadeDistance;
uniform float vignetteStrength;
uniform float glowIntensity;
uniform float opacity;
uniform float gridRotation;
uniform bool mouseInteraction;
uniform vec2 mousePosition;
uniform float mouseInfluence;
uniform float mouseInteractionRadius;
in vec2 vUv;
out vec4 fragColor;

float pi = 3.141592;

mat2 rotate(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
}

void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    uv.x *= iResolution.x / iResolution.y;

    if (gridRotation != 0.0) {
        uv = rotate(gridRotation * pi / 180.0) * uv;
    }

    float dist = length(uv);
    float func = sin(pi * (iTime - dist));
    vec2 rippleUv = uv + uv * func * rippleIntensity;

    if (mouseInteraction && mouseInfluence > 0.0) {
        vec2 mouseUv = (mousePosition * 2.0 - 1.0);
        mouseUv.x *= iResolution.x / iResolution.y;
        float mouseDist = length(uv - mouseUv);
        
        float influence = mouseInfluence * exp(-mouseDist * mouseDist / (mouseInteractionRadius * mouseInteractionRadius));
        
        float mouseWave = sin(pi * (iTime * 2.0 - mouseDist * 3.0)) * influence;
        rippleUv += normalize(uv - mouseUv) * mouseWave * rippleIntensity * 0.3;
    }

    vec2 a = sin(gridSize * 0.5 * pi * rippleUv - pi / 2.0);
    vec2 b = abs(a);

    float aaWidth = 0.5;
    vec2 smoothB = vec2(
        smoothstep(0.0, aaWidth, b.x),
        smoothstep(0.0, aaWidth, b.y)
    );

    vec3 color = vec3(0.0);
    color += exp(-gridThickness * smoothB.x * (0.8 + 0.5 * sin(pi * iTime)));
    color += exp(-gridThickness * smoothB.y);
    color += 0.5 * exp(-(gridThickness / 4.0) * sin(smoothB.x));
    color += 0.5 * exp(-(gridThickness / 3.0) * smoothB.y);

    if (glowIntensity > 0.0) {
        color += glowIntensity * exp(-gridThickness * 0.5 * smoothB.x);
        color += glowIntensity * exp(-gridThickness * 0.5 * smoothB.y);
    }

    float ddd = exp(-2.0 * clamp(pow(dist, fadeDistance), 0.0, 1.0));
    
    vec2 vignetteCoords = vUv - 0.5;
    float vignetteDistance = length(vignetteCoords);
    float vignette = 1.0 - pow(vignetteDistance * 2.0, vignetteStrength);
    vignette = clamp(vignette, 0.0, 1.0);
    
    vec3 t;
    if (enableRainbow) {
        t = vec3(
            uv.x * 0.5 + 0.5 * sin(iTime),
            uv.y * 0.5 + 0.5 * cos(iTime),
            pow(cos(iTime), 4.0)
        ) + 0.5;
    } else {
        t = gridColor;
    }

    float finalFade = ddd * vignette;
    float alpha = length(color) * finalFade * opacity;
    fragColor = vec4(color * t * finalFade * opacity, alpha);
}`;

	let ogl: OglContext | null = null;
	let mousePosition = [0.5, 0.5];
	let targetMouse = [0.5, 0.5];
	let mouseInfluence = 0;

	// Mouse interaction handlers
	const handleMouseMove = ({ x, y }: { x: number; y: number }) => {
		if (!mouseInteraction) return;
		targetMouse = [x, 1.0 - y]; // Flip Y coordinate
	};

	const handleMouseEnter = () => {
		if (!mouseInteraction) return;
		mouseInfluence = 1.0;
	};

	const handleMouseLeave = () => {
		if (!mouseInteraction) return;
		mouseInfluence = 0.0;
	};
</script>

<Canvas
	bind:ogl
	class={className}
	alpha={true}
	dpr={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1}
	onMouseMove={handleMouseMove}
	onMouseEnter={handleMouseEnter}
	onMouseLeave={handleMouseLeave}
	onMount={(ogl) => {
		// Enable blending for transparency
		ogl.gl.enable(ogl.gl.BLEND);
		ogl.gl.blendFunc(ogl.gl.SRC_ALPHA, ogl.gl.ONE_MINUS_SRC_ALPHA);
	}}
>
	{#snippet children(ogl)}
		{#if ogl.container}
			<Program
				onResize={({ width, height }, program) => {
					program.program.uniforms.iResolution.value = [width, height];
				}}
				{vertex}
				{fragment}
				uniforms={{
					iTime: { value: 0 },
					iResolution: {
						value: [ogl.container.offsetWidth, ogl.container.offsetHeight],
						noUpdate: true
					},
					enableRainbow: { value: enableRainbow },
					gridColor: { value: ogl.color.hexToArray(gridColor) },
					rippleIntensity: { value: rippleIntensity },
					gridSize: { value: gridSize },
					gridThickness: { value: gridThickness },
					fadeDistance: { value: fadeDistance },
					vignetteStrength: { value: vignetteStrength },
					glowIntensity: { value: glowIntensity },
					opacity: { value: opacity },
					gridRotation: { value: gridRotation },
					mouseInteraction: { value: mouseInteraction },
					mousePosition: { value: [0.5, 0.5] },
					mouseInfluence: { value: 0 },
					mouseInteractionRadius: { value: mouseInteractionRadius }
				}}
				onUpdate={({ time }, program) => {
					program.program.uniforms.iTime.value = time * 0.001;
					// Smooth mouse position and influence updates
					const lerpFactor = 0.1;
					mousePosition[0] += (targetMouse[0] - mousePosition[0]) * lerpFactor;
					mousePosition[1] += (targetMouse[1] - mousePosition[1]) * lerpFactor;

					const currentInfluence = program.program.uniforms.mouseInfluence.value;
					program.program.uniforms.mouseInfluence.value +=
						(mouseInfluence - currentInfluence) * 0.05;

					program.program.uniforms.mousePosition.value = mousePosition;
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
		{/if}
	{/snippet}
</Canvas>
