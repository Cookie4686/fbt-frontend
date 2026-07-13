<script lang="ts">
	import Formsnap from "$lib/components/formsnap.svelte";
	import { oauthSchema } from "$lib/schema/auth";
	import { superForm } from "sveltekit-superforms";
	import { zod4Client } from "sveltekit-superforms/adapters";

	import type { PageServerData } from "./$types";

	let { data }: { data: PageServerData } = $props();

	const form = (() =>
		superForm(data.form, {
			validators: zod4Client(oauthSchema),
			delayMs: 3000,
			timeoutMs: 10000,
		}))();
</script>

<Formsnap
	{form}
	method="post"
	fields={[
		{ name: "username", label: "Username" },
		{ name: "email", label: "Email" },
		{ name: "password", label: "Password", inputProps: { type: "password" } },
		{
			name: "confirmedPassword",
			label: "Confirmed Password",
			inputProps: { type: "password" },
		},
		{
			name: "idToken",
			hidden: true,
			inputProps: { hidden: true, readonly: true, autocomplete: "off" },
		},
	]}
	buttons={[{ label: "Continue" }, { label: "Cancel", href: "/login", variant: "outline" }]}
>
	<h1 class="text-center">Registration Info</h1>
</Formsnap>
