<script lang="ts">
	import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";

	import type { AccountFields } from "#lib/server/local/service/bookkeeping/account/repo.js";

	import Button from "#lib/components/ui/button/button.svelte";
	import * as Card from "#lib/components/ui/card/index.js";
	import * as Collapsible from "#lib/components/ui/collapsible/index.js";

	import type { PageServerData } from "./$types";

	let { data }: { data: PageServerData } = $props();

	let { categories } = $derived(data);
</script>

<!-- TODO: keyboard support -->
<div class="flex flex-col items-center">
	<Card.Root class="mx-auto w-full max-w-[16rem] gap-2" size="sm">
		<Card.Header>
			<h1 class="text-center">Chart of Accounts</h1>
		</Card.Header>
		<Card.Content>
			<div class="flex flex-col gap-1">
				{#each categories.filter(({ parent_id }) => parent_id === null) as category (category.category_id)}
					{@render categoryCollapsible(category)}
				{/each}
			</div>
		</Card.Content>
	</Card.Root>
</div>

{#snippet categoryCollapsible(category: PageServerData["categories"][number])}
	<Collapsible.Root>
		<Collapsible.Trigger>
			{#snippet child({ props })}
				<Button
					{...props}
					variant="ghost"
					size="sm"
					class="group w-full justify-start transition-none hover:bg-accent hover:text-accent-foreground"
				>
					{category.name}
					<ChevronRightIcon class="transition-transform group-data-[state=open]:rotate-90" />
				</Button>
			{/snippet}
		</Collapsible.Trigger>
		<Collapsible.Content class="mt-1 ml-4">
			<div class="flex flex-col gap-1">
				{#each categories.filter(({ parent_id }) => parent_id === category.category_id) as subCategory (subCategory.category_id)}
					{@render categoryCollapsible(subCategory)}
				{/each}
				{#each category.accounts as account (account.account_id)}
					{@render accountFile(account)}
				{/each}
			</div>
		</Collapsible.Content>
	</Collapsible.Root>
{/snippet}

{#snippet accountFile(account: AccountFields)}
	<Button variant="ghost" size="sm" class="w-full justify-start gap-2 text-foreground">
		<span>{account.code}</span>
		<span>{account.name}</span>
		<span>{account.is_debit ? "Debit" : "Credit"}</span>
	</Button>
{/snippet}
