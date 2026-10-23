<script lang="ts">
	import { untrack } from "svelte";
	import { type Infer, superForm, type SuperValidated } from "sveltekit-superforms";

	import type { CategoryFields } from "#lib/types/category.js";

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
