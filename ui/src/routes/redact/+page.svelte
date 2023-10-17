<script lang="ts">
	import { decode, encode } from '@msgpack/msgpack';
	import { Button, Textarea } from 'flowbite-svelte';
	import { from } from 'rxjs';
	import { Packet, WasmRsComponent } from '@candlecorp/wick';
	import { instantiateComponentWorker } from '$lib/workers';
	import { onDestroy } from 'svelte';
	import Section from '../../components/Section.svelte';
	import { description, header } from '../../styles';
	import Terminal from '../../components/Terminal.svelte';
	import { cli } from './wick-output.js';

	let inputObj = {
		name: 'John',
		age: 30,
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

<h1 class={header}>Text Redaction component</h1>
<Section>
	<p class={description}>
		This demo uses the <strong>common/redact</strong> Wick component to redact text matching an expression.
	</p>
	<p class={description}>
		It uses the
		<a href="https://github.com/candlecorp/wick">Wick framework</a> to compile a regular expression engine
		into WebAssembly. It demonstrates a way to have 100% consistent processing across environments using
		the same configuration.
	</p>
</Section>
<Section header="Online demo">
	<div class="flex flex-col">
		<Textarea id="input" class="h-48 font-mono" placeholder={sampleInput} bind:value={input} />
		<Button on:click={validateInput} class="m-2">Redact</Button>
		<Textarea
			id="input"
			class=" h-48 font-mono"
			placeholder="After Validation"
			bind:value={validated}
		/>
	</div>
</Section>
<Section header="On the command line">
	<p class="mt-2">Use the following command to run this in your terminal:</p>
	<Terminal
		lines={[
			{
				command: 'wick invoke common/redact:0.0.1 --op-with=@config.json regex -- --input="[DATA]"',
				output: ''
			}
		]}
	/>
	<p class="mt-2">For example:</p>
	<Terminal lines={cli} />
</Section>
