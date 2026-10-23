<script lang="ts">
	import type { ComponentProps } from "svelte";

	import type { CategoryWithAccount } from "#lib/types/category.js";

	import * as Dialog from "#lib/components/ui/dialog/index.js";

	import AccountCreateForm from "./accountCreateForm.svelte";

	let {
		open = $bindable(),
		category,
		form,
	}: {
		open: boolean;
		category: CategoryWithAccount | null;
		form: ComponentProps<typeof AccountCreateForm>["form"];
	} = $props();

	let category_id = $derived(category?.category_id || 0);
	let defaultAccountCode = $derived.by(() => {
		if (!category?.code_prefix) return "";

		const [prefix, digitCount] = category.code_prefix.split("|");
		try {
			const digits = Number.parseInt(digitCount);
			const lastCode = category.accounts
				.filter(({ code }) => code.startsWith(prefix))
				.sort((a, b) => (a.code < b.code ? 1 : -1))
				.at(0)?.code;

			if (!lastCode) return `${prefix}${"1".padStart(digits, "0")}`;

			const lastCodeSequence = Number.parseInt(lastCode.replace(prefix, ""));
			return `${prefix}${String(lastCodeSequence + 1).padStart(digits, "0")}`;
		} catch {
			return "";
		}
	});
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
			{defaultAccountCode}
			defaultAccountSide="debit"
			onSuccess={() => {
				open = false;
			}}
		/>
	</Dialog.Content>
</Dialog.Root>
