<script lang="ts" module>
	import type { LucideIcon } from "@lucide/svelte";

	import SquareTerminalIcon from "@lucide/svelte/icons/square-terminal";

	export interface NavItem {
		title: string;
		icon: LucideIcon;
		href: "" | "accounts";
	}

	const navItems: NavItem[] = [
		{ title: "Home", icon: SquareTerminalIcon, href: "" },
		{ title: "Accounts", icon: SquareTerminalIcon, href: "accounts" },
		{ title: "Transaction", icon: SquareTerminalIcon, href: "" },
		{ title: "Profile", icon: SquareTerminalIcon, href: "" },
		{ title: "Settings", icon: SquareTerminalIcon, href: "" },
	];
</script>

<script lang="ts">
	import type { ComponentProps } from "svelte";

	import * as Sidebar from "#lib/components/ui/sidebar/index.js";

	import NavMain from "./nav-main.svelte";
	import NavUser from "./nav-user.svelte";
	import WorkspaceSwitcher from "./workspace-switcher.svelte";

	let {
		ref = $bindable(null),
		collapsible = "icon",
		workspaces,
		currentWorkspace,
		workspaceCreatePageProps,
		...restProps
	}: ComponentProps<typeof Sidebar.Root> & ComponentProps<typeof WorkspaceSwitcher> = $props();
</script>

<Sidebar.Root bind:ref {collapsible} {...restProps}>
	<Sidebar.Header>
		<WorkspaceSwitcher {workspaces} {currentWorkspace} {workspaceCreatePageProps} />
	</Sidebar.Header>
	<Sidebar.Content>
		<NavMain items={navItems} />
	</Sidebar.Content>
	<Sidebar.Footer>
		<NavUser user={{ name: "User", email: "user@mail.com" }} />
	</Sidebar.Footer>
	<Sidebar.Rail />
</Sidebar.Root>
