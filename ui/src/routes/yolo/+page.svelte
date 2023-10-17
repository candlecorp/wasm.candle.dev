<script lang="ts">
	import { Button, Dropzone } from 'flowbite-svelte';
	import { onDestroy } from 'svelte';
	import BundleDownload from '../../components/BundleDownload.svelte';
	import { bytesToBase64 } from '$lib/base64';
	import { bundles } from './bundles.js';
	import { cli } from './wick-output.js';
	import Terminal from '../../components/Terminal.svelte';
	import Section from '../../components/Section.svelte';
	import { Processor, cleanup } from './processor.js';
	import { description, header } from '../../styles.js';

	let selectedBundle = 'yolov8n';
	const examples = [
		{ alt: 'Soccer players', src: '/soccer.jpg' },
		{
			alt: 'Bicyclists racing',
			src: '/bikes.jpg'
		}
	];

	let chosenImage: HTMLImageElement | undefined;
	let processor: Processor | undefined;

	function onDrop(e: DragEvent) {
		e.preventDefault();
		const files = e.dataTransfer?.files;
		fromFileList(files);
	}

	function fromFileList(files?: FileList) {
		cleanup();
		if (!files) return;
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			if (file.type.startsWith('image/')) {
				file.arrayBuffer().then((buffer) => {
					const base64 = bytesToBase64(new Uint8Array(buffer));
					const prefix = 'data:image/png;base64,';
					const png = prefix + base64;
					handleLoad(png);
				});
			}
		}
	}

	function handleLoad(src: string) {
		const img = new Image();
		img.src = src;
		chosenImage = img;
		chosenImage.onload = () => {
			const imageCanvas = document.getElementById('imageCanvas') as HTMLCanvasElement;
			imageCanvas.width = chosenImage!.width;
			imageCanvas.height = chosenImage!.height;
			imageCanvas
				.getContext('2d')!
				.drawImage(chosenImage!, 0, 0, chosenImage!.width, chosenImage!.height);
		};
	}

	function exampleClick(index: number) {
		cleanup();
		handleLoad(examples[index].src);
	}

	function onChange(e: Event) {
		const target = e.target as HTMLInputElement | undefined;
		const files = target?.files || undefined;
		fromFileList(files);
	}
	async function play() {
		cleanup();

		if (chosenImage) {
			processor = await Processor.detect(selectedBundle);
		}
	}
	onDestroy(cleanup);
</script>

<h1 class={header}>Object Detection in Images</h1>
<Section>
	<p class={description}>
		This demo uses the <strong>candle_ml/yolo</strong> WebAssembly component to detect objects in images.
	</p>
	<p class={description}>
		It uses YOLOv8 models and is built using the
		<a href="https://github.com/candlecorp/wick">Wick WebAssembly framework</a>, and
		<a href="https://github.com/huggingface/candle">HuggingFace's Candle library</a>.
	</p>
</Section>
<Section header="Online demo">
	<BundleDownload {bundles} bind:selectedBundle>
		<Button
			pill
			class="mt-2"
			on:click={play}
			type="submit"
			disabled={!(chosenImage && (bundles[selectedBundle] || {}).ready)}>Detect</Button
		>
	</BundleDownload>
</Section>
<Section>
	<Dropzone
		on:drop={onDrop}
		on:dragover={(event) => {
			event.preventDefault();
		}}
		on:change={onChange}
		class="flex flex-col justify-center items-center w-full bg-gray-50 h-fit rounded-lg border-2 border-gray-300 border-dashed cursor-pointer dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
	>
		{#if !chosenImage}
			<div class="h-64 flex flex-col justify-center items-center">
				<svg
					aria-hidden="true"
					class="mb-3 w-10 h-10 text-gray-400"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
					/></svg
				>
				<p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
					<span class="font-semibold">Click to upload</span> or drag and drop
				</p>
				<p class="text-xs text-gray-500 dark:text-gray-400">a PNG or JPG file.</p>
			</div>
		{:else}
			<div class="h-fit">
				<canvas id="imageCanvas" />
				<canvas id="bufferCanvas" />
			</div>
		{/if}
	</Dropzone>
	<p class="mt-4">Or choose a sample image below</p>
	<div class="flex justify-center items-center">
		{#each examples as example, i}
			<button on:click={() => exampleClick(i)} class="">
				<img
					src={example.src}
					alt={example.alt}
					class="object-cover aspect-square w-48 rounded-lg m-1"
				/>
			</button>
		{/each}
	</div>
</Section>
<Section header="On the command line">
	<p class="mt-2">Use the following command to run this in your terminal:</p>
	<Terminal
		lines={[
			{
				command:
					'wick invoke candle_ml/yolo:0.0.2 detect --with="[CONFIG]" -- --image_data=[IMAGE_BYTES]',
				output: ''
			}
		]}
	/>
	<p class="mt-2">For example:</p>
	<Terminal lines={cli} />
</Section>

<style>
	#bufferCanvas {
		display: none;
	}
	#imageCanvas {
		margin: auto;
		max-width: 100%;
	}
</style>
