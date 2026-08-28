<script lang="ts">
	import Formsnap from "$lib/components/formsnap.svelte";
	import { registerSchema } from "$lib/schema/auth";
	// import { m } from "$lib/paraglide/messages.js";
	import { superForm } from "sveltekit-superforms";
	import { zod4Client } from "sveltekit-superforms/adapters";

	import type { PageServerData } from "./$types";

	let { data }: { data: PageServerData } = $props();

	const form = (() =>
		superForm(data.form, {
			validators: zod4Client(registerSchema),
			delayMs: 3000,
			timeoutMs: 10000
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
			inputProps: { type: "password" }
		}
	]}
	buttons={[{ label: "Register" }, { label: "Login", href: "/login", variant: "outline" }]}
>
	<!-- <h1 class="text-center">{m.register()}</h1> -->
	<h1 class="text-center">Register</h1>
</Formsnap>
