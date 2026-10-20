<script lang="ts">
	import { untrack } from "svelte";
	import { superForm } from "sveltekit-superforms";

	import { workspaceCreateFormLoad } from "./workspace-create-schema.ts";

	let { form: data }: { form: Awaited<ReturnType<typeof workspaceCreateFormLoad>> } = $props();

	const { form, errors, constraints, message, enhance } = superForm(untrack(() => data));
</script>

<form method="POST" action="/workspace/create" use:enhance>
	<label for="name">Name</label>
	<input
		type="text"
		name="name"
		aria-invalid={$errors.name ? "true" : undefined}
		bind:value={$form.name}
		{...$constraints.name}
	/>

	{#if $errors.name}<div class="invalid">{$errors.name}</div>{/if}

	<div><button>Submit</button></div>
	{#if $message}<p>{$message}</p>{/if}
</form>
