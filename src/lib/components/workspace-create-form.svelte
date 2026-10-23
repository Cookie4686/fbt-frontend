<script lang="ts">
	import { untrack } from "svelte";
	import { superForm } from "sveltekit-superforms";

	import { Button } from "#lib/components/ui/button/index.js";
	import * as Field from "#lib/components/ui/field/index.js";
	import { Input } from "#lib/components/ui/input/index.js";

	import { workspaceCreateFormLoad } from "./workspace-create-schema.ts";

	let {
		form: data,
		onSuccess,
	}: {
		form: Awaited<ReturnType<typeof workspaceCreateFormLoad>>;
		onSuccess?: () => void;
	} = $props();

	const { form, errors, constraints, enhance } = superForm(
		untrack(() => data),
		{
			onUpdate: ({ form }) => {
				if (form.valid && onSuccess) {
					onSuccess();
				}
			},
		}
	);
</script>

<form method="POST" action="/workspace/create" use:enhance>
	<Field.Set>
		<Field.Group>
			<Field.Field data-invalid={$errors.name ? "true" : undefined}>
				<Field.Label for="create-category-name">Workspace Name</Field.Label>
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
		</Field.Group>
		<Field.Field orientation="horizontal">
			<Button type="submit">Submit</Button>
		</Field.Field>
	</Field.Set>
</form>
