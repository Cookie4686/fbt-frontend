<script lang="ts">
	import type { Session } from "$lib/schema/auth";

	import * as NavigationMenu from "$lib/components/ui/navigation-menu/index.js";

	import AuthButton from "./authButton.svelte";
	import LanguageSelector from "./languageSelector.svelte";
	import ThemeSelector from "./themeSelector.svelte";

	const links: { title: string; href: string; description: string }[] = [
		{ title: "Home", href: "/", description: "Home Page" },
		{ title: "Accounts", href: "/accounts", description: "Accounts Page" },
		{ title: "Transaction", href: "/transaction", description: "Transaction Page" },
		{ title: "Profile", href: "/profile", description: "Profile Page" },
		{ title: "Settings", href: "/settings", description: "Setting Page" }
	];

	const { session }: { session?: Session | null } = $props();
</script>

<div class="flex justify-between p-2">
	<NavigationMenu.Root>
		<NavigationMenu.List>
			{#each links as link, idx (idx)}
				<NavigationMenu.Item>
					<NavigationMenu.Link href={link.href}>
						{link.title}
					</NavigationMenu.Link>
				</NavigationMenu.Item>
			{/each}
		</NavigationMenu.List>
	</NavigationMenu.Root>
	<div class="flex items-center gap-2">
		<LanguageSelector />
		<ThemeSelector />
		<AuthButton {session} />
	</div>
</div>
