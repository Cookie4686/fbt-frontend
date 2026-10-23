<script lang="ts">
	import type { ComponentProps } from "svelte";

	import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
	import PlusIcon from "@lucide/svelte/icons/plus";
	import SquareTerminalIcon from "@lucide/svelte/icons/square-terminal";
	import { refreshAll } from "$app/navigation";

	import type { Workspace } from "#lib/types/app.js";

	import * as Dialog from "#lib/components/ui/dialog/index.js";
	import * as DropdownMenu from "#lib/components/ui/dropdown-menu/index.js";
	import * as Sidebar from "#lib/components/ui/sidebar/index.js";
	import { useSidebar } from "#lib/components/ui/sidebar/index.js";

	import WorkspaceCreateForm from "../workspace-create-form.svelte";

	let {
		workspaces,
		currentWorkspace,
		workspaceCreatePageProps,
	}: {
		workspaces: readonly Workspace[];
		currentWorkspace: Workspace | null;
		workspaceCreatePageProps: ComponentProps<typeof WorkspaceCreateForm>;
	} = $props();

	let currentWorkspaceName = $derived(currentWorkspace?.name || "");

	const sidebar = useSidebar();

	let dialogOpen = $state(false);

	const handleWorkspaceChange = async (workspaceName: string) => {
		if (workspaceName === currentWorkspaceName) {
			await refreshAll();
			return;
		}

		const response = await fetch("/api/workspace", {
			method: "POST",
			body: JSON.stringify({ name: workspaceName }),
		});

		if (response.ok) {
			const data = await response.json();
			currentWorkspace = data.workspace;

			await refreshAll();
		}
	};

	const handleWorkspaceDelete = async (workspaceName: string) => {
		const response = await fetch("/api/workspace", {
			method: "DELETE",
			body: JSON.stringify({ name: workspaceName }),
		});

		if (response.ok) await refreshAll();
	};
</script>

<!-- TODO: might refactor or something -->

<Dialog.Root bind:open={dialogOpen}>
	<Sidebar.Menu>
		<Sidebar.MenuItem>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<Sidebar.MenuButton
							{...props}
							size="lg"
							class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<div
								class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
							>
								<SquareTerminalIcon class="size-4" />
							</div>
							<div class="grid flex-1 text-start text-sm leading-tight">
								<span class="truncate font-medium">
									{currentWorkspace?.name || "Temporary Workspace"}
								</span>
								<span class="truncate text-xs"
									>{currentWorkspace?.folderName || "In-Memory Database"}</span
								>
							</div>
							<ChevronsUpDownIcon class="ms-auto" />
						</Sidebar.MenuButton>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content
					class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg"
					align="start"
					side={sidebar.isMobile ? "bottom" : "right"}
					sideOffset={4}
				>
					<DropdownMenu.Label class="text-xs text-muted-foreground">Workspaces</DropdownMenu.Label>
					<DropdownMenu.RadioGroup bind:value={currentWorkspaceName}>
						{#each [...workspaces, { name: "", folderName: "" }] as workspace (workspace.name)}
							{#if workspace.name !== ""}
								<DropdownMenu.Sub>
									<DropdownMenu.SubTrigger>
										{#snippet child({ props })}
											{@render workspaceRadioItem(workspace.name, props)}
										{/snippet}
									</DropdownMenu.SubTrigger>
									<DropdownMenu.SubContent>
										<!-- TODO: Delete Confirmation Dialog -->
										<DropdownMenu.Item
											variant="destructive"
											onclick={() => handleWorkspaceDelete(workspace.name)}
										>
											Delete Workspace
										</DropdownMenu.Item>
									</DropdownMenu.SubContent>
								</DropdownMenu.Sub>
							{:else}
								{@render workspaceRadioItem(workspace.name)}
							{/if}
						{/each}
					</DropdownMenu.RadioGroup>
					<DropdownMenu.Separator />
					<Dialog.Trigger>
						<DropdownMenu.Item class="gap-2 p-2">
							<div class="flex size-6 items-center justify-center rounded-md border bg-transparent">
								<PlusIcon class="size-4" />
							</div>
							<div class="font-medium text-muted-foreground">Add Workspace</div>
						</DropdownMenu.Item>
					</Dialog.Trigger>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</Sidebar.MenuItem>
	</Sidebar.Menu>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Add Workspace</Dialog.Title>
			<Dialog.Description>Create a new workspace.</Dialog.Description>
		</Dialog.Header>
		<WorkspaceCreateForm
			{...workspaceCreatePageProps}
			onSuccess={() => {
				dialogOpen = false;
			}}
		/>
	</Dialog.Content>
</Dialog.Root>

{#snippet workspaceRadioItem(workspaceName: string, props?: Record<string, unknown>)}
	<DropdownMenu.RadioItem
		{...props}
		value={workspaceName}
		onSelect={() => handleWorkspaceChange(workspaceName)}
		class="gap-2 p-2"
	>
		<div class="flex size-6 items-center justify-center rounded-md border">
			<SquareTerminalIcon class="size-3.5 shrink-0" />
		</div>
		{workspaceName !== "" ? workspaceName : "Temporary Workspace"}
		<!-- <DropdownMenu.Shortcut>⌘{index + 1}</DropdownMenu.Shortcut> -->
	</DropdownMenu.RadioItem>
{/snippet}
