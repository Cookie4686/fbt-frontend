<script lang="ts">
	import type { Snippet } from "svelte";

	import { ModeWatcher } from "mode-watcher";

	import "./layout.css";
	import favicon from "#lib/assets/favicon.svg";
	import AppHeader from "#lib/components/header/app-header.svelte";
	import AppSidebar from "#lib/components/sidebar/app-sidebar.svelte";
	import * as Sidebar from "#lib/components/ui/sidebar/index.js";

	import type { LayoutServerData } from "./$types";

	let { children, data }: { children: Snippet<[]>; data: LayoutServerData } = $props();
</script>

<svelte:head>
	<title>fbt</title>
	<link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher />
<Sidebar.SidebarProvider>
	<AppSidebar
		variant="sidebar"
		workspaces={data.workspaces}
		currentWorkspace={data.currentWorkspace}
		workspaceCreatePageProps={{ form: data.createWorkspaceForm }}
	/>
	<Sidebar.Inset>
		<div class="flex h-12 items-center justify-between gap-4 p-2">
			<AppHeader />
		</div>
		<main class="h-[100svh-3rem] overflow-y-scroll p-2">
			{@render children()}
		</main>
	</Sidebar.Inset>
</Sidebar.SidebarProvider>
