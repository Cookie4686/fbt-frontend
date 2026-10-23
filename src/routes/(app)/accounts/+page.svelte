<script lang="ts">
	import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
	import EllipsisVerticalIcon from "@lucide/svelte/icons/ellipsis-vertical";
	import { invalidate } from "$app/navigation";

	import type { CategoryWithAccount } from "#lib/types/category.js";

	import { Button } from "#lib/components/ui/button/index.js";
	import * as Card from "#lib/components/ui/card/index.js";
	import * as Collapsible from "#lib/components/ui/collapsible/index.js";
	import * as DropdownMenu from "#lib/components/ui/dropdown-menu/index.js";

	import type { PageServerData } from "./$types";

	import AccountCreateFormDialog from "./accountCreateFormDialog.svelte";
	import CategoryFormDialog from "./categoryFormDialog.svelte";

	let { data }: { data: PageServerData } = $props();

	let { categories } = $derived(data);

	let createCategoryDialogOpen = $state(false);
	let createAccountDialogOpen = $state(false);
	let selectedCategory = $state<CategoryWithAccount | null>(null);

	const handleAddCategoryFormDialog = (category: CategoryWithAccount | null) => {
		createCategoryDialogOpen = true;
		selectedCategory = category;
	};

	let handleAddTopLevelCategory = () => handleAddCategoryFormDialog(null);

	let handleAddSubCategoryAction = (category: PageServerData["categories"][number]) =>
		handleAddCategoryFormDialog(category);

	const handleAddAccountAction = (category: PageServerData["categories"][number]) => {
		createAccountDialogOpen = true;
		selectedCategory = category;
	};

	let handleDeleteCategoryAction = async (id: CategoryWithAccount["category_id"]) => {
		const response = await fetch("/api/category", {
			method: "DELETE",
			body: JSON.stringify({ id }),
		});

		if (response.ok) await invalidate("data:categories");
	};

	let handleDeleteAccountAction = async (
		id: CategoryWithAccount["accounts"][number]["account_id"]
	) => {
		const response = await fetch("/api/account", {
			method: "DELETE",
			body: JSON.stringify({ id }),
		});

		if (response.ok) await invalidate("data:categories");
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

	<AccountCreateFormDialog
		bind:open={createAccountDialogOpen}
		category={selectedCategory}
		form={data.accountCreateForm}
	/>

	<CategoryFormDialog
		bind:open={createCategoryDialogOpen}
		category={selectedCategory}
		form={data.categoryCreateForm}
	/>
</div>

{#snippet categoryCollapsible(category: CategoryWithAccount)}
	<Collapsible.Root>
		<Collapsible.Trigger>
			{#snippet child({ props })}
				<div class="mt-1 flex">
					<Button
						{...props}
						variant="outline"
						size="sm"
						class="group flex w-min grow items-center justify-between gap-2 transition-none"
					>
						<div class="flex items-center gap-2">
							{category.code_prefix
								&& `${category.code_prefix.split("|")[0]}${"0".repeat(Number.parseInt(category.code_prefix.split("|")[1]))}`}
							{category.name}
							<ChevronRightIcon class="transition-transform group-data-[state=open]:rotate-90" />
						</div>
						{@render categoryDropdown(category)}
					</Button>
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

{#snippet categoryDropdown(category: CategoryWithAccount)}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger>
			{#snippet child({ props })}
				<div {...props} class="cursor-pointer"><EllipsisVerticalIcon /></div>
			{/snippet}
		</DropdownMenu.Trigger>
		<DropdownMenu.Content>
			<DropdownMenu.Item>Edit Category</DropdownMenu.Item>
			<DropdownMenu.Item onSelect={() => handleAddAccountAction(category)}>
				Add Account
			</DropdownMenu.Item>
			<DropdownMenu.Item onSelect={() => handleAddSubCategoryAction(category)}>
				Add Subcategory
			</DropdownMenu.Item>
			<DropdownMenu.Item
				variant="destructive"
				onSelect={() => handleDeleteCategoryAction(category.category_id)}
			>
				Delete Category
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{/snippet}

{#snippet accountFile(account: CategoryWithAccount["accounts"][number])}
	<Button variant="ghost" size="sm" class="mt-1 flex w-full justify-between gap-2 text-foreground">
		<div>
			<span class={account.is_debit ? "text-green-300" : "text-red-300"}>
				{account.is_debit ? "DR" : "CR"}
			</span>
			<span>{account.code}</span>
			<span>{account.name}</span>
		</div>
		{@render accountDropdown(account)}
	</Button>
{/snippet}

{#snippet accountDropdown(account: CategoryWithAccount["accounts"][number])}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger>
			{#snippet child({ props })}
				<div {...props} class="cursor-pointer"><EllipsisVerticalIcon /></div>
			{/snippet}
		</DropdownMenu.Trigger>
		<DropdownMenu.Content>
			<DropdownMenu.Item>Edit Account</DropdownMenu.Item>
			<DropdownMenu.Item
				variant="destructive"
				onSelect={() => handleDeleteAccountAction(account.account_id)}
			>
				Delete Account
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{/snippet}
