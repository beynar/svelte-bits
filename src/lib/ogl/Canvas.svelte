<script lang="ts" module>
	import { Color, Renderer } from 'ogl';
	import type { RendererOptions } from './types/core/Renderer.js';
	import { getContext, onDestroy, onMount, setContext, untrack, type Snippet } from 'svelte';
	import { on } from 'svelte/events';

	export type ResizeCallback<T> = (
		{ width, height }: { width: number; height: number },
		context: T
	) => void;
	export type UpdateCallback<T> = ({ time }: { time: number }, context: T) => void;
	type OglContextOptions = {
		onMount?: (context: MountedOgl) => void;
		canvasClassName?: string;
		onResize?: ResizeCallback<OglContext>;
		onUpdate?: UpdateCallback<OglContext>;
		onMouseMove?: MouseMoveCallback<OglContext>;
	};
	type MakeRequired<T, K extends keyof T> = Omit<T, K> & {
		[P in K]: T[P] extends infer U | null ? U : T[P];
	};
	type MountedOgl = MakeRequired<OglContext, 'gl' | 'container' | 'canvas' | 'renderer'>;

	export type MouseMoveCallback<T> = (
		{ x, y, rect, e }: { x: number; y: number; rect: DOMRect; e: MouseEvent },
		context: T
	) => void;

	export type PointerDownCallback<T> = (
		{ x, y, rect, e }: { x: number; y: number; rect: DOMRect; e: MouseEvent },
		context: T
	) => void;
	export type PointerUpCallback<T> = (
		{ x, y, rect, e }: { x: number; y: number; rect: DOMRect; e: MouseEvent },
		context: T
	) => void;
	export type MouseEnterCallback<T> = (
		{ x, y, rect, e }: { x: number; y: number; rect: DOMRect; e: MouseEvent },
		context: T
	) => void;
	export type MouseLeaveCallback<T> = (
		{ x, y, rect, e }: { x: number; y: number; rect: DOMRect; e: MouseEvent },
		context: T
	) => void;

	export class OglContext {
		private options: OglContextOptions;
		mousePosition = $state<[number, number]>([0, 0]);
		containerSize = $state<[number, number]>([0, 0]);
		mounted = $state(false);
		renderer: Renderer | null = null;
		container: HTMLDivElement | null = null;
		canvas: HTMLCanvasElement | null = null;
		gl: Renderer['gl'] | null = null;
		raf: number | null = null;
		children: Map<string, any> = new Map();
		resizeCallbacks = new Set<ResizeCallback<any>>();
		updateCallbacks = new Set<UpdateCallback<any>>();
		mouseMoveCallbacks = new Set<MouseMoveCallback<any>>();
		pointerDownCallbacks = new Set<PointerDownCallback<any>>();
		pointerUpCallbacks = new Set<PointerUpCallback<any>>();
		mouseEnterCallbacks = new Set<MouseEnterCallback<any>>();
		mouseLeaveCallbacks = new Set<MouseLeaveCallback<any>>();

		onResize = (cb?: ResizeCallback<any>) => {
			if (!this.container) return;
			const { width, height } = this.container.getBoundingClientRect();

			this.containerSize = [width, height];
			this.renderer?.setSize(width, height);

			if (cb) {
				cb({ width, height }, this);
			} else {
				this.resizeCallbacks.forEach((callback) => callback({ width, height }, this));
			}
			if (this.canvas) {
				this.canvas.style.width = '100%';
				this.canvas.style.height = '100%';
			}
		};

		onUpdate = (time: number) => {
			this.raf = requestAnimationFrame(this.onUpdate);
			this.updateCallbacks.forEach((callback) => callback({ time }, this));
		};

		handleMouseEvent = (e: MouseEvent, eventCallbacks: Set<MouseMoveCallback<any>>) => {
			if (!this.container || !this.mounted) {
				return;
			}
			const rect = this.container.getBoundingClientRect();
			const x = (e.clientX - rect.left) / rect.width;
			const y = 1.0 - (e.clientY - rect.top) / rect.height;

			this.mousePosition = [x, y];
			eventCallbacks.forEach((callback) => callback({ x, y, rect, e }, this));
		};

		onMouseMove = (e: MouseEvent) => {
			this.handleMouseEvent(e, this.mouseMoveCallbacks);
		};

		onPointerDown = (e: MouseEvent) => {
			this.handleMouseEvent(e, this.pointerDownCallbacks);
		};

		onPointerUp = (e: MouseEvent) => {
			this.handleMouseEvent(e, this.pointerUpCallbacks);
		};

		onMouseEnter = (e: MouseEvent) => {
			this.handleMouseEvent(e, this.mouseEnterCallbacks);
		};

		onMouseLeave = (e: MouseEvent) => {
			this.handleMouseEvent(e, this.mouseLeaveCallbacks);
		};

		addChild = (child: any) => {
			this.children.set(child.id, child);
			onMount(() => {
				return () => {
					this.children.delete(child.id);
				};
			});
		};

		attachment(node: HTMLDivElement, rendererOptions: Partial<RendererOptions>) {
			console.log('attachment');
			this.container = node;
			const offResize = on(window, 'resize', () => this.onResize());

			this.renderer = new Renderer({
				alpha: true,
				premultipliedAlpha: true,
				antialias: true,
				...rendererOptions
			});
			this.gl = this.renderer.gl;
			this.canvas = this.renderer.gl.canvas;
			this.container.appendChild(this.canvas);
			this.canvas.style.width = '100%';
			this.canvas.style.height = '100%';
			this.canvas.style.display = 'block';
			if (this.options.canvasClassName) {
				this.canvas.className = this.options.canvasClassName;
			}

			this.mounted = true;
			this.options.onMount?.(this as MountedOgl);
			this.raf = requestAnimationFrame(this.onUpdate);

			this.options.onUpdate && this.updateCallbacks.add(this.options.onUpdate);
			this.options.onResize && this.resizeCallbacks.add(this.options.onResize);
			this.options.onMouseMove && this.mouseMoveCallbacks.add(this.options.onMouseMove);
			untrack(() => this.onResize());
			return () => {
				this.mounted = false;
				this.renderer?.gl.canvas.remove();
				if (this.container && this.gl && this.gl.canvas.parentNode === this.container) {
					this.container.removeChild(this.gl.canvas);
				}

				this.gl?.getExtension('WEBGL_lose_context')?.loseContext();
				this.renderer = null;
				this.container = null;
				this.canvas = null;
				this.gl = null;

				if (this.raf) cancelAnimationFrame(this.raf);
				this.raf = null;
				this.updateCallbacks.clear();
				this.resizeCallbacks.clear();
				this.mouseMoveCallbacks.clear();
				offResize();
			};
		}

		constructor(options: OglContextOptions) {
			this.options = options;
			setContext('ogl', this);
		}

		useResize = <T,>(context: T, callback?: ResizeCallback<T>) => {
			const cb: ResizeCallback<T> = ({ width, height }) => {
				callback?.({ width, height }, context);
			};
			if (callback) (this.resizeCallbacks.add(cb), this.onResize(cb));
			return onDestroy(() => {
				if (callback) this.resizeCallbacks.delete(cb);
			});
		};

		useUpdate = <T,>(context: T, callback?: UpdateCallback<T>) => {
			const cb: UpdateCallback<T> = ({ time }) => {
				callback?.({ time }, context);
			};
			if (callback) this.updateCallbacks.add(cb);
			return onDestroy(() => {
				if (callback) this.updateCallbacks.delete(cb);
			});
		};

		useMouseMove = <T,>(context: T, callback?: MouseMoveCallback<T>) => {
			const cb: MouseMoveCallback<T> = ({ x, y, rect, e }) => {
				callback?.({ x, y, rect, e }, context);
			};
			if (callback) this.mouseMoveCallbacks.add(cb);
			return onDestroy(() => {
				if (callback) this.mouseMoveCallbacks.delete(cb);
			});
		};

		usePointerDown = <T,>(context: T, callback?: MouseMoveCallback<T>) => {
			const cb: MouseMoveCallback<T> = ({ x, y, rect, e }) => {
				callback?.({ x, y, rect, e }, context);
			};
			if (callback) this.pointerDownCallbacks.add(cb);
			return onDestroy(() => {
				if (callback) this.pointerDownCallbacks.delete(cb);
			});
		};

		usePointerUp = <T,>(context: T, callback?: MouseMoveCallback<T>) => {
			const cb: MouseMoveCallback<T> = ({ x, y, rect, e }) => {
				callback?.({ x, y, rect, e }, context);
			};
			if (callback) this.pointerUpCallbacks.add(cb);
			return onDestroy(() => {
				if (callback) this.pointerUpCallbacks.delete(cb);
			});
		};

		useMouseEnter = <T,>(context: T, callback?: MouseMoveCallback<T>) => {
			const cb: MouseMoveCallback<T> = ({ x, y, rect, e }) => {
				callback?.({ x, y, rect, e }, context);
			};
			if (callback) this.mouseEnterCallbacks.add(cb);
			return onDestroy(() => {
				if (callback) this.mouseEnterCallbacks.delete(cb);
			});
		};

		useMouseLeave = <T,>(context: T, callback?: MouseMoveCallback<T>) => {
			const cb: MouseMoveCallback<T> = ({ x, y, rect, e }) => {
				callback?.({ x, y, rect, e }, context);
			};
			if (callback) this.mouseLeaveCallbacks.add(cb);
			return onDestroy(() => {
				if (callback) this.mouseLeaveCallbacks.delete(cb);
			});
		};
		// Colors utils
		color = {
			hexToArray: (hex: string): [number, number, number] => {
				const color = new Color(hex);
				return [color.r, color.g, color.b] as [number, number, number];
			}
		};
	}

	export const useOglContext = () => {
		const oglContext = getContext<OglContext>('ogl');
		if (!oglContext) throw new Error('No OglContext found');
		return oglContext;
	};
</script>

<script lang="ts">
	let {
		class: className = '',
		children,
		onResize,
		onUpdate,
		onMouseMove,
		onMount: om,
		canvasClassName,
		ogl = $bindable(),
		onMouseLeave,
		onMouseEnter,
		onPointerDown,
		onPointerUp,
		...rendererOptions
	}: {
		class?: string;
		children?: Snippet<[MountedOgl]>;
		onResize?: ResizeCallback<OglContext>;
		onUpdate?: UpdateCallback<OglContext>;
		onMouseMove?: MouseMoveCallback<OglContext>;
		onMount?: (context: MountedOgl) => void;
		canvasClassName?: string;
		ogl?: OglContext | null;
		onMouseLeave?: MouseMoveCallback<OglContext>;
		onMouseEnter?: MouseMoveCallback<OglContext>;
		onPointerDown?: MouseMoveCallback<OglContext>;
		onPointerUp?: MouseMoveCallback<OglContext>;
	} & Partial<Omit<RendererOptions, 'canvas'>> = $props();

	const oglContext = new OglContext({
		onMount: om,
		canvasClassName,
		onResize,
		onUpdate,
		onMouseMove
	});

	oglContext.useResize(oglContext, onResize);
	oglContext.useUpdate(oglContext, onUpdate);
	oglContext.useMouseMove(oglContext, onMouseMove);
	oglContext.useMouseLeave(oglContext, onMouseLeave);
	oglContext.useMouseEnter(oglContext, onMouseEnter);
	oglContext.usePointerDown(oglContext, onPointerDown);
	oglContext.usePointerUp(oglContext, onPointerUp);
	ogl = oglContext;
</script>

<div
	role="application"
	onmousemove={oglContext.onMouseMove}
	onmouseleave={oglContext.onMouseLeave}
	onmouseenter={oglContext.onMouseEnter}
	onpointerdown={oglContext.onPointerDown}
	class={className}
	{@attach (node) => oglContext.attachment(node, rendererOptions)}
	style:width="100%"
	style:max-width="100%"
	style:overflow="hidden"
	style:height="100%"
	style:display="block"
>
	{#if oglContext.mounted}
		{@render children?.(oglContext as MountedOgl)}
	{/if}
</div>
