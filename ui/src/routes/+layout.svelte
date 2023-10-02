<script lang="ts">
	import '../app.postcss';
	import Header from '../components/Header.svelte';
</script>

<Header />
<div class="flex justify-center items-center min-h-screen p-4">
	<div class="mx-auto flex flex-col justify-center w-full md:w-3/5">
		<slot />
	</div>
</div>
