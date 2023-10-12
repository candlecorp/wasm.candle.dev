<script context="module" lang="ts">
	export interface BundleEntry {
		label: string;
		files: FileEntry[];
	}
</script>

<script lang="ts">
	import { Button, Label, Progressbar, Select, Toast } from 'flowbite-svelte';
	import { writable, type Writable } from 'svelte/store';
	import { fs } from '$lib/fs.js';
	import type { FetchError, FetchProgress } from '$lib/fs/events.js';
	import type { FileEntry } from '$lib/fs/types.js';

	interface SelectOption {
		value: string;
		name: string;
	}

	export let bundles: Record<string, BundleEntry> = {};
	export let selectedBundle: string = Object.entries(bundles)[0][0] || '';

	let selectOptions: SelectOption[] = Object.entries(bundles).map(([key, value]) => ({
		value: key,
		name: value.label
	}));

	let downloadPercentage: Writable<Record<string, number>> = writable({});

	let downloading = false;

	function resetState() {
		downloading = false;
		downloadPercentage.set({});
	}

	async function startDownload() {
		downloading = true;
		const bundle = bundles[selectedBundle];
		const path = selectedBundle;
		downloadPercentage.set(Object.fromEntries(bundle.files.map((entry) => [entry.path, 0])));
		for (let i = 0; i < bundle.files.length; i++) {
			const file = bundle.files[i];
			const request = await fs.fetch(file);
			request.on('progress', (evt: FetchProgress) => {
				downloadPercentage.update((v) => {
					v[bundle.files[i].path] = evt.progress;
					let allDone = true;
					for (const entry of bundle.files) {
						if (v[entry.path] !== 100) {
							allDone = false;
							break;
						}
					}
					return v;
				});
			});
			request.on('error', (evt: FetchError) => {
				downloading = false;
				console.error('Error from worker:', evt.message);
			});
		}
	}
</script>

<!-- Main Content Container -->
<div class="flex flex-col justify-center">
	<div class="w-full items-center">
		<form on:submit|preventDefault={startDownload} class="text-center">
			<Select items={selectOptions} bind:value={selectedBundle} on:change={resetState} />
			{#if !downloading}
				<Button pill class="mt-2" type="submit">Download Files</Button>
			{/if}
		</form>
	</div>

	<div class="w-full text-center">
		{#each Object.entries($downloadPercentage) as [path, pct]}
			<span class="pr-5 pl-5 mt-0">
				{#if pct === 100}
					<Progressbar progress={pct} color="green" labelOutside={path} />
				{:else if pct === undefined}
					<Progressbar progress={5} color="yellow" labelOutside={path} />
				{:else}
					<Progressbar progress={pct} labelOutside={path} />
				{/if}
			</span>
		{/each}
	</div>
</div>
