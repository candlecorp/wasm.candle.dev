import { WasmRsComponentInstance, Wick } from '@candlecorp/wick';
import { wasi } from 'wasmrs-js';
import ComponentWorker from './component-worker.js?worker&url';

import { dev } from '$app/environment';

const workers = new Map<string, Worker>();

export enum WorkerKind {
	Fs,
	Component
}

export function loadWorker(id: string, kind: WorkerKind) {
	if (workers.has(id)) return workers.get(id)!;
	let worker;
	// Can't dynamically create these urls because it breaks vite.
	switch (kind) {
		case WorkerKind.Fs:
			worker = new Worker(new URL(`$lib/fs/worker.js`, import.meta.url), { type: 'module' });
			break;
		default:
			throw new Error(`Unknown worker: ${id}`);
	}
	workers.set(id, worker);
	return worker;
}

export async function instantiateComponentWorker(
	wasmUrl: string,
	componentConfig: unknown
): Promise<WasmRsComponentInstance> {
	const wasiOpts: wasi.WasiOptions = {
		version: wasi.WasiVersions.SnapshotPreview1,
		args: [],
		env: { RUST_LOG: 'trace' },
		preopens: {
			'/': 'opfs:/'
		},
		stdin: 0,
		stdout: 1,
		stderr: 2
	};

	// const wasm = await (await fetch(wasmUrl)).arrayBuffer();
	const wasm = await fetch(wasmUrl);

	try {
		let workerUrl: URL;
		if (dev) {
			workerUrl = new URL('$lib/component-worker.js', import.meta.url);
		} else {
			workerUrl = new URL(ComponentWorker, import.meta.url);
		}

		const component = await Wick.Component.WasmRs.FromResponse(wasm, { wasi: wasiOpts, workerUrl });
		// const component = await Wick.Component.WasmRs.FromBytes(wasm, { wasi: wasiOpts, workerUrl });
		const config = {
			config: componentConfig
		};

		const instance = await component.instantiate(config);
		return instance;
	} catch (e) {
		console.error(`Error instantiating component`, e);
		throw e;
	}
}
