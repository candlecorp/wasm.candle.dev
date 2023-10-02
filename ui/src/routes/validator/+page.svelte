<script lang="ts">
	import { Button, Textarea } from 'flowbite-svelte';

	let input = '';
	let validated = '';

	let inputObj = {
		name: 'John',
		age: 'thirty',
		email: 'john@somewhere.com',
		ssn: '123-45-6789',
		ccn: '1234-5678-9012-3456'
	};

	let sampleInput = JSON.stringify(inputObj, null, 4);

	function validateInput(e: MouseEvent): void {
		throw new Error('Function not implemented.');
	}
</script>

<div class="w-full flex flex-col justify-center items-center">
	<div class="w-3/5">
		<div>
			<Textarea
				id="input"
				class="mx-4 resize-none"
				rows="1"
				placeholder={sampleInput}
				bind:value={input}
				style="height: 12em; max-height: 20em; overflow-y: auto;"
			/>
		</div>
	</div>
	<div class="flex justify-center mt-2"><Button on:click={validateInput}>Validate</Button></div>
	<div class="w-3/5 mt-2">
		<div>
			<Textarea
				id="input"
				class="mx-4 resize-none"
				rows="1"
				placeholder="After Validation"
				bind:value={validated}
				style="height: 12em; max-height: 20em; overflow-y: auto;"
			/>
		</div>
	</div>
</div>
