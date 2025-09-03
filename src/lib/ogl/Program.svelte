<script lang="ts" module>
	import { getContext, onMount, setContext, type Snippet } from 'svelte';
	import {
		useOglContext,
		type OglContext,
		type ResizeCallback,
		type UpdateCallback,
		type MouseMoveCallback
	} from './Canvas.svelte';
	import { Program } from 'ogl';
	import type { ProgramOptions } from './types/core/Program.js';

	export class OglProgram {
		type = 'program' as const;
		ogl: OglContext;
		id: string;
		program: Program;
		constructor(
			ogl: OglContext,
			id: string,
			programOptions: Partial<ProgramOptions> & {
				vertex: string;
				fragment: string;
			},
			om?: (context: OglProgram) => void
		) {
			this.ogl = ogl;
			this.id = id;
			this.program = new Program(ogl.gl!, programOptions);
			setContext('program', this);
			ogl.addChild(this);
			om?.(this);
		}
	}

	export const useProgramContext = () => {
		const program = getContext<OglProgram>('program');
		if (!program) throw new Error('No ProgramContext found');
		return program;
	};
</script>

<script lang="ts">
	let {
		id: customId,
		onResize,
		onUpdate,
		onMouseMove,
		onMount: om,
		children,
		...programOptions
	}: {
		id?: string;
		onResize?: ResizeCallback<OglProgram>;
		onUpdate?: UpdateCallback<OglProgram>;
		onMouseMove?: MouseMoveCallback<OglProgram>;
		onMount?: (context: OglProgram) => void;
		children?: Snippet<[OglProgram]>;
	} & Partial<ProgramOptions> & {
			vertex: string;
			fragment: string;
		} = $props();
	const ogl = useOglContext();
	let id = $props.id();
	const program = new OglProgram(ogl, customId || id, programOptions, om);

	ogl.useResize(program, onResize);
	ogl.useUpdate(program, onUpdate);
	ogl.useMouseMove(program, onMouseMove);

	$effect(() => {
		console.log('programOptions');
		Object.keys(programOptions).forEach((key) => {
			Object.assign(program.program, key, programOptions[key as keyof typeof programOptions]);
		});
	});
</script>

{@render children?.(program)}
