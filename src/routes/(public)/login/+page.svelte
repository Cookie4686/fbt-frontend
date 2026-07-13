<script lang="ts">
	import { startAuthentication } from "@simplewebauthn/browser";
	import { goto } from "$app/navigation";
	import { resolve } from "$app/paths";
	import Formsnap from "$lib/components/formsnap.svelte";
	import { Button } from "$lib/components/ui/button";
	import Route from "$lib/route";
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
			timeoutMs: 10000,
		}))();

	let errorText = $state("");

	const handleWebAuthnAuthentication = async () => {
		const resp = await fetch("/webauthn/authentication/generate");
		const optionsJSON = await resp.json();

		let asseResp;
		try {
			asseResp = await startAuthentication({ optionsJSON });
		} catch (error) {
			if (error instanceof Error) {
				errorText = error.message;
			}
			throw error;
		}

		try {
			const verificationResp = await fetch("/webauthn/authentication/verify", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(asseResp),
			});

			const verificationJSON = await verificationResp.json();

			// Show UI appropriate for the `verified` status
			if (!verificationJSON || !verificationJSON.verified) {
				errorText = `Verification Failed`;
			} else {
				goto(resolve(Route.A_SETTINGS));
			}
		} catch {
			errorText = `Oh no, something went wrong!`;
		}
	};
</script>

<main>
	<Formsnap
		{form}
		method="post"
		fields={[
			{
				name: "username",
				label: "Username",
				inputProps: { type: "text", autocomplete: "username" },
			},
			{
				name: "password",
				label: "Password",
				inputProps: { type: "password", autocomplete: "current-password" },
			},
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
		<div>
			<Button class="cursor-pointer" onclick={handleWebAuthnAuthentication}>
				Sign In With Passkey
			</Button>
			<span>{errorText}</span>
		</div>
	</section>
</main>
