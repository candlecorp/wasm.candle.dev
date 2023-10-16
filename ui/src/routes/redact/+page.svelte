<script lang="ts">
	import { decode, encode } from '@msgpack/msgpack';
	import { Button, Textarea } from 'flowbite-svelte';
	import { from } from 'rxjs';
	import { Packet, WasmRsComponent } from '@candlecorp/wick';
	import { getComponentInstance, instantiateComponentWorker } from '$lib/workers';
	import { onDestroy } from 'svelte';

	let inputObj = {
		name: 'John',
		age: 'thirty',
		email: 'john@somewhere.com',
		ssn: '123-45-6789',
		ccn: '1234-5678-9012-3456'
	};

	let sampleInput = JSON.stringify(inputObj, null, 4);

	let input = sampleInput;
	let validated = '';

	let component: WasmRsComponent | undefined;

	async function validateInput(e: MouseEvent): Promise<void> {
		if (!component) {
			const c = await instantiateComponentWorker('/components/redact.signed.wasm');
			component = c;
		}
		const instance = await component.instantiate({ config: {} });

		const stream = from([new Packet('input', encode(sampleInput)), Packet.Done('input')]);
		const result = await instance.invoke('regex', stream, {
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
	onDestroy(() => {
		if (component) {
			component.terminate();
		}
	});
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
