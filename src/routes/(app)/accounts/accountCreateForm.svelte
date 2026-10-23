<script lang="ts">
	import { untrack } from "svelte";
	import { type Infer, superForm, type SuperValidated } from "sveltekit-superforms";

	import { Button } from "#lib/components/ui/button/index.js";
	import * as Field from "#lib/components/ui/field/index.js";
	import { Input } from "#lib/components/ui/input/index.js";
	import * as Select from "#lib/components/ui/select/index.js";

	import type { AccountCreateSchema, AccountCreateSchemaType } from "./schema";

	let {
		form: createForm,
		category_id,
		defaultAccountSide,
		onSuccess,
	}: {
		form: SuperValidated<Infer<AccountCreateSchema>>;
		category_id: AccountCreateSchemaType["category_id"];
		defaultAccountSide: "debit" | "credit";
		onSuccess?: () => void;
	} = $props();

	const { form, errors, constraints, enhance } = superForm(
		untrack(() => createForm),
		{
			onUpdate: ({ form }) => {
				if (form.valid && onSuccess) {
					onSuccess();
				}
			},
		}
	);

	let accountSide = $derived($form.is_debit ? "Debit" : "Credit");

	form.update(
		($form) => {
			$form.category_id = category_id;
			$form.is_debit = defaultAccountSide === "debit";
			return $form;
		},
		{ taint: false }
	);
</script>

<form method="POST" action="?/createAccount" use:enhance>
	<Field.Set>
		<Field.Group>
			<Field.Field data-invalid={$errors.code ? "true" : undefined}>
				<Field.Label for="create-category-name">Account Code</Field.Label>
				<Input
					id="create-category-code"
					type="text"
					name="code"
					autocomplete="off"
					aria-invalid={$errors.code ? "true" : undefined}
					bind:value={$form.code}
					{...$constraints.code}
				/>
				<Field.Error>{$errors.code}</Field.Error>
			</Field.Field>
			<Field.Field data-invalid={$errors.name ? "true" : undefined}>
				<Field.Label for="create-category-name">Account Name</Field.Label>
				<Input
					id="create-category-name"
					type="text"
					name="name"
					autocomplete="off"
					aria-invalid={$errors.name ? "true" : undefined}
					bind:value={$form.name}
					{...$constraints.name}
				/>
				<Field.Error>{$errors.name}</Field.Error>
			</Field.Field>
			<Field.Field data-invalid={$errors.is_debit ? "true" : undefined}>
				<Field.Label>Account Side</Field.Label>
				<Select.Root
					type="single"
					bind:value={accountSide}
					onValueChange={(value) => {
						form.update(($form) => {
							$form.is_debit = value === "Debit";
							return $form;
						});
					}}
				>
					<Select.Trigger class="w-45">
						<Select.Value placeholder="Select account side" />
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="Debit">Debit</Select.Item>
						<Select.Item value="Credit">Credit</Select.Item>
					</Select.Content>
				</Select.Root>
				<Field.Error>{$errors.is_debit}</Field.Error>
			</Field.Field>
			<input type="text" name="category_id" bind:value={$form.category_id} hidden />
			<input type="text" name="is_debit" bind:value={$form.is_debit} hidden />
		</Field.Group>
		<Field.Field orientation="horizontal">
			<Button type="submit">Submit</Button>
		</Field.Field>
	</Field.Set>
</form>
