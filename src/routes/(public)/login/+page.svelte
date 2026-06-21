<script lang="ts">
	import Formsnap from "$lib/components/formsnap.svelte";
	import { Button } from "$lib/components/ui/button";
	// import { m } from "$lib/paraglide/messages.js";
	import { loginSchema } from "$lib/schema/auth";
	import { superForm } from "sveltekit-superforms";
	import { zod4Client } from "sveltekit-superforms/adapters";

	import type { PageServerData } from "./$types";

	let { data }: { data: PageServerData } = $props();

	const form = (() =>
		superForm(data.form, {
			validators: zod4Client(loginSchema),
			delayMs: 3000,
			timeoutMs: 10000
		}))();
</script>

<main>
	<Formsnap
		{form}
		method="post"
		fields={[
			{ name: "username", label: "Username" },
			{ name: "password", label: "Password", inputProps: { type: "password" } }
		]}
		buttons={[{ label: "Login" }, { label: "Register", href: "/register", variant: "outline" }]}
	>
		<!-- <h1 class="text-center">{m.login()}</h1> -->
		<h1 class="text-center">Login</h1>
	</Formsnap>
	<section class="mx-auto flex w-fit flex-col justify-center gap-2 text-center">
		<span>or</span>
		<Button href="/login/google">Sign In With Google</Button>
		<Button href="/login/line">Sign In With Line</Button>
	</section>
</main>
