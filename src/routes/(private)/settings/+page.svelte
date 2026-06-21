<script lang="ts">
	import { enhance } from "$app/forms";
	import Formsnap from "$lib/components/formsnap.svelte";
	import Button from "$lib/components/ui/button/button.svelte";
	import { updatePasswordSchema } from "$lib/schema/settings";
	import { type Provider } from "$lib/server/auth/provider";
	import { superForm } from "sveltekit-superforms";
	import { zod4Client } from "sveltekit-superforms/adapters";

	import type { PageServerData } from "./$types";

	let { data }: { data: PageServerData } = $props();

	// const updateEmailForm = superForm(data.updateEmailForm, {
	// 	validators: zod4Client(updateEmailFormSchema),
	// 	delayMs: 750,
	// 	timeoutMs: 10000,
	// });
	const providers: Provider[] = ["google", "line"];

	const updatePasswordForm = (() =>
		superForm(data.updatePasswordForm, {
			validators: zod4Client(updatePasswordSchema),
			delayMs: 750,
			timeoutMs: 10000
		}))();
</script>

<main class="flex flex-col items-center space-y-8">
	<h1 class="text-center">Settings</h1>
	<div>
		{#each providers as provider (provider)}
			<div>{provider}: {data.providers.includes(provider)}</div>
		{/each}
	</div>

	<!-- 	<Formsnap
		form={updateEmailForm}
		action="?/updateEmail"
		method="post"
		fields={[{ name: "email", label: "Email" }]}
		buttons={[{ label: "Update" }]}
	>
		<h2>Update Email</h2>
	 </Formsnap>
    -->

	<Formsnap
		form={updatePasswordForm}
		action="?/updatePassword"
		method="post"
		fields={[
			{ name: "currentPassword", label: "Current Password", inputProps: { type: "password" } },
			{ name: "newPassword", label: "New Password", inputProps: { type: "password" } }
		]}
		buttons={[{ label: "Update" }]}
	>
		<h2>Update Password</h2>
	</Formsnap>

	<section class="text-center">
		<h2>Authenticator app</h2>
		{#if data.mfaList.totp}
			<Button href="/totp/setup">Update TOTP</Button>
			<form method="post" use:enhance action="?/disconnect_totp">
				<Button type="submit">Disconnect</Button>
			</form>
		{:else}
			<Button href="/totp/setup">Set up TOTP</Button>
		{/if}
	</section>

	<!-- 	
	{#if data.recoveryCodeCount !== null}
		<section class="text-center">
			<h1>Backup code</h1>
			<p>{data.recoveryCodeCount} available backup code</p>
			<Button href="/backup-code">View Backup Code</Button>
		</section>
	{/if} -->
</main>

<!-- <section>
	<h2>Passkeys</h2>
	<p>Passkeys are WebAuthn credentials that validate your identity using your device.</p>
	<ul>
		{#each data.passkeyCredentials as credential}
			<li>
				<p>{credential.name}</p>
				<form method="post" use:enhance action="?/delete_passkey">
					<input type="hidden" name="credential_id" value={encodeBase64(credential.id)} />
					<button> Delete </button>
				</form>
			</li>
		{/each}
	</ul>
	<a href="/2fa/passkey/register">Add</a>
</section> -->
<!-- <section>
	<h2>Security keys</h2>
	<p>
		Security keys are WebAuthn credentials that can only be used for two-factor
		authentication.
	</p>
	<ul>
		{#each data.securityKeyCredentials as credential}
			<li>
				<p>{credential.name}</p>
				<form method="post" use:enhance action="?/delete_security_key">
					<input type="hidden" name="credential_id" value={encodeBase64(credential.id)} />
					<button>Delete</button>
				</form>
			</li>
		{/each}
	</ul>
	<a href="/2fa/security-key/register">Add</a>
</section> -->
