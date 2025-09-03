<script lang="ts" module>
	import { getContext, onMount, setContext, tick, type Snippet } from 'svelte';
	import {
		useOglContext,
		type MouseMoveCallback,
		type OglContext,
		type ResizeCallback,
		type UpdateCallback
	} from './Canvas.svelte';
	import type { AttributeMap as GeometryOptions } from './types/core/Geometry.js';
	import { Geometry } from 'ogl';

	export class OglGeometry {
		type = 'geometry' as const;
		ogl: OglContext;
		id: string;
		geometry: Geometry;
		constructor(
			ogl: OglContext,
			id: string,
			geometryOptions?: GeometryOptions,
			om?: (context: OglGeometry) => void
		) {
			this.ogl = ogl;
			this.id = id;
			this.geometry = new Geometry(ogl.gl!, geometryOptions);
			setContext('geometry', this);
			ogl.addChild(this);
			om?.(this);
		}

		update(geometryOptions?: GeometryOptions, om?: (context: OglGeometry) => void) {
			if (!geometryOptions) return;
			// Store one VAO per program attribute locations order
			this.geometry.VAOs = {};
			this.geometry.drawRange = { start: 0, count: 0 };
			this.geometry.instancedCount = 0;
			// Unbind current VAO so that new buffers don't get added to active mesh
			this.ogl.gl!.renderer.bindVertexArray(null);
			this.ogl.gl!.renderer.currentGeometry = null;
			this.geometry.attributes = geometryOptions;
			for (let key in geometryOptions) {
				this.geometry.addAttribute(key, geometryOptions[key]);
			}
		}
	}
</script>

<script lang="ts">
	let {
		id: customId,
		onResize,
		onUpdate,
		onMouseMove,
		onMount: om,
		attributes: geometryOptions,
		children
	}: {
		id?: string;
		onResize?: ResizeCallback<OglGeometry>;
		onUpdate?: UpdateCallback<OglGeometry>;
		onMouseMove?: MouseMoveCallback<OglGeometry>;
		onMount?: (context: OglGeometry) => void;
		attributes?: GeometryOptions;
		children?: Snippet<[OglGeometry]>;
	} = $props();
	const ogl = useOglContext();
	let id = $props.id();
	const geometry = new OglGeometry(ogl, customId || id, geometryOptions, om);

	ogl.useResize(geometry, onResize);
	ogl.useUpdate(geometry, onUpdate);
	ogl.useMouseMove(geometry, onMouseMove);

	$effect(() => {
		if (geometryOptions) {
			geometry.update(geometryOptions);
		}
	});
</script>

{@render children?.(geometry)}
