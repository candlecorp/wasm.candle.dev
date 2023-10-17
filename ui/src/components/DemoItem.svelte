<script lang="ts">
	export let title: string;
	export let description: string;
	export let link: string;
</script>

<div class="bg-gray-100 p-6 rounded-m">
	<h2 class="text-2xl font-bold mb-2">{title}</h2>
	<p class="mb-4">
		{description}
	</p>
	<a href={link} class="text-blue-500 hover:underline">{title} Demo</a>
</div>
