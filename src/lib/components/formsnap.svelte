<script lang="ts" generics="T extends Record<string, unknown>, U extends FormPath<T>">
	import type { FsSuperForm } from "formsnap";
	import type { ComponentProps, Snippet } from "svelte";
	import type { HTMLFormAttributes } from "svelte/elements";
	import type { FormPath } from "sveltekit-superforms";

	import Loader2Icon from "@lucide/svelte/icons/loader-2";
	import * as Form from "$lib/components/ui/form/index.js";
	import { Input } from "$lib/components/ui/input";

	interface FormSnapProps {
		form: FsSuperForm<T>;
		formProps?: HTMLFormAttributes;
		fields: {
			name: U;
			label?: string;
			inputProps?: ComponentProps<typeof Input>;
			hidden?: boolean;
		}[];
		buttons?: (ComponentProps<typeof Form.Button> & { label: string })[];
		children?: Snippet;
	}

	const {
		form,
		fields,
		buttons = [],
		children,
		...restProps
	}: FormSnapProps & HTMLFormAttributes = $props();

	const { form: formData, message, submitting, delayed, enhance } = $derived(form);
</script>

<form class="mx-auto w-md space-y-4" {...restProps} use:enhance>
	{@render children?.()}

	{#each fields as { name, label, inputProps, hidden }, idx (idx)}
		<Form.Field {form} {name} {hidden}>
			<Form.Control>
				{#snippet children({ props })}
					{#if label}
						<Form.Label>{label}</Form.Label>
					{/if}
					<Input {...props} bind:value={$formData[name]} {...inputProps} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
	{/each}

	{#if buttons}
		<div class="space-x-2">
			{#each buttons as { label, ...restProps }, idx (idx)}
				<Form.Button disabled={$submitting} {...restProps}>
					{label}
					{#if !restProps?.href && $delayed}
						<Loader2Icon class="animate-spin" />
					{/if}
				</Form.Button>
			{/each}
		</div>
	{/if}

	<p>{$message}</p>
</form>
