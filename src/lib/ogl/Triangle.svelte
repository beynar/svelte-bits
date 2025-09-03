<script lang="ts" module>
	import { getContext, onMount, setContext, type Snippet } from 'svelte';
	import {
		useOglContext,
		type MouseMoveCallback,
		type OglContext,
		type ResizeCallback,
		type UpdateCallback
	} from './Canvas.svelte';
	import type { AttributeMap as GeometryOptions } from './types/core/Geometry.js';
	import { Triangle } from 'ogl';

	export class OglTriangle {
		type = 'triangle' as const;
		ogl: OglContext;
		id: string;
		triangle: Triangle;
		onMount?: (triangle: OglTriangle) => void;
		constructor(
			ogl: OglContext,
			id: string,
			triangleOptions?: GeometryOptions,
			om?: (triangle: OglTriangle) => void
		) {
			this.ogl = ogl;
			this.id = id;
			this.triangle = new Triangle(ogl.gl!, triangleOptions);
			setContext('triangle', this);
			ogl.addChild(this);
			om?.(this);
		}
	}
</script>

<script lang="ts">
	let {
		id: customId,
		onResize,
		onUpdate,
		onMouseMove,
		attributes: triangleOptions,
		children,
		onMount: om
	}: {
		id?: string;
		onResize?: ResizeCallback<OglTriangle>;
		onUpdate?: UpdateCallback<OglTriangle>;
		onMouseMove?: MouseMoveCallback<OglTriangle>;
		attributes?: GeometryOptions;
		children?: Snippet<[OglTriangle]>;
		onMount?: (triangle: OglTriangle) => void;
	} = $props();
	const ogl = useOglContext();
	let id = $props.id();
	const triangle = new OglTriangle(ogl, customId || id, triangleOptions, om);

	ogl.useResize(triangle, onResize);
	ogl.useUpdate(triangle, onUpdate);
	ogl.useMouseMove(triangle, onMouseMove);

	$effect(() => {
		if (triangleOptions) {
			Object.keys(triangleOptions).forEach((key) => {
				Object.assign(triangle.triangle, key, triangleOptions[key as keyof typeof triangleOptions]);
			});
		}
	});
</script>

{@render children?.(triangle)}
