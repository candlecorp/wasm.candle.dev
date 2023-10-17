<script type="ts">
	import {
		Navbar,
		NavBrand,
		NavLi,
		NavUl,
		NavHamburger,
		Dropdown,
		DropdownItem,
	} from 'flowbite-svelte';
	import { ChevronDownOutline } from 'flowbite-svelte-icons';
	import { page } from '$app/stores';
	$: activeUrl = $page.url.pathname;
</script>

<Navbar>
	<div class="flex items-baseline">
		<NavBrand href="/">
			<img src="wick_logo.png" class="mr-3 h-6 sm:h-9" alt="Wick Logo" />
		</NavBrand>
		<iframe
			src="https://ghbtns.com/github-btn.html?user=candlecorp&repo=wick&type=star&count=true"
			frameborder="0"
			scrolling="0"
			width="150"
			height="20"
			title="GitHub"
		/>
	</div>
	<NavHamburger menuClass="text-right right-0" />
	<Dropdown class="w-44 z-20" {activeUrl}>
		<DropdownItem class="flex justify-center items-center" href="/">Home</DropdownItem>
		<DropdownItem class="flex justify-center items-center" href="/llama2"
			>Text Generation</DropdownItem
		>
		<DropdownItem class="flex justify-center items-center" href="/yolo"
			>Object detection</DropdownItem
		>
		<DropdownItem class="flex justify-center items-center" href="/redact"
			>Text Redaction</DropdownItem
		>
	</Dropdown>

	<NavUl {activeUrl}>
		<NavLi href="/">Home</NavLi>
		<NavLi class="cursor-pointer">
			Examples<ChevronDownOutline class="w-3 h-3 ml-2 text-primary-800 dark:text-white inline" />
		</NavLi>
		<Dropdown class="w-44 z-20" {activeUrl}>
			<DropdownItem href="/llama2">Text Generation</DropdownItem>
			<DropdownItem href="/yolo">Object detection</DropdownItem>
			<DropdownItem href="/redact">Text Redaction</DropdownItem>
		</Dropdown>
	</NavUl>
</Navbar>
