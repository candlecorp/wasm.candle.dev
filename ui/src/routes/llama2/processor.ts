import { instantiateComponentWorker } from '$lib/workers';
import { Packet, type WasmRsComponent } from '@candlecorp/wick';
import { encode } from '@msgpack/msgpack';
import { Observable, from } from 'rxjs';

let component: WasmRsComponent | undefined;

export async function invoke(model: string, input: string): Promise<Observable<Packet>> {
	if (!component) {
		const c = await instantiateComponentWorker('/components/llama.signed.wasm');

		component = c;
	}
	const instance = await component.instantiate({
		config: {
			model_dir: '/',
			model: `${model}.bin`,
			tokenizer: 'tokenizer.json'
		}
	});

	const stream = from([new Packet('prompt', encode(input)), Packet.Done('prompt')]);
	const result = await instance.invoke('generate', stream, { max_length: 512 });
	return result;
}

export function cleanup() {
	if (component) {
		component.terminate();
		component = undefined;
	}
}
