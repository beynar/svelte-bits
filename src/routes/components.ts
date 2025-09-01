import {
	Aurora,
	Balatro,
	DarkVeil,
	FaultyTerminal,
	Galaxy,
	GradientBlinds,
	GridMotion,
	Iridescence,
	LightRays,
	LiquidChrome,
	Orb,
	Particles,
	Plasma,
	RippleGrid
} from '$lib/index.js';
import Prism from '$lib/backgrounds/Prism/Prism.svelte';
import type { Inputs } from '../components/Knob.svelte';

export const components = [
	{
		name: 'Aurora',
		description: 'A mesmerizing aurora effect with customizable colors and wave patterns',
		Render: Aurora,
		presets: [
			{
				name: 'Northern Lights',
				value: {
					color1: '#00ff88',
					color2: '#0088ff',
					color3: '#8800ff',
					speed: 0.8,
					amplitude: 1.2,
					blend: 0.5
				}
			},
			{
				name: 'Sunset Glow',
				value: {
					color1: '#ff6b35',
					color2: '#f7931e',
					color3: '#ffcd3c',
					speed: 0.5,
					amplitude: 0.8,
					blend: 0.7
				}
			},
			{
				name: 'Ocean Waves',
				value: {
					color1: '#006994',
					color2: '#13a8a8',
					color3: '#009ffd',
					speed: 1.5,
					amplitude: 1.8,
					blend: 0.4
				}
			},
			{
				name: 'Purple Dream',
				value: {
					color1: '#8b5cf6',
					color2: '#a855f7',
					color3: '#c084fc',
					speed: 1.2,
					amplitude: 1.5,
					blend: 0.6
				}
			},
			{
				name: 'Fire Storm',
				value: {
					color1: '#dc2626',
					color2: '#ea580c',
					color3: '#f59e0b',
					speed: 2.5,
					amplitude: 1.9,
					blend: 0.8
				}
			}
		],
		inputs: {
			color1: {
				type: 'color',
				value: '#5227FF'
			},
			color2: {
				type: 'color',
				value: '#7cff67'
			},
			color3: {
				type: 'color',
				value: '#5227FF'
			},

			amplitude: {
				type: 'range',
				min: 0,
				max: 2,
				step: 0.1,
				value: 1.0
			},
			blend: {
				type: 'range',
				min: 0,
				max: 1,
				step: 0.1,
				value: 0.5
			},
			speed: {
				type: 'range',
				min: 0,
				max: 3,
				step: 0.1,
				value: 1.0
			}
		} satisfies Inputs
	},
	{
		name: 'Balatro',
		description: 'A spinning pattern effect inspired by card game aesthetics with dynamic colors',
		Render: Balatro,
		presets: [
			{
				name: 'Classic Cards',
				value: {
					spinRotation: -2.5,
					spinSpeed: 8.0,
					mouseInteraction: true,
					color1: '#ff4757',
					color2: '#3742fa',
					color3: '#2f3542'
				}
			},
			{
				name: 'Neon Spin',
				value: {
					spinRotation: -5.0,
					spinSpeed: 20.0,
					mouseInteraction: true,
					color1: '#ff006e',
					color2: '#8338ec',
					color3: '#3a86ff'
				}
			},
			{
				name: 'Slow Motion',
				value: {
					spinRotation: -0.2,
					spinSpeed: 0.5,
					mouseInteraction: false,
					color1: '#06ffa5',
					color2: '#ffbe0b',
					color3: '#fb5607'
				}
			},
			{
				name: 'Hyperspeed',
				value: {
					spinRotation: -5.0,
					spinSpeed: 20.0,
					mouseInteraction: true,
					color1: '#f72585',
					color2: '#b5179e',
					color3: '#7209b7'
				}
			},
			{
				name: 'Reverse Gentle',
				value: {
					spinRotation: 5.0,
					spinSpeed: 15.0,
					mouseInteraction: false,
					color1: '#f77f00',
					color2: '#fcbf49',
					color3: '#eae2b7'
				}
			}
		],
		inputs: {
			spinRotation: {
				type: 'range',
				min: -5,
				max: 5,
				step: 0.1,
				value: -2.0
			},
			spinSpeed: {
				type: 'range',
				min: 0,
				max: 20,
				step: 0.5,
				value: 7.0
			},
			color1: {
				type: 'color',
				value: '#DE443B'
			},
			color2: {
				type: 'color',
				value: '#006BB4'
			},
			color3: {
				type: 'color',
				value: '#162325'
			},
			contrast: {
				type: 'range',
				min: 0,
				max: 10,
				step: 0.1,
				value: 3.5
			},
			lighting: {
				type: 'range',
				min: 0,
				max: 1,
				step: 0.1,
				value: 0.4
			},
			spinAmount: {
				type: 'range',
				min: 0,
				max: 1,
				step: 0.05,
				value: 0.25
			},
			isRotate: {
				type: 'checkbox',
				value: false
			},
			mouseInteraction: {
				type: 'checkbox',
				value: true
			}
		} satisfies Inputs
	},
	{
		name: 'DarkVeil',
		description: 'A dark atmospheric effect with noise, scanlines, and color shifting',
		Render: DarkVeil,
		presets: [
			{
				name: 'Clean',
				value: {
					hueShift: 0,
					noiseIntensity: 0.0,
					scanlineIntensity: 0.0,
					speed: 0.1
				}
			},
			{
				name: 'Glitchy',
				value: {
					hueShift: 90,
					noiseIntensity: 2.0,
					scanlineIntensity: 2.0,
					speed: 4.0,
					warpAmount: 1.0
				}
			},
			{
				name: 'Retro TV',
				value: {
					hueShift: -60,
					noiseIntensity: 1.5,
					scanlineIntensity: 2.5,
					scanlineFrequency: 10.0,
					speed: 0.2
				}
			},
			{
				name: 'Cyberpunk',
				value: {
					hueShift: 180,
					noiseIntensity: 1.8,
					scanlineIntensity: 1.5,
					speed: 5.0,
					warpAmount: 0.8
				}
			},
			{
				name: 'Nightmare',
				value: {
					hueShift: -180,
					noiseIntensity: 3.0,
					scanlineIntensity: 3.0,
					speed: 8.0,
					warpAmount: 2.0,
					resolutionScale: 0.3
				}
			}
		],
		inputs: {
			hueShift: {
				type: 'range',
				min: -180,
				max: 180,
				step: 1,
				value: 0
			},
			noiseIntensity: {
				type: 'range',
				min: 0,
				max: 1,
				step: 0.01,
				value: 0
			},
			scanlineIntensity: {
				type: 'range',
				min: 0,
				max: 1,
				step: 0.01,
				value: 0
			},
			speed: {
				type: 'range',
				min: 0,
				max: 3,
				step: 0.1,
				value: 0.5
			},
			scanlineFrequency: {
				type: 'range',
				min: 0,
				max: 10,
				step: 0.1,
				value: 0
			},
			warpAmount: {
				type: 'range',
				min: 0,
				max: 1,
				step: 0.01,
				value: 0
			},
			resolutionScale: {
				type: 'range',
				min: 0.1,
				max: 2,
				step: 0.1,
				value: 1
			}
		} satisfies Inputs
	},
	{
		name: 'FaultyTerminal',
		description: 'A retro terminal effect with glitches, chromatic aberration, and flickering',
		Render: FaultyTerminal,
		presets: [
			{
				name: 'Matrix',
				value: {
					scale: 2.0,
					digitSize: 8,
					speed: 3.0,
					glitchIntensity: 1.5,
					chromaticAberration: 1.0
				}
			},
			{
				name: 'Hacker Mode',
				value: {
					scale: 0.3,
					digitSize: 6,
					speed: 5.0,
					glitchIntensity: 3.0,
					chromaticAberration: 2.0
				}
			},
			{
				name: 'Retro Amber',
				value: {
					scale: 3.0,
					digitSize: 24,
					speed: 0.2,
					glitchIntensity: 0.0,
					chromaticAberration: 0.0
				}
			},
			{
				name: 'System Error',
				value: {
					scale: 0.5,
					digitSize: 4,
					speed: 8.0,
					glitchIntensity: 5.0,
					chromaticAberration: 3.0
				}
			}
		],
		inputs: {
			scale: {
				type: 'range',
				min: 0.1,
				max: 5,
				step: 0.1,
				value: 1
			},
			digitSize: {
				type: 'range',
				min: 0.5,
				max: 3,
				step: 0.1,
				value: 1.5
			},
			timeScale: {
				type: 'range',
				min: 0,
				max: 2,
				step: 0.1,
				value: 0.3
			},
			scanlineIntensity: {
				type: 'range',
				min: 0,
				max: 1,
				step: 0.01,
				value: 0.3
			},
			glitchAmount: {
				type: 'range',
				min: 0,
				max: 3,
				step: 0.1,
				value: 1
			},
			flickerAmount: {
				type: 'range',
				min: 0,
				max: 3,
				step: 0.1,
				value: 1
			},
			noiseAmp: {
				type: 'range',
				min: 0,
				max: 3,
				step: 0.1,
				value: 1
			},
			chromaticAberration: {
				type: 'range',
				min: 0,
				max: 10,
				step: 0.1,
				value: 0
			},
			curvature: {
				type: 'range',
				min: 0,
				max: 1,
				step: 0.01,
				value: 0.2
			},
			tint: {
				type: 'color',
				value: '#56d345'
			},
			mouseReact: {
				type: 'checkbox',
				value: true
			},
			mouseStrength: {
				type: 'range',
				min: 0,
				max: 1,
				step: 0.01,
				value: 0.2
			},
			pause: {
				type: 'checkbox',
				value: false
			},
			pageLoadAnimation: {
				type: 'checkbox',
				value: true
			},
			brightness: {
				type: 'range',
				min: 0,
				max: 3,
				step: 0.1,
				value: 1
			}
		} satisfies Inputs
	},
	{
		name: 'Galaxy',
		description: 'An interactive starfield galaxy with mouse repulsion and twinkling stars',
		Render: Galaxy,
		presets: [
			{
				name: 'Milky Way',
				value: {
					starSpeed: 1.0,
					density: 3.0,
					mouseRepulsion: true,
					twinkleIntensity: 2.5
				}
			},
			{
				name: 'Nebula',
				value: {
					starSpeed: 2.5,
					density: 5.0,
					mouseRepulsion: false,
					twinkleIntensity: 4.0
				}
			},
			{
				name: 'Deep Space',
				value: {
					starSpeed: 0.01,
					density: 0.1,
					mouseRepulsion: true,
					twinkleIntensity: 0.05
				}
			},
			{
				name: 'Hyperspace',
				value: {
					starSpeed: 5.0,
					density: 8.0,
					mouseRepulsion: true,
					twinkleIntensity: 6.0
				}
			},
			{
				name: 'Calm Void',
				value: {
					starSpeed: 0.001,
					density: 0.05,
					mouseRepulsion: false,
					twinkleIntensity: 0.01
				}
			}
		],
		inputs: {
			starSpeed: {
				type: 'range',
				min: 0,
				max: 2,
				step: 0.1,
				value: 0.5
			},
			density: {
				type: 'range',
				min: 0.1,
				max: 3,
				step: 0.1,
				value: 1
			},
			hueShift: {
				type: 'range',
				min: 0,
				max: 360,
				step: 1,
				value: 140
			},
			speed: {
				type: 'range',
				min: 0,
				max: 3,
				step: 0.1,
				value: 1.0
			},
			glowIntensity: {
				type: 'range',
				min: 0,
				max: 1,
				step: 0.01,
				value: 0.3
			},
			saturation: {
				type: 'range',
				min: 0,
				max: 1,
				step: 0.01,
				value: 0.0
			},
			twinkleIntensity: {
				type: 'range',
				min: 0,
				max: 1,
				step: 0.01,
				value: 0.3
			},
			rotationSpeed: {
				type: 'range',
				min: 0,
				max: 1,
				step: 0.01,
				value: 0.1
			},
			repulsionStrength: {
				type: 'range',
				min: 0,
				max: 5,
				step: 0.1,
				value: 2
			},
			mouseInteraction: {
				type: 'checkbox',
				value: true
			},
			mouseRepulsion: {
				type: 'checkbox',
				value: true
			},
			disableAnimation: {
				type: 'checkbox',
				value: false
			},
			transparent: {
				type: 'checkbox',
				value: false
			}
		} satisfies Inputs
	},
	{
		name: 'GradientBlinds',
		description: 'Animated gradient blinds with customizable colors and motion',
		Render: GradientBlinds,
		presets: [
			{
				name: 'Sunset',
				value: {
					color1: '#ff6b35',
					color2: '#f7931e',
					color3: '#ffcc02',
					speed: 3.0,
					blindCount: 4
				}
			},
			{
				name: 'Ocean',
				value: {
					color1: '#006994',
					color2: '#13a8a8',
					color3: '#009ffd',
					speed: 0.1,
					blindCount: 20
				}
			},
			{
				name: 'Neon',
				value: {
					color1: '#ff0080',
					color2: '#7928ca',
					color3: '#0070f3',
					speed: 5.0,
					blindCount: 3
				}
			},
			{
				name: 'Forest',
				value: {
					color1: '#2d5016',
					color2: '#61892f',
					color3: '#86c232',
					speed: 0.05,
					blindCount: 30
				}
			}
		],
		inputs: {
			angle: {
				type: 'range',
				min: 0,
				max: 360,
				step: 1,
				value: 0
			},
			noise: {
				type: 'range',
				min: 0,
				max: 1,
				step: 0.01,
				value: 0.3
			},
			blindCount: {
				type: 'range',
				min: 4,
				max: 32,
				step: 1,
				value: 16
			},
			blindMinWidth: {
				type: 'range',
				min: 20,
				max: 200,
				step: 5,
				value: 60
			},
			mouseDampening: {
				type: 'range',
				min: 0,
				max: 1,
				step: 0.01,
				value: 0.15
			},
			mirrorGradient: {
				type: 'checkbox',
				value: false
			},
			spotlightRadius: {
				type: 'range',
				min: 0.1,
				max: 2,
				step: 0.1,
				value: 0.5
			},
			spotlightSoftness: {
				type: 'range',
				min: 0.1,
				max: 3,
				step: 0.1,
				value: 1
			},
			spotlightOpacity: {
				type: 'range',
				min: 0,
				max: 1,
				step: 0.01,
				value: 1
			},
			distortAmount: {
				type: 'range',
				min: 0,
				max: 1,
				step: 0.01,
				value: 0
			},
			shineDirection: {
				type: 'select',
				options: ['left', 'right'],
				value: 'left'
			},
			paused: {
				type: 'checkbox',
				value: false
			}
		} satisfies Inputs
	},
	{
		name: 'GridMotion',
		description: 'An animated grid pattern with customizable motion and colors',
		Render: GridMotion,
		presets: [
			{
				name: 'Classic Grid',
				value: {
					gridSize: 50,
					lineWidth: 5,
					speed: 3.0,
					color: '#ffffff',
					opacity: 1.0
				}
			},
			{
				name: 'Cyber Grid',
				value: {
					gridSize: 5,
					lineWidth: 1,
					speed: 8.0,
					color: '#00ff41',
					opacity: 1.0
				}
			},
			{
				name: 'Retro Neon',
				value: {
					gridSize: 80,
					lineWidth: 8,
					speed: 0.1,
					color: '#ff0080',
					opacity: 1.0
				}
			},
			{
				name: 'Blueprint',
				value: {
					gridSize: 3,
					lineWidth: 1,
					speed: 0.01,
					color: '#0080ff',
					opacity: 0.2
				}
			}
		],
		inputs: {
			gradientColor: {
				type: 'color',
				value: '#000000'
			}
		} satisfies Inputs
	},
	{
		name: 'Iridescence',
		description: 'A shimmering iridescent effect with rainbow colors and wave patterns',
		Render: Iridescence,
		presets: [
			{
				name: 'Northern Lights',
				value: {
					intensity: 2.5,
					speed: 3.0,
					colorStops: ['#00ff88', '#0088ff', '#8800ff']
				}
			},
			{
				name: 'Sunset',
				value: {
					intensity: 3.0,
					speed: 0.3,
					colorStops: ['#ff6b35', '#f7931e', '#ffcc02']
				}
			},
			{
				name: 'Ocean',
				value: {
					intensity: 1.8,
					speed: 4.5,
					colorStops: ['#006994', '#13a8a8', '#009ffd']
				}
			},
			{
				name: 'Cosmic',
				value: {
					intensity: 4.0,
					speed: 6.0,
					colorStops: ['#ff0080', '#7928ca', '#0070f3']
				}
			},
			{
				name: 'Forest',
				value: {
					intensity: 2.0,
					speed: 0.1,
					colorStops: ['#2d5016', '#61892f', '#86c232']
				}
			}
		],
		inputs: {
			speed: {
				type: 'range',
				min: 0,
				max: 3,
				step: 0.1,
				value: 1.0
			},
			amplitude: {
				type: 'range',
				min: 0,
				max: 1,
				step: 0.01,
				value: 0.1
			},
			mouseReact: {
				type: 'checkbox',
				value: true
			}
		} satisfies Inputs
	},
	{
		name: 'LightRays',
		description:
			'Radiating light rays from customizable origins with pulsing and distortion effects',
		Render: LightRays,
		inputs: {
			raysOrigin: {
				type: 'select',
				options: [
					'top-center',
					'top-left',
					'top-right',
					'right',
					'left',
					'bottom-center',
					'bottom-right',
					'bottom-left'
				],
				value: 'top-center'
			},
			raysColor: {
				type: 'color',
				value: '#ffffff'
			},
			raysSpeed: {
				type: 'range',
				min: 0,
				max: 3,
				step: 0.1,
				value: 1
			},
			lightSpread: {
				type: 'range',
				min: 0.1,
				max: 3,
				step: 0.1,
				value: 1
			},
			rayLength: {
				type: 'range',
				min: 0.5,
				max: 5,
				step: 0.1,
				value: 2
			},
			pulsating: {
				type: 'checkbox',
				value: false
			},
			fadeDistance: {
				type: 'range',
				min: 0.1,
				max: 3,
				step: 0.1,
				value: 1.0
			},
			saturation: {
				type: 'range',
				min: 0,
				max: 2,
				step: 0.1,
				value: 1.0
			},
			followMouse: {
				type: 'checkbox',
				value: true
			},
			mouseInfluence: {
				type: 'range',
				min: 0,
				max: 1,
				step: 0.01,
				value: 0.1
			},
			noiseAmount: {
				type: 'range',
				min: 0,
				max: 1,
				step: 0.01,
				value: 0.0
			},
			distortion: {
				type: 'range',
				min: 0,
				max: 1,
				step: 0.01,
				value: 0.0
			}
		} satisfies Inputs
	},
	{
		name: 'LiquidChrome',
		description: 'A liquid chrome effect with reflective surfaces and flowing motion',
		Render: LiquidChrome,
		presets: [
			{
				name: 'Mercury',
				value: {
					flowSpeed: 1.0,
					reflectivity: 0.9,
					viscosity: 0.5,
					color: '#c0c0c0'
				}
			},
			{
				name: 'Gold Flow',
				value: {
					flowSpeed: 0.8,
					reflectivity: 1.2,
					viscosity: 0.3,
					color: '#ffd700'
				}
			},
			{
				name: 'Oil Spill',
				value: {
					flowSpeed: 0.3,
					reflectivity: 0.7,
					viscosity: 0.8,
					color: '#1a1a1a'
				}
			},
			{
				name: 'Plasma',
				value: {
					flowSpeed: 2.0,
					reflectivity: 1.5,
					viscosity: 0.1,
					color: '#ff4080'
				}
			}
		],
		inputs: {
			speed: {
				type: 'range',
				min: 0,
				max: 1,
				step: 0.01,
				value: 0.2
			},
			amplitude: {
				type: 'range',
				min: 0,
				max: 2,
				step: 0.1,
				value: 0.5
			},
			frequencyX: {
				type: 'range',
				min: 1,
				max: 10,
				step: 0.1,
				value: 3
			},
			frequencyY: {
				type: 'range',
				min: 1,
				max: 10,
				step: 0.1,
				value: 2
			},
			interactive: {
				type: 'checkbox',
				value: true
			}
		} satisfies Inputs
	},
	{
		name: 'Orb',
		description: 'A glowing orb with pulsing energy and particle effects',
		Render: Orb,
		presets: [
			{
				name: 'Energy Core',
				value: {
					size: 1.0,
					pulseSpeed: 1.5,
					glowIntensity: 0.8,
					color: '#00aaff'
				}
			},
			{
				name: 'Fire Orb',
				value: {
					size: 1.2,
					pulseSpeed: 2.0,
					glowIntensity: 1.2,
					color: '#ff4400'
				}
			},
			{
				name: 'Crystal',
				value: {
					size: 0.8,
					pulseSpeed: 0.5,
					glowIntensity: 0.4,
					color: '#ffffff'
				}
			},
			{
				name: 'Dark Matter',
				value: {
					size: 1.5,
					pulseSpeed: 0.8,
					glowIntensity: 1.5,
					color: '#8800ff'
				}
			}
		],
		inputs: {
			hue: {
				type: 'range',
				min: 0,
				max: 360,
				step: 1,
				value: 0
			},
			hoverIntensity: {
				type: 'range',
				min: 0,
				max: 1,
				step: 0.01,
				value: 0.2
			},
			rotateOnHover: {
				type: 'checkbox',
				value: true
			},
			forceHoverState: {
				type: 'checkbox',
				value: false
			}
		} satisfies Inputs
	},
	{
		name: 'Particles',
		description: 'A particle system with customizable movement, colors, and interactions',
		Render: Particles,
		presets: [
			{
				name: 'Snow',
				value: {
					particleCount: 500,
					speed: 2.0,
					size: 8,
					color: '#ffffff',
					opacity: 1.0
				}
			},
			{
				name: 'Fireflies',
				value: {
					particleCount: 10,
					speed: 0.05,
					size: 12,
					color: '#ffff00',
					opacity: 1.0
				}
			},
			{
				name: 'Stardust',
				value: {
					particleCount: 1000,
					speed: 5.0,
					size: 1,
					color: '#00ffff',
					opacity: 1.0
				}
			},
			{
				name: 'Embers',
				value: {
					particleCount: 25,
					speed: 0.1,
					size: 20,
					color: '#ff6600',
					opacity: 1.0
				}
			}
		],
		inputs: {
			particleCount: {
				type: 'range',
				min: 50,
				max: 1000,
				step: 10,
				value: 200
			},
			particleSpread: {
				type: 'range',
				min: 1,
				max: 50,
				step: 1,
				value: 10
			},
			speed: {
				type: 'range',
				min: 0,
				max: 1,
				step: 0.01,
				value: 0.1
			},
			moveParticlesOnHover: {
				type: 'checkbox',
				value: true
			},
			particleHoverFactor: {
				type: 'range',
				min: 0,
				max: 3,
				step: 0.1,
				value: 1
			},
			alphaParticles: {
				type: 'checkbox',
				value: false
			},
			particleBaseSize: {
				type: 'range',
				min: 10,
				max: 500,
				step: 10,
				value: 100
			},
			sizeRandomness: {
				type: 'range',
				min: 0,
				max: 3,
				step: 0.1,
				value: 1
			},
			cameraDistance: {
				type: 'range',
				min: 5,
				max: 100,
				step: 1,
				value: 20
			},
			disableRotation: {
				type: 'checkbox',
				value: false
			}
		} satisfies Inputs
	},
	{
		name: 'Plasma',
		description: 'A plasma effect with flowing energy patterns and electric colors',
		Render: Plasma,
		presets: [
			{
				name: 'Electric Blue',
				value: {
					intensity: 1.0,
					speed: 1.2,
					frequency: 2.0,
					color1: '#0080ff',
					color2: '#00ffff'
				}
			},
			{
				name: 'Fire Storm',
				value: {
					intensity: 1.5,
					speed: 2.0,
					frequency: 3.0,
					color1: '#ff4400',
					color2: '#ffaa00'
				}
			},
			{
				name: 'Toxic Green',
				value: {
					intensity: 0.8,
					speed: 0.8,
					frequency: 1.5,
					color1: '#00ff00',
					color2: '#88ff00'
				}
			},
			{
				name: 'Purple Lightning',
				value: {
					intensity: 1.3,
					speed: 1.8,
					frequency: 2.5,
					color1: '#8800ff',
					color2: '#ff00ff'
				}
			}
		],
		inputs: {
			color: {
				type: 'color',
				value: '#ffffff'
			},
			speed: {
				type: 'range',
				min: 0,
				max: 3,
				step: 0.1,
				value: 1
			},
			direction: {
				type: 'select',
				options: ['forward', 'reverse', 'pingpong'],
				value: 'forward'
			},
			scale: {
				type: 'range',
				min: 0.1,
				max: 3,
				step: 0.1,
				value: 1
			},
			opacity: {
				type: 'range',
				min: 0,
				max: 1,
				step: 0.01,
				value: 1
			},
			mouseInteractive: {
				type: 'checkbox',
				value: true
			},
			mouseInteractionRadius: {
				type: 'range',
				min: 0.1,
				max: 3,
				step: 0.1,
				value: 1
			}
		} satisfies Inputs
	},
	{
		name: 'RippleGrid',
		description: 'An animated grid with rippling effects and customizable colors',
		Render: RippleGrid,
		presets: [
			{
				name: 'Ocean Waves',
				value: {
					gridSize: 20,
					rippleSpeed: 1.0,
					amplitude: 0.5,
					color: '#0080ff',
					enableRainbow: false
				}
			},
			{
				name: 'Rainbow Ripples',
				value: {
					gridSize: 15,
					rippleSpeed: 1.5,
					amplitude: 0.8,
					color: '#ffffff',
					enableRainbow: true
				}
			},
			{
				name: 'Seismic',
				value: {
					gridSize: 25,
					rippleSpeed: 0.5,
					amplitude: 1.2,
					color: '#ff4400',
					enableRainbow: false
				}
			},
			{
				name: 'Neon Pulse',
				value: {
					gridSize: 12,
					rippleSpeed: 2.0,
					amplitude: 0.6,
					color: '#ff0080',
					enableRainbow: false
				}
			}
		],
		inputs: {
			enableRainbow: {
				type: 'checkbox',
				value: false
			},
			gridColor: {
				type: 'color',
				value: '#ffffff'
			},
			rippleIntensity: {
				type: 'range',
				min: 0,
				max: 0.2,
				step: 0.001,
				value: 0.05
			},
			gridSize: {
				type: 'range',
				min: 1,
				max: 50,
				step: 0.5,
				value: 10.0
			},
			gridThickness: {
				type: 'range',
				min: 1,
				max: 50,
				step: 0.5,
				value: 15.0
			},
			fadeDistance: {
				type: 'range',
				min: 0.1,
				max: 5,
				step: 0.1,
				value: 1.5
			},
			vignetteStrength: {
				type: 'range',
				min: 0,
				max: 5,
				step: 0.1,
				value: 2.0
			},
			glowIntensity: {
				type: 'range',
				min: 0,
				max: 1,
				step: 0.01,
				value: 0.1
			},
			opacity: {
				type: 'range',
				min: 0,
				max: 1,
				step: 0.01,
				value: 1.0
			},
			gridRotation: {
				type: 'range',
				min: 0,
				max: 360,
				step: 1,
				value: 0
			},
			mouseInteraction: {
				type: 'checkbox',
				value: true
			},
			mouseInteractionRadius: {
				type: 'range',
				min: 0.1,
				max: 3,
				step: 0.1,
				value: 1
			}
		} satisfies Inputs
	},
	{
		name: 'Prism',
		description: 'A 3D prismatic effect with customizable rotation, colors, and lighting',
		Render: Prism,
		presets: [
			{
				name: 'Crystal Palace',
				value: {
					height: 2.0,
					baseWidth: 3.0,
					animationType: 'rotate',
					glow: 0.5,
					scale: 2.0,
					hueShift: 0,
					colorFrequency: 0.8,
					timeScale: 0.3
				}
			},
			{
				name: 'Neon Prism',
				value: {
					height: 5.0,
					baseWidth: 8.0,
					animationType: '3drotate',
					glow: 3.0,
					scale: 1.0,
					hueShift: 120,
					colorFrequency: 2.5,
					timeScale: 1.5
				}
			},
			{
				name: 'Hover Gem',
				value: {
					height: 4.0,
					baseWidth: 6.0,
					animationType: 'hover',
					glow: 2.0,
					scale: 1.5,
					hueShift: -90,
					colorFrequency: 1.5,
					hoverStrength: 3.0,
					inertia: 0.02
				}
			},
			{
				name: 'Micro Crystal',
				value: {
					height: 0.5,
					baseWidth: 0.8,
					animationType: 'rotate',
					glow: 5.0,
					scale: 8.0,
					hueShift: 180,
					colorFrequency: 5.0,
					timeScale: 2.0
				}
			},
			{
				name: 'Giant Monolith',
				value: {
					height: 10.0,
					baseWidth: 15.0,
					animationType: '3drotate',
					glow: 0.1,
					scale: 0.5,
					hueShift: 45,
					colorFrequency: 0.2,
					timeScale: 0.05
				}
			}
		],
		inputs: {
			height: {
				type: 'range',
				min: 0.1,
				max: 10,
				step: 0.1,
				value: 3.5
			},
			baseWidth: {
				type: 'range',
				min: 0.1,
				max: 15,
				step: 0.1,
				value: 5.5
			},
			animationType: {
				type: 'select',
				options: ['rotate', 'hover', '3drotate'],
				value: 'rotate'
			},
			glow: {
				type: 'range',
				min: 0,
				max: 5,
				step: 0.1,
				value: 1
			},
			noise: {
				type: 'range',
				min: 0,
				max: 2,
				step: 0.1,
				value: 0.5
			},
			transparent: {
				type: 'checkbox',
				value: true
			},
			scale: {
				type: 'range',
				min: 0.1,
				max: 10,
				step: 0.1,
				value: 3.6
			},
			hueShift: {
				type: 'range',
				min: -180,
				max: 180,
				step: 1,
				value: 0
			},
			colorFrequency: {
				type: 'range',
				min: 0.1,
				max: 5,
				step: 0.1,
				value: 1
			},
			hoverStrength: {
				type: 'range',
				min: 0,
				max: 5,
				step: 0.1,
				value: 2
			},
			inertia: {
				type: 'range',
				min: 0,
				max: 1,
				step: 0.01,
				value: 0.05
			},
			bloom: {
				type: 'range',
				min: 0,
				max: 3,
				step: 0.1,
				value: 1
			},
			timeScale: {
				type: 'range',
				min: 0,
				max: 3,
				step: 0.1,
				value: 0.5
			}
		} satisfies Inputs
	}
];
