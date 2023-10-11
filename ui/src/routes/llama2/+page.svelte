<script lang="ts">
	import BundleDownload, { type BundleEntry } from '../../components/BundleDownload.svelte';
	import Llama2 from '../../components/Llama.svelte';
	const bundles: Record<string, BundleEntry> = {
		stories15M: {
			label: 'stories15M (61mb)',
			files: [
				{
					path: 'stories15M.bin',
					url: 'https://huggingface.co/karpathy/tinyllamas/resolve/main/stories15M.bin'
				},
				{
					path: 'tokenizer.json',
					url: '/tokenizer.json'
				}
			]
		},
		stories42M: {
			label: 'stories42M (168mb)',
			files: [
				{
					path: 'stories42M.bin',
					url: 'https://huggingface.co/karpathy/tinyllamas/resolve/main/stories42M.bin'
				},
				{
					path: 'tokenizer.json',
					url: '/tokenizer.json'
				}
			]
		},
		stories110M: {
			label: 'stories110M (438mb)',
			files: [
				{
					path: 'stories110M.bin',
					url: 'https://huggingface.co/karpathy/tinyllamas/resolve/main/stories110M.bin'
				},
				{
					path: 'tokenizer.json',
					url: '/tokenizer.json'
				}
			]
		}
	};

	let selectedBundle = 'stories15M';
</script>

<div class="w-full flex justify-center">
	<div class="w-full w-3/5">
		<BundleDownload {bundles} bind:selectedBundle />
	</div>
</div>
<div class="w-full mt-4 flex justify-center">
	<div class="w-full w-3/5">
		<Llama2 bind:bundleName={selectedBundle} />
	</div>
</div>
