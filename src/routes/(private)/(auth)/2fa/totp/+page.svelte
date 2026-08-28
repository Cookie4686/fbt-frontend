<script lang="ts">
	import Formsnap from "$lib/components/formsnap.svelte";
	import { totpVerifyFormSchema } from "$lib/schema/mfa";
	import { superForm } from "sveltekit-superforms";
	import { zod4Client } from "sveltekit-superforms/adapters";

	import type { PageServerData } from "./$types";

	const { data }: { data: PageServerData } = $props();

	const form = (() =>
		superForm(data.form, {
			validators: zod4Client(totpVerifyFormSchema),
			delayMs: 300,
			timeoutMs: 10000,
		}))();
</script>

<Formsnap
	{form}
	method="post"
	fields={[
		{ name: "code", label: "Code", inputProps: { autocomplete: "one-time-code", autofocus: true } },
	]}
	buttons={[
		{ label: "Verify" },
		{ label: "Use Backup Code", href: "/2fa/backup-code", variant: "outline" },
	]}
>
	<h1>Authenticate with authenticator app</h1>
	<p>Enter the code from your app.</p>
</Formsnap>

<!-- <a href="/2fa/reset">Use recovery code</a> -->

<!-- {#if data.user.registeredPasskey}
	<a href="/2fa/passkey">Use passkeys</a>
{/if}
{#if data.user.registeredSecurityKey}
	<a href="/2fa/security-key">Use security keys</a>
{/if} -->
