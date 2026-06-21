<script lang="ts">
	import LanguageIcon from "@lucide/svelte/icons/languages";
	import { buttonVariants } from "$lib/components/ui/button/index.js";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import { setLocale } from "$lib/paraglide/runtime";
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger class={buttonVariants({ variant: "outline", size: "icon" })}>
		<LanguageIcon class="h-[1.2rem] w-[1.2rem]" />
		<span class="sr-only">Change Language</span>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end">
		<DropdownMenu.Item onclick={() => setLocale("en")}>English</DropdownMenu.Item>
		<DropdownMenu.Item onclick={() => setLocale("th")}>Thai</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>

<!-- <div style="display:none">
	{#each locales as locale (locale)}
		<a href={localizeHref(page.url.pathname, { locale })}>{locale}</a>
	{/each}
</div> -->
