<script lang="ts">
	import { decode, encode } from '@msgpack/msgpack';
	import { Button, Textarea, Dropzone } from 'flowbite-svelte';
	import { Observable, from, type Observer } from 'rxjs';
	import { Packet, WasmRsComponent, WasmRsComponentInstance } from '@candlecorp/wick';
	import { getComponentInstance, instantiateComponentWorker } from '$lib/workers';
	import { onDestroy, onMount } from 'svelte';
	import type { BundleEntry } from '../../components/BundleDownload.svelte';
	import BundleDownload from '../../components/BundleDownload.svelte';
	import { Subject } from 'rxjs';
	import { base64ToBytes, bytesToBase64 } from '$lib/base64';
	import type { DragEventHandler } from 'svelte/elements';
	import { bundles } from './bundles.js';

	interface Detection {
		confidence: number;
		keypoints: number[];
		xmax: number;
		xmin: number;
		ymax: number;
		ymin: number;
	}

	let selectedBundle = 'yolov8n';
	const examples = [
		{ alt: 'Soccer players', src: '/soccer.jpg' },
		{
			alt: 'Bicyclists racing',
			src: '/bikes.jpg'
		}
	];

	let component: WasmRsComponent | undefined;
	class Processor {
		buffer: HTMLCanvasElement;
		bufferCtx: CanvasRenderingContext2D;
		imageCanvas: HTMLCanvasElement;
		imageContext: CanvasRenderingContext2D;
		width: number = 0;
		height: number = 0;
		factor: number = 2;

		previousTimeStamp = 0;
		start: number | undefined;

		constructor(
			private instance: WasmRsComponentInstance,
			private component: WasmRsComponent,
			private subject: Subject<Packet>,
			private observable: Observable<Packet>
		) {
			this.imageCanvas = document.getElementById('imageCanvas') as HTMLCanvasElement;
			this.imageContext = this.imageCanvas.getContext('2d')!;
			this.buffer = document.getElementById('bufferCanvas') as HTMLCanvasElement;
			this.bufferCtx = this.buffer.getContext('2d')!;
			const size = this.imageCanvas.width * this.imageCanvas.height;
			const target = 480 * 320;
			const multiple = size / target;

			this.factor = Math.max(1, Math.floor(multiple));
			console.log({ multiple, factor: this.factor });

			this.buffer.width = this.imageCanvas.width / this.factor;
			this.buffer.height = this.imageCanvas.height / this.factor;
			const ctx = this.imageContext;
			const factor = this.factor;

			this.observable.subscribe({
				next(packet) {
					if (!packet.data) {
						console.log('no data');
						return;
					}

					const boxes = decode(packet.data) as [string, Detection][];
					for (const box of boxes) {
						const [label, detection] = box;
						const { xmin, ymin, xmax, ymax } = detection;
						ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
						ctx.beginPath();
						ctx.rect(xmin * factor, ymin * factor, (xmax - xmin) * factor, (ymax - ymin) * factor);
						ctx.stroke();
						ctx.font = '16px Arial';
						const metrics = ctx.measureText(label);
						ctx.fillStyle = 'white';
						ctx.fillRect(xmin * factor - 5, ymin * factor - 25, metrics.width + 10, 20);
						ctx.fillStyle = 'red';
						ctx.fillText(label, xmin * factor, ymin * factor - 10);
					}
				},
				complete() {
					console.log('done');
				},
				error(err) {
					console.log('error', err);
				}
			});
			this.processFrame();
		}

		terminate() {
			if (this.component) {
				this.component.terminate();
			}
		}

		static async detect(): Promise<Processor> {
			if (!component) {
				const c = await instantiateComponentWorker('/components/yolo.signed.wasm');
				component = c;
			}
			const instance = await component.instantiate({
				config: {
					model_dir: '/',
					model: `${selectedBundle}.safetensors`
				}
			});

			const subject = new Subject<Packet>();
			const observer = instance.invoke('detect', from(subject), {
				confidence: 0.25,
				iou: 0.45
			});

			return new Processor(instance, component, subject, observer);
		}

		processFrame() {
			const data = this.imageContext.getImageData(
				0,
				0,
				this.imageCanvas.width,
				this.imageCanvas.height
			);

			const smaller = this.bufferCtx.drawImage(
				this.imageCanvas,
				0,
				0,
				this.buffer.width,
				this.buffer.height
			);

			const png = this.buffer.toDataURL('image/png');
			const prefix = 'data:image/png;base64,';
			const base64 = png.slice(prefix.length);
			console.log({ len: base64.length });
			this.subject.next(new Packet('image_data', encode(base64)));
		}
	}

	let img: HTMLImageElement | undefined;
	let processor: Processor | undefined;

	function onDrop(e: DragEvent) {
		e.preventDefault();
		debugger;
		const files = e.dataTransfer?.files;
		loadFile(files);
	}

	function loadFile(files?: FileList) {
		if (processor) {
			processor.terminate();
			processor = undefined;
		}
		if (!files) return;
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			if (file.type.startsWith('image/')) {
				file.arrayBuffer().then((buffer) => {
					const base64 = bytesToBase64(new Uint8Array(buffer));
					const prefix = 'data:image/png;base64,';
					const png = prefix + base64;
					img = new Image();
					img.src = png;
					handleLoad(img);
				});
			}
		}
	}

	function handleLoad(newImage: HTMLImageElement) {
		img = newImage;
		img.onload = () => {
			const imageCanvas = document.getElementById('imageCanvas') as HTMLCanvasElement;
			imageCanvas.width = img!.width;
			imageCanvas.height = img!.height;
			imageCanvas.getContext('2d')!.drawImage(img!, 0, 0, img!.width, img!.height);
		};
	}

	function exampleClick(index: number) {
		if (processor) {
			processor.terminate();
			processor = undefined;
		}
		let example = examples[index];
		const img = new Image();
		img.src = example.src;
		handleLoad(img);
	}

	function onChange(e: Event) {
		const target = e.target as HTMLInputElement | undefined;
		const files = target?.files || undefined;
		loadFile(files);
	}
	async function play() {
		if (img) {
			processor = await Processor.detect();
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
		<h1 class="text-center">Select demo model</h1>
		<BundleDownload {bundles} bind:selectedBundle>
			<Button
				pill
				class="mt-2"
				on:click={play}
				type="submit"
				disabled={!(img && (bundles[selectedBundle] || {}).ready)}>Detect</Button
			>
		</BundleDownload>
	</div>
</div>
<div class="w-full mt-4">
	<Dropzone
		on:drop={onDrop}
		on:dragover={(event) => {
			event.preventDefault();
		}}
		on:change={onChange}
		class="flex flex-col justify-center items-center w-full bg-gray-50 h-fit rounded-lg border-2 border-gray-300 border-dashed cursor-pointer dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
	>
		{#if !img}
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
</div>
<div class="w-full mt-4" id="examples">
	{#each examples as example, i}
		<button on:click={() => exampleClick(i)}>
			<img src={example.src} alt={example.alt} class="object-cover h-44 w-64 rounded-lg m-1" />
		</button>
	{/each}
</div>

<style>
	#bufferCanvas {
		display: none;
	}
	#imageCanvas {
		margin: auto;
		max-width: 100%;
	}
</style>
