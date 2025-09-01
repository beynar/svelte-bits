<script lang="ts" module>
	/**
	 * Knob component for dynamic input controls
	 * Supports multiple input types with proper TypeScript typing
	 */

	// Base input types
	export type ColorInput = {
		type: 'color';
		value: string;
	};

	export type RangeInput = {
		type: 'range';
		min: number;
		max: number;
		step: number;
		value: number;
	};

	export type CheckboxInput = {
		type: 'checkbox';
		value: boolean;
	};

	export type SelectInput = {
		type: 'select';
		options: string[];
		value: string;
	};

	export type TextInput = {
		type: 'text';
		value: string;
	};

	// Union type for all input types
	export type InputType = ColorInput | RangeInput | CheckboxInput | SelectInput | TextInput;

	// Main inputs type - a record of string keys to input types
	export type Inputs = Record<string, InputType>;

	// Utility types for type guards
	export type InputKey<T extends Inputs> = keyof T;
	export type InputValue<T extends Inputs, K extends InputKey<T>> = T[K];

	// Type guards for runtime type checking
	export const isColorInput = (input: InputType): input is ColorInput => input.type === 'color';
	export const isRangeInput = (input: InputType): input is RangeInput => input.type === 'range';
	export const isCheckboxInput = (input: InputType): input is CheckboxInput =>
		input.type === 'checkbox';
	export const isSelectInput = (input: InputType): input is SelectInput => input.type === 'select';
	export const isTextInput = (input: InputType): input is TextInput => input.type === 'text';

	// Preset type
	export type Preset = {
		name: string;
		value: Record<string, any>;
	};
</script>

<script lang="ts" generics="T extends Inputs">
	let {
		inputs = $bindable(),
		class: className = '',
		presets = []
	}: {
		inputs: T;
		class?: string;
		disabled?: boolean;
		presets?: Preset[];
	} = $props();
</script>

<div
	class="flex flex-col gap-4 rounded-lg p-4 backdrop-blur-sm {className}"
	style="
		border: 1px solid var(--border);
		background: rgba(248, 250, 252, 0.1);
		background: rgba(var(--bg-rgb, 248, 250, 252), 0.1);
	"
>
	{#each Object.entries(inputs) as [key, value] (key)}
		<div class="flex items-center gap-2">
			<label
				class="text-sm font-semibold tracking-wide capitalize"
				for={key}
				style="color: var(--fg);">{key}</label
			>
			{#if value.type === 'color'}
				<input
					class="h-10 w-12 cursor-pointer rounded border-0"
					type="color"
					id={key}
					bind:value={inputs[key].value}
					style="background: transparent;"
				/>
			{:else if value.type === 'range'}
				<div class="flex items-center gap-3">
					<input
						class="knob-input-range h-2 w-full flex-1 cursor-pointer appearance-none rounded-lg bg-border"
						type="range"
						id={key}
						min={value.min}
						max={value.max}
						step={value.step}
						bind:value={inputs[key].value}
					/>
					<span
						class="min-w-8 rounded px-2 py-1 text-center text-sm font-semibold"
						style="
							color: var(--accent);
							background: rgba(192, 125, 0, 0.1);
							background: rgba(var(--accent-rgb, 192, 125, 0), 0.1);
							border: 1px solid rgba(192, 125, 0, 0.3);
							border: 1px solid rgba(var(--accent-rgb, 192, 125, 0), 0.3);
						">{value.value}</span
					>
				</div>
			{:else if value.type === 'checkbox'}
				<input
					class="h-5 w-5 cursor-pointer"
					type="checkbox"
					id={key}
					bind:checked={inputs[key].value as boolean}
					style="accent-color: var(--accent);"
				/>
			{:else if value.type === 'select'}
				<select
					class="cursor-pointer appearance-none rounded px-3 py-2 pr-10 backdrop-blur-sm transition-all duration-200"
					id={key}
					bind:value={inputs[key].value}
					style="
						border: 1px solid var(--border);
						background: rgba(248, 250, 252, 0.1);
						background: rgba(var(--bg-rgb, 248, 250, 252), 0.1);
						color: var(--fg);
					"
					onfocus={(e) => {
						e.currentTarget.style.borderColor = 'var(--accent)';
						e.currentTarget.style.boxShadow = '0 0 0 2px rgba(var(--accent-rgb), 0.2)';
						e.currentTarget.style.background = 'rgba(var(--bg-rgb), 0.15)';
					}}
					onblur={(e) => {
						e.currentTarget.style.borderColor = 'var(--border)';
						e.currentTarget.style.boxShadow = 'none';
						e.currentTarget.style.background = 'rgba(var(--bg-rgb), 0.1)';
					}}
				>
					{#each value.options as option}
						<option value={option}>{option}</option>
					{/each}
				</select>
			{:else if value.type === 'text'}
				<input
					class="w-full rounded px-3 py-2 backdrop-blur-sm transition-all duration-200 focus:outline-none"
					type="text"
					id={key}
					bind:value={inputs[key].value}
					style="
						border: 1px solid var(--border);
						background: rgba(248, 250, 252, 0.1);
						background: rgba(var(--bg-rgb, 248, 250, 252), 0.1);
						color: var(--fg);
					"
					onfocus={(e) => {
						e.currentTarget.style.borderColor = 'var(--accent)';
						e.currentTarget.style.boxShadow = '0 0 0 2px rgba(var(--accent-rgb), 0.2)';
						e.currentTarget.style.background = 'rgba(var(--bg-rgb), 0.15)';
					}}
					onblur={(e) => {
						e.currentTarget.style.borderColor = 'var(--border)';
						e.currentTarget.style.boxShadow = 'none';
						e.currentTarget.style.background = 'rgba(var(--bg-rgb), 0.1)';
					}}
				/>
			{/if}
		</div>
	{/each}

	{#if presets.length > 0}
		<div class="flex flex-col gap-2">
			<h4 class="text-sm font-semibold tracking-wide" style="color: var(--fg);">Presets</h4>
			<div class="grid grid-cols-2 gap-2">
				{#each presets as preset}
					<button
						class="rounded px-3 py-2 text-sm font-medium transition-all duration-200"
						onclick={() => {
							// Apply preset values to existing inputs
							Object.entries(preset.value).forEach(([key, value]) => {
								if (inputs[key]) {
									inputs[key].value = value;
								}
							});
						}}
						style="
							border: 1px solid var(--border);
							background: rgba(248, 250, 252, 0.05);
							background: rgba(var(--bg-rgb, 248, 250, 252), 0.05);
							color: var(--fg);
						"
						onmouseenter={(e) => {
							e.currentTarget.style.borderColor = 'var(--accent)';
							e.currentTarget.style.background = 'rgba(var(--bg-rgb, 248, 250, 252), 0.1)';
						}}
						onmouseleave={(e) => {
							e.currentTarget.style.borderColor = 'var(--border)';
							e.currentTarget.style.background = 'rgba(var(--bg-rgb, 248, 250, 252), 0.05)';
						}}
					>
						{preset.name}
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>
