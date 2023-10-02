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
		<DropdownItem class="flex justify-center items-center" href="/aichat">AI Chatbot</DropdownItem>
		<DropdownItem class="flex justify-center items-center" href="/validator"
			>Input Validator</DropdownItem
		>
		<DropdownItem class="flex justify-center items-center" href="/">Something Elses</DropdownItem>
	</Dropdown>

	<NavUl {activeUrl}>
		<NavLi href="https://github.com/candlecorp/wick"><GithubSolid size="lg" /></NavLi>

		<NavLi href="/">Home</NavLi>
		<NavLi class="cursor-pointer">
			Examples<ChevronDownOutline class="w-3 h-3 ml-2 text-primary-800 dark:text-white inline" />
		</NavLi>
		<Dropdown class="w-44 z-20" {activeUrl}>
			<DropdownItem href="/aichat">AI Chatbot</DropdownItem>
			<DropdownItem href="/validator">Input Validator</DropdownItem>
			<DropdownItem href="/">Something Elses</DropdownItem>
		</Dropdown>
	</NavUl>
</Navbar>
