<script lang="ts">
	import { resolve } from "$app/paths";

	import * as Collapsible from "#lib/components/ui/collapsible/index.js";
	import * as Sidebar from "#lib/components/ui/sidebar/index.js";

	import type { NavItem } from "./app-sidebar.svelte";

	let { items }: { items: NavItem[] } = $props();
</script>

<Sidebar.Group>
	<Sidebar.GroupLabel>Platform</Sidebar.GroupLabel>
	<Sidebar.Menu>
		{#each items as item (item.title)}
			<Collapsible.Root class="group/collapsible">
				{#snippet child({ props })}
					<Sidebar.MenuItem {...props}>
						<Sidebar.MenuButton {...props} tooltipContent={item.title}>
							<item.icon />
							<a href={resolve(item.href)}>
								<span>{item.title}</span>
							</a>
						</Sidebar.MenuButton>
					</Sidebar.MenuItem>
				{/snippet}
			</Collapsible.Root>
		{/each}
	</Sidebar.Menu>
</Sidebar.Group>
