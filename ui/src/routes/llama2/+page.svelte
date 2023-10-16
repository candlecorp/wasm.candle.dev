<script lang="ts">
	import BundleDownload from '../../components/BundleDownload.svelte';
	import { Alert, Button, Textarea } from 'flowbite-svelte';
	import { writable, type Writable } from 'svelte/store';

	import { decode, encode } from '@msgpack/msgpack';
	import { from } from 'rxjs';
	import { Packet, WasmRsComponent } from '@candlecorp/wick';
	import { instantiateComponentWorker } from '$lib/workers';
	import { bundles } from './bundles.js';
	import { onDestroy } from 'svelte';

	let selectedBundle = 'stories15M';

	const defaultMessage = 'One day';
	let prompt = defaultMessage;
	let generationHistory: Writable<Array<{ sender: string; message: string }>> = writable([]);
	enum State {
		Ready,
		Responding,
		Finished
	}
	let state = State.Ready;
	let textDiv: HTMLDivElement;

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
		generationHistory.update((value) => [
			...value,
			{ sender: 'prompt', message: prompt.trim() },
			{ sender: 'response', message: '' }
		]);
		const aiMessageIndex = $generationHistory.length;
		await invoke(prompt, aiMessageIndex - 1);
	}

	let component: WasmRsComponent | undefined;

	async function invoke(input: string, aiMessageIndex: number): Promise<void> {
		if (!component) {
			const c = await instantiateComponentWorker('/components/llama.signed.wasm');

			component = c;
		}
		const instance = await component.instantiate({
			config: {
				model_dir: '/',
				model: `${selectedBundle}.bin`,
				tokenizer: 'tokenizer.json'
			}
		});

		const stream = from([new Packet('prompt', encode(input)), Packet.Done('prompt')]);
		const result = await instance.invoke('generate', stream, { max_length: 512 });
		state = State.Responding;
		result.subscribe({
			next(packet) {
				if (!packet.data) {
					console.log('no data');
					return;
				}
				const word = decode(packet.data);
				generationHistory.update((value) => {
					const updatedValue = [...value];
					updatedValue[aiMessageIndex].message += word;
					scrollToBottom(textDiv);
					return updatedValue;
				});
			},
			complete() {
				state = State.Finished;
				console.log('done');
			},
			error(err) {
				state = State.Finished;
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

	onDestroy(() => {
		if (component) {
			component.terminate();
		}
	});
</script>

<div class="w-full flex justify-center">
	<div class="w-full w-3/5">
		<BundleDownload {bundles} bind:selectedBundle>
			<Button
				pill
				class="mt-2"
				disabled={!(bundles[selectedBundle] || {}).ready || state == State.Responding}
				on:click={handleSend}
			>
				Generate
			</Button>
		</BundleDownload>
	</div>
</div>
<div class="w-full mt-4 flex justify-center">
	<div class="w-full w-3/5">
		<div class="container mx-auto px-4">
			<div class="mx-auto">
				<form on:submit|preventDefault={handleSend}>
					<label for="prompt" class="sr-only">Prompt</label>
					<Alert color="dark" class="px-3 py-2 w-full">
						<svelte:fragment slot="icon">
							<Textarea
								id="prompt"
								class="mx-4 resize-none"
								rows="1"
								placeholder={defaultMessage}
								bind:value={prompt}
								on:input={autoGrow}
								on:keydown={checkKey}
								style="height: 2.85em; max-height: 10em; overflow-y: auto;"
							/>
						</svelte:fragment>
					</Alert>
				</form>
			</div>
		</div>
		<div class="container mx-auto px-4">
			<div class="mx-auto">
				<div class="h-96 overflow-y-auto p-4 border rounded shadow" bind:this={textDiv}>
					{#each $generationHistory as { sender, message }, index}
						{#if sender === 'prompt'}
							<span class="text-gray-400">{message}</span>
						{:else}
							{message}
							<br />
							<br />
						{/if}
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>
