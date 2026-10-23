<script lang="ts">
	import { untrack } from "svelte";
	import { type Infer, superForm, type SuperValidated } from "sveltekit-superforms";

	import type { CategoryFields } from "#lib/types/category.js";

	import { Button } from "#lib/components/ui/button/index.js";
	import * as Field from "#lib/components/ui/field/index.js";
	import { Input } from "#lib/components/ui/input/index.js";

	import type { CategoryCreateSchema } from "./schema";

	let {
		form: createForm,
		parent_id = null,
		onSuccess,
	}: {
		form: SuperValidated<Infer<CategoryCreateSchema>>;
		parent_id?: CategoryFields["parent_id"];
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

	$effect(() => {
		form.update(($form) => {
			$form.parent_id = parent_id;
			return $form;
		});
	});
</script>

<form method="POST" action="?/createCategory" use:enhance>
	<Field.Set>
		<Field.Group>
			<Field.Field data-invalid={$errors.name ? "true" : undefined}>
				<Field.Label for="create-category-name">Category Name</Field.Label>
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
			<input type="text" name="parent_id" bind:value={$form.parent_id} hidden />
		</Field.Group>
		<Field.Field orientation="horizontal">
			<Button type="submit">Submit</Button>
		</Field.Field>
	</Field.Set>
</form>
