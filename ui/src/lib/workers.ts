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
		case WorkerKind.Component:
			worker = new Worker(new URL(`$lib/component/worker.js`, import.meta.url), { type: 'module' });
			break;

		default:
			throw new Error(`Unknown worker: ${id}`);
	}
	workers.set(id, worker);
	return worker;
}
