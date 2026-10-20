<script lang="ts">
	import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
	import EllipsisVerticalIcon from "@lucide/svelte/icons/ellipsis-vertical";
	import { invalidate } from "$app/navigation";
	import { untrack } from "svelte";
	import { superForm } from "sveltekit-superforms";

	import type { AccountFields } from "#lib/types/account.js";

	import Button from "#lib/components/ui/button/button.svelte";
	import * as Card from "#lib/components/ui/card/index.js";
	import * as Collapsible from "#lib/components/ui/collapsible/index.js";
	import * as Dialog from "#lib/components/ui/dialog/index.js";
	import * as DropdownMenu from "#lib/components/ui/dropdown-menu/index.js";

	import type { PageServerData } from "./$types";

	let { data }: { data: PageServerData } = $props();

	let { categories } = $derived(data);

	let dialogOpen = $state(false);
	let selectedCategory = $state<PageServerData["categories"][number] | null>(null);

	const { form, errors, constraints, enhance } = superForm(
		untrack(() => data.categoryCreateForm),
		{
			onUpdate: ({ form }) => {
				if (form.valid) {
					dialogOpen = false;
				}
			},
		}
	);

	const handleAddCategoryFormDialog = (category: PageServerData["categories"][number] | null) => {
		dialogOpen = true;
		selectedCategory = category;

		form.update(($form) => {
			$form.parent_id = category?.category_id;
			return $form;
		});
	};

	let handleAddTopLevelCategory = () => handleAddCategoryFormDialog(null);

	let handleAddSubCategoryAction = (category: PageServerData["categories"][number]) =>
		handleAddCategoryFormDialog(category);

	let handleDeleteCategoryAction = async (
		id: PageServerData["categories"][number]["category_id"]
	) => {
		const response = await fetch("/api/category", {
			method: "DELETE",
			body: JSON.stringify({ id }),
			headers: { "content-type": "application/json" },
		});

		if (!response.ok) {
			console.log("Workspace change failed");
		}

		invalidate("data:categories");
	};
</script>

<!-- TODO: keyboard support -->
<div class="flex flex-col items-center">
	<Card.Root class="mx-auto w-full max-w-3xl gap-2" size="sm">
		<Card.Header>
			<h1 class="text-center">Chart of Accounts</h1>
		</Card.Header>
		<Card.Content>
			<div class="flex flex-col gap-2">
				{#each categories.filter(({ parent_id }) => parent_id === null) as category (category.category_id)}
					{@render categoryCollapsible(category)}
				{/each}
				<Button variant="default" class="w-fit self-center" onclick={handleAddTopLevelCategory}>
					Add Top Level Category
				</Button>
			</div>
		</Card.Content>
	</Card.Root>

	<Dialog.Root
		open={dialogOpen}
		onOpenChange={(open) => {
			dialogOpen = open;
		}}
	>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title
					>{selectedCategory ?
						`Add Sub-Category to ${selectedCategory.name}`
					:	"Add Top Level Category"}</Dialog.Title
				>
				<Dialog.Description>You can see it as a folder.</Dialog.Description>
			</Dialog.Header>

			<form method="POST" action="?/createCategory" use:enhance>
				<label for="name">Name</label>
				<input
					type="text"
					name="name"
					aria-invalid={$errors.name ? "true" : undefined}
					bind:value={$form.name}
					{...$constraints.name}
				/>
				<input type="text" name="parent_id" bind:value={$form.parent_id} />

				{#if $errors.name}<div class="invalid">{$errors.name}</div>{/if}

				<div><button>Submit</button></div>
			</form>
		</Dialog.Content>
	</Dialog.Root>
</div>

{#snippet categoryCollapsible(category: PageServerData["categories"][number])}
	<Collapsible.Root
		open={selectedCategory ? selectedCategory.category_id === category.category_id : false}
	>
		<Collapsible.Trigger>
			{#snippet child({ props })}
				<div class="relative mt-1 flex justify-between">
					<Button
						{...props}
						variant="outline"
						size="sm"
						class="group flex w-min grow items-center justify-start gap-2 transition-none"
					>
						{category.name}
						<ChevronRightIcon class="transition-transform group-data-[state=open]:rotate-90" />
					</Button>
					{@render categoryDropdown(category)}
				</div>
			{/snippet}
		</Collapsible.Trigger>
		<Collapsible.Content class="border-l pl-4">
			<div class="flex flex-col">
				{#each category.accounts as account (account.account_id)}
					{@render accountFile(account)}
				{/each}
				{#each categories.filter(({ parent_id }) => parent_id === category.category_id) as subCategory (subCategory.category_id)}
					{@render categoryCollapsible(subCategory)}
				{/each}
			</div>
		</Collapsible.Content>
	</Collapsible.Root>
{/snippet}

{#snippet categoryDropdown(category: PageServerData["categories"][number])}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger>
			{#snippet child({ props })}
				<Button
					{...props}
					variant="link"
					size="icon-sm"
					class="absolute top-0 right-4 cursor-pointer"
				>
					<EllipsisVerticalIcon />
				</Button>
			{/snippet}
		</DropdownMenu.Trigger>
		<DropdownMenu.Content>
			<DropdownMenu.Item>Add Account</DropdownMenu.Item>
			<DropdownMenu.Item onSelect={() => handleAddSubCategoryAction(category)}>
				Add Subcategory
			</DropdownMenu.Item>
			<DropdownMenu.Item onSelect={() => handleDeleteCategoryAction(category.category_id)}>
				Delete Category
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{/snippet}

{#snippet accountFile(account: AccountFields)}
	<Button variant="ghost" size="sm" class="mt-1 w-full justify-start gap-2 text-foreground">
		<span>{account.code}</span>
		<span>{account.name}</span>
		<span>{account.is_debit ? "Debit" : "Credit"}</span>
	</Button>
{/snippet}
