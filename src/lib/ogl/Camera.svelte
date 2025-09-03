<script lang="ts" module>
	import { setContext, type Snippet } from 'svelte';
	import {
		useOglContext,
		type MouseMoveCallback,
		type OglContext,
		type ResizeCallback,
		type UpdateCallback
	} from './Canvas.svelte';
	import type { CameraOptions } from './types/core/Camera.js';
	import { Camera } from 'ogl';

	export class OglCamera {
		type = 'geometry' as const;
		ogl: OglContext;
		id: string;
		camera: Camera;
		constructor(
			ogl: OglContext,
			id: string,
			cameraOptions?: Partial<CameraOptions>,
			om?: (context: OglCamera) => void
		) {
			this.ogl = ogl;
			this.id = id;
			this.camera = new Camera(ogl.gl!, cameraOptions);
			setContext('camera', this);
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
		onMount: om,
		children,
		...cameraOptions
	}: {
		id?: string;
		onResize?: ResizeCallback<OglCamera>;
		onUpdate?: UpdateCallback<OglCamera>;
		onMouseMove?: MouseMoveCallback<OglCamera>;
		onMount?: (context: OglCamera) => void;
		children?: Snippet<[OglCamera]>;
	} & Partial<CameraOptions> = $props();
	const ogl = useOglContext();
	let id = $props.id();
	const camera = new OglCamera(ogl, customId || id, cameraOptions, om);

	ogl.useResize(camera, onResize);
	ogl.useUpdate(camera, onUpdate);
	ogl.useMouseMove(camera, onMouseMove);

	$effect(() => {
		if (cameraOptions) {
			Object.keys(cameraOptions).forEach((key) => {
				Object.assign(camera.camera, key, cameraOptions[key as keyof typeof cameraOptions]);
			});
		}
	});
</script>

{@render children?.(camera)}
