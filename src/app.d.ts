// See https://svelte.dev/docs/kit/types#app.d.ts

import type { Geometry } from '$lib/ogl/types/core/Geometry.js';
import type { Program } from '$lib/ogl/types/core/Program.js';
import type { Renderer } from '$lib/ogl/types/core/Renderer.js';
import type { Camera } from '$lib/ogl/types/core/Camera.js';
import type { Mesh } from '$lib/ogl/types/core/Mesh.js';
import type { Texture } from '$lib/ogl/types/core/Texture.js';
import type { RenderTarget } from '$lib/ogl/types/core/RenderTarget.js';
import type { Transform } from '$lib/ogl/types/core/Transform.js';
import type { Color } from '$lib/ogl/types/math/Color.js';
import type { Triangle } from '$lib/ogl/types/extras/Triangle.js';

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
