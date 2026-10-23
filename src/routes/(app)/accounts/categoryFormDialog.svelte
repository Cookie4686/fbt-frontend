<script lang="ts">
	import type { ComponentProps } from "svelte";

	import * as Dialog from "#lib/components/ui/dialog/index.js";

	import type { PageServerData } from "./$types";

	import CategoryForm from "./categoryForm.svelte";

	let {
		open = $bindable(),
		category,
		form,
	}: {
		open: boolean;
		category: PageServerData["categories"][number] | null;
		form: ComponentProps<typeof CategoryForm>["form"];
	} = $props();

	let parent_id = $derived(category?.category_id);
</script>

<Dialog.Root
	{open}
	onOpenChange={(value) => {
		open = value;
	}}
>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title
				>{category ?
					`Add Sub-Category to ${category.name}`
				:	"Add Top Level Category"}</Dialog.Title
			>
			<Dialog.Description>You can see it as a folder.</Dialog.Description>
		</Dialog.Header>

		<CategoryForm
			{form}
			{parent_id}
			onSuccess={() => {
				open = false;
			}}
		/>
	</Dialog.Content>
</Dialog.Root>
