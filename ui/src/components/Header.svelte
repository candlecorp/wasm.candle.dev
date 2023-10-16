<script type="ts">
	import {
		Navbar,
		NavBrand,
		NavLi,
		NavUl,
		NavHamburger,
		Dropdown,
		DropdownItem,
		DropdownDivider
	} from 'flowbite-svelte';
	import { GithubSolid } from 'flowbite-svelte-icons';
	import { ChevronDownOutline } from 'flowbite-svelte-icons';
	import { page } from '$app/stores';
	$: activeUrl = $page.url.pathname;
</script>

<Navbar>
	<NavBrand href="/">
		<img src="wick_logo.png" class="mr-3 h-6 sm:h-9" alt="Wick Logo" />
	</NavBrand>
	<NavHamburger menuClass="text-right right-0" />
	<Dropdown class="w-44 z-20" {activeUrl}>
		<DropdownItem class="flex justify-center items-end" href="https://github.com/candlecorp/wick"
			><GithubSolid size="lg" /></DropdownItem
		>
		<DropdownItem class="flex justify-center items-center" href="/">Home</DropdownItem>
		<DropdownItem class="flex justify-center items-center" href="/llama2">Llama2</DropdownItem>
		<DropdownItem class="flex justify-center items-center" href="/yolo"
			>Object detection</DropdownItem
		>
		<DropdownItem class="flex justify-center items-center" href="/redact"
			>Text Redaction</DropdownItem
		>
	</Dropdown>

	<NavUl {activeUrl}>
		<NavLi href="https://github.com/candlecorp/wick"><GithubSolid size="lg" /></NavLi>

		<NavLi href="/">Home</NavLi>
		<NavLi class="cursor-pointer">
			Examples<ChevronDownOutline class="w-3 h-3 ml-2 text-primary-800 dark:text-white inline" />
		</NavLi>
		<Dropdown class="w-44 z-20" {activeUrl}>
			<DropdownItem href="/llama2">Llama Text Generation</DropdownItem>
			<DropdownItem href="/yolo">Object detection</DropdownItem>
			<DropdownItem href="/redact">Text Redaction</DropdownItem>
		</Dropdown>
	</NavUl>
</Navbar>
