<script lang="ts">
	import ModelDownload from '../components/ModelDownload.svelte';
	import AiChat from '../components/AIChat.svelte';

	let models = [
		{ value: '/models/model1.bin', name: 'Model 1' },
		{ value: '/models/model2.bin', name: 'Model 2' },
		{ value: '/models/model3.bin', name: 'Model 3' }
	];
</script>

<div class="flex justify-center items-center min-h-screen p-4">
	<div class="mx-auto flex flex-col justify-center w-full md:w-3/5">
		<div class="w-full flex justify-center">
			<div class="w-full md:w-1/5">
				<ModelDownload {models} />
			</div>
		</div>
		<div class="w-full mt-4 md:mt-20 flex justify-center">
			<div class="w-full md:w-3/5">
				<AiChat />
			</div>
		</div>
	</div>
</div>
