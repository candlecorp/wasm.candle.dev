<script lang="ts">
	import DemoItem from '../components/DemoItem.svelte';
	import Section from '../components/Section.svelte';

	const demos = [
		{
			title: 'Text Generation',
			description:
				'Use the same Llama 2 models in multiple environments with the llama2 component.',
			link: '/llama2'
		},
		{
			title: 'Text Redaction',
			description:
				'Ensure consistent PII redaction across different languages and different environments by using the exact same binaries.',
			link: '/redact'
		},
		{
			title: 'Object Recognition',
			description: 'Use YOLOv8 AI models to detect objects in image frames.',
			link: '/yolo'
		}
	];
</script>

<div class="container mx-auto p-6">
	<div class="text-center">
		<img src="wick_logo.png" alt="Wick Framework Logo" class="w-96 mx-auto mb-4" />
		<p class="text-xl mb-4">Bring WebAssembly Everywhere.</p>
		<p>Run the same binaries on the server, client, mobile, CLI, APIs, workers, and beyond.</p>
	</div>
</div>
<Section>
	<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
		{#each demos as demo}
			<DemoItem {...demo} />
		{/each}
	</div>
</Section>
