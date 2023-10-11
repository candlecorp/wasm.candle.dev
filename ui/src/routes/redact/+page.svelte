<script lang="ts">
	import { decode, encode } from '@msgpack/msgpack';
	import { Button, Textarea } from 'flowbite-svelte';
	import { from } from 'rxjs';
	import { Packet, Wick, wasi } from 'wick-js';

	async function instantiateComponent() {
		const wasiOpts: wasi.WasiOptions = {
			version: wasi.WasiVersions.SnapshotPreview1,
			args: [],
			stdin: 0,
			stdout: 1,
			stderr: 2
		};

		let wasm = await (await fetch('/redact.signed.wasm')).arrayBuffer();

		try {
			const workerUrl = new URL('../../lib/component-worker.ts', import.meta.url);
			const component = await Wick.Component.WasmRs.FromBytes(wasm, { wasi: wasiOpts, workerUrl });

			const ctx = {
				config: {}
			};

			const instance = await component.instantiate(ctx);
			return instance;
		} catch (e) {
			console.error(`Error instantiating component: ${e}`);
		}
	}

	let input = '';
	let validated = '';

	let inputObj = {
		name: 'John',
		age: 'thirty',
		email: 'john@somewhere.com',
		ssn: '123-45-6789',
		ccn: '1234-5678-9012-3456'
	};

	let sampleInput = JSON.stringify(inputObj, null, 4);

	async function validateInput(e: MouseEvent): Promise<void> {
		const inst = await instantiateComponent();
		if (!inst) {
			console.log('no instance running');
			return;
		}

		const stream = from([new Packet('input', encode(sampleInput)), Packet.Done('input')]);
		const result = await inst.invoke('regex', stream, {
			append_hash: true,
			patterns: [
				'\\b\\d\\d\\d-\\d\\d-\\d\\d\\d\\d\\b',
				'\\b\\d\\d\\d\\d-\\d\\d\\d\\d-\\d\\d\\d\\d-\\d\\d\\d\\d\\b',
				'\\b[a-zA-Z-.]+@([a-zA-Z-]+.)+[a-zA-Z-]{2,}\\b'
			]
		});

		result.subscribe({
			next(packet) {
				if (!packet.data) {
					console.log('no data');
					return;
				}
				const word = decode(packet.data) as string;
				validated = word;
			},
			complete() {
				console.log('done');
			},
			error(err) {
				console.log('error', err);
			}
		});
	}
</script>

<div class="w-full flex flex-col justify-center items-center">
	<div class="w-3/5">
		<div>
			<Textarea
				id="input"
				class="mx-4 resize-none"
				rows="1"
				placeholder={sampleInput}
				bind:value={input}
				style="height: 12em; max-height: 20em; overflow-y: auto;"
			/>
		</div>
	</div>
	<div class="flex justify-center mt-2"><Button on:click={validateInput}>Validate</Button></div>
	<div class="w-3/5 mt-2">
		<div>
			<Textarea
				id="input"
				class="mx-4 resize-none"
				rows="1"
				placeholder="After Validation"
				bind:value={validated}
				style="height: 12em; max-height: 20em; overflow-y: auto;"
			/>
		</div>
	</div>
</div>
