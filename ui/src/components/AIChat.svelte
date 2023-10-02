<script lang="ts">
	import { Textarea, Alert, Button, Label, Select } from 'flowbite-svelte';
	import { PapperPlaneOutline } from 'flowbite-svelte-icons';
	import { writable, type Writable } from 'svelte/store';

	let message = '';
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
		chatHistory.update((value) => [...value, { sender: 'user', message }]);
		const aiMessageIndex = $chatHistory.length;
		chatHistory.update((value) => [...value, { sender: 'AI', message: '' }]);
		isResponding = true;
		await getAIResponse(message, aiMessageIndex);
		isResponding = false;
		message = '';
	}

	function getAIResponse(input: string, aiMessageIndex: number): Promise<void> {
		const words = ['This', 'is', 'a', 'simulated', 'response', 'from', 'the', 'AI.'];
		let index = 0;

		return new Promise((resolve) => {
			const wordStream = setInterval(() => {
				if (index < words.length) {
					const word = words[index];
					chatHistory.update((value) => {
						const updatedValue = [...value];
						updatedValue[aiMessageIndex].message += (index === 0 ? '' : ' ') + word;
						scrollToBottom(chatDiv);
						return updatedValue;
					});
					index++;
				} else {
					clearInterval(wordStream);
					resolve();
				}
			}, 200);
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
					<strong>{sender}:</strong>
					{message}
				</div>
			{/each}
		</div>
	</div>
</div>

<div class="container mx-auto px-4">
	<div class="mx-auto">
		<form on:submit|preventDefault={handleSend}>
			<label for="chat" class="sr-only">Your message</label>
			<Alert color="dark" class="px-3 py-2 w-full">
				<svelte:fragment slot="icon">
					<Textarea
						id="chat"
						class="mx-4 resize-none"
						rows="1"
						placeholder="Your message..."
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
						<span class="sr-only">Send message</span>
					</Button>
				</svelte:fragment>
			</Alert>
		</form>
	</div>
</div>
