<script lang="ts">
	import type { ComponentProps } from "svelte";

	import * as Dialog from "#lib/components/ui/dialog/index.js";

	import type { PageServerData } from "./$types";

	import AccountCreateForm from "./accountCreateForm.svelte";

	let {
		open = $bindable(),
		category,
		form,
	}: {
		open: boolean;
		category: PageServerData["categories"][number] | null;
		form: ComponentProps<typeof AccountCreateForm>["form"];
	} = $props();

	let category_id = $derived(category?.category_id || 0);
</script>

<Dialog.Root
	{open}
	onOpenChange={(value) => {
		open = value;
	}}
>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>{`Add Account to ${category?.name || ""}`}</Dialog.Title>
		</Dialog.Header>

		<AccountCreateForm
			{form}
			{category_id}
			defaultAccountSide="debit"
			onSuccess={() => {
				open = false;
			}}
		/>
	</Dialog.Content>
</Dialog.Root>
