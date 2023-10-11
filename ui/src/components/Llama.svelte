<script lang="ts">
	import { Alert, Button, Textarea } from 'flowbite-svelte';
	import { PapperPlaneOutline } from 'flowbite-svelte-icons';
	import { writable, type Writable } from 'svelte/store';

	import { decode, encode } from '@msgpack/msgpack';
	import { from } from 'rxjs';
	import { Packet, Wick, wasi } from 'wick-js';

	export let bundleName: string;

	async function instantiateComponent() {
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

		let wasm = await (await fetch('/infer.signed.wasm')).arrayBuffer();

		try {
			const workerUrl = new URL('../lib/component-worker.ts', import.meta.url);
			const component = await Wick.Component.WasmRs.FromBytes(wasm, { wasi: wasiOpts, workerUrl });

			const config = {
				config: {
					model_dir: '/',
					model: `${bundleName}.bin`,
					tokenizer: 'tokenizer.json'
				}
			};
			console.log({ config });

			const instance = await component.instantiate(config);
			return instance;
		} catch (e) {
			console.error(`Error instantiating component: ${e}`);
		}
	}

	let message = 'Once upon a time, in a land far away...';
	let chatHistory: Writable<Array<{ sender: string; message: string }>> = writable([]);
	let isResponding = false;
	let chatDiv: HTMLDivElement;

	const scrollToBottom = async (node: HTMLDivElement) => {
		node.scroll({ top: node.scrollHeight, behavior: 'smooth' });
	};

	function autoGrow(e: Event): void {
		const target = e.target as HTMLTextAreaElement;
		target.style.height = 'inherit';
		const newHeight = target.scrollHeight;
		target.style.height = newHeight + 'px';
	}

	async function handleSend() {
		const aiMessageIndex = $chatHistory.length;
		chatHistory.update((value) => [...value, { sender: 'prompt', message }]);
		isResponding = true;
		await getAIResponse(message, aiMessageIndex);
		isResponding = false;
		message = '';
	}

	async function getAIResponse(input: string, aiMessageIndex: number): Promise<void> {
		const inst = await instantiateComponent();
		if (!inst) {
			console.log('no instance running');
			return;
		}

		const stream = from([new Packet('prompt', encode(input)), Packet.Done('prompt')]);
		const result = await inst.invoke('generate', stream, { max_length: 512 });

		result.subscribe({
			next(packet) {
				if (!packet.data) {
					console.log('no data');
					return;
				}
				const word = decode(packet.data);
				chatHistory.update((value) => {
					const updatedValue = [...value];
					updatedValue[aiMessageIndex].message += word;
					scrollToBottom(chatDiv);
					return updatedValue;
				});
			},
			complete() {
				console.log('done');
			},
			error(err) {
				console.log('error', err);
			}
		});
	}

	function checkKey(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	}
</script>

<div class="container mx-auto px-4">
	<div class="mx-auto">
		<div class="h-96 overflow-y-auto p-4 border rounded shadow" bind:this={chatDiv}>
			{#each $chatHistory as { sender, message }, index}
				<div class="{sender} mb-2">
					{#if sender === 'prompt'}
						<span class="text-gray-400">{message}</span>
					{:else}
						{message}
					{/if}
				</div>
			{/each}
		</div>
	</div>
</div>

<div class="container mx-auto px-4">
	<div class="mx-auto">
		<form on:submit|preventDefault={handleSend}>
			<label for="chat" class="sr-only">Prompt</label>
			<Alert color="dark" class="px-3 py-2 w-full">
				<svelte:fragment slot="icon">
					<Textarea
						id="chat"
						class="mx-4 resize-none"
						rows="1"
						placeholder="Once upon a time, in a land far away..."
						bind:value={message}
						on:input={autoGrow}
						on:keydown={checkKey}
						style="height: 2.85em; max-height: 10em; overflow-y: auto;"
					/>
					<Button
						type="submit"
						class="bg-red-500 rounded-full text-white dark:text-gray-300 p-2 ml-2"
						disabled={isResponding}
					>
						<PapperPlaneOutline class="w-5 h-5 rotate-45" />
						<span class="sr-only">Generate</span>
					</Button>
				</svelte:fragment>
			</Alert>
		</form>
	</div>
</div>
