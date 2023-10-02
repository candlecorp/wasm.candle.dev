<script lang="ts">
	import { Button, Label, Progressbar, Select, Toast } from 'flowbite-svelte';
	import { slide } from 'svelte/transition';
	import { CheckCircleSolid } from 'flowbite-svelte-icons';
	import { writable } from 'svelte/store';

	interface Model {
		value: string;
		name: string;
	}

	export let models: Model[] = [];
	let selectedModel: string = '';

	let downloadPercentage = writable(0);

	const worker = new Worker('/fsworker.js');

	worker.onmessage = (e) => {
		if (e.data.percentage !== undefined) {
			downloadPercentage.set(e.data.percentage);
		} else if (e.data.error !== undefined) {
			console.error('Error from worker:', e.data.error);
		}
	};

	let open = false;
	let counter = 6;

	function trigger() {
		open = true;
		counter = 6;
		timeout();
	}

	function timeout() {
		if (--counter > 0) return setTimeout(timeout, 1000);
		open = false;
	}

	function startDownload() {
		const path = selectedModel;
		worker.postMessage({ path });
	}

	$: if ($downloadPercentage === 100) trigger();
</script>

<!-- Toast Container -->
<div class="fixed inset-x-0 top-0 flex justify-center z-50">
	<Toast dismissable={false} transition={slide} bind:open>
		<CheckCircleSolid slot="icon" class="w-4 h-4" />
		Download Complete!
	</Toast>
</div>

<!-- Main Content Container -->
<div class="flex flex-col justify-center">
	<div class="w-full items-center">
		<form on:submit|preventDefault={startDownload} class="text-center">
			<Label for="chat" class="block">AI Model:</Label>
			<Select items={models} bind:value={selectedModel} />
			<Button pill class="mt-2" type="submit">Download Model</Button>
		</form>
	</div>
	<div class="w-full text-center">
		{#if $downloadPercentage === 100}
			<Progressbar class="mt-2" color="green" progress={$downloadPercentage} />
		{:else}
			<Progressbar class="mt-2" progress={$downloadPercentage} />
		{/if}
	</div>
</div>
