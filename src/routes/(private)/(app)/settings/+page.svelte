<script lang="ts">
	import {
		type PublicKeyCredentialCreationOptionsJSON,
		startRegistration,
	} from "@simplewebauthn/browser";
	import { enhance } from "$app/forms";
	import googleLogo from "$lib/assets/Google_Favicon_2025.svg";
	import lineLogo from "$lib/assets/LINE_logo.svg";
	import Formsnap from "$lib/components/formsnap.svelte";
	import Button from "$lib/components/ui/button/button.svelte";
	import Route from "$lib/route";
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
	const providers: Record<Provider, string> = {
		google: googleLogo,
		line: lineLogo,
	};

	const updatePasswordForm = (() =>
		superForm(data.updatePasswordForm, {
			validators: zod4Client(updatePasswordSchema),
			delayMs: 750,
			timeoutMs: 10000,
		}))();

	let errorText = $state("");

	const handleWebAuthn = async () => {
		const resp = await fetch("/webauthn/registration/generate");
		const optionsJSON = (await resp.json()) as PublicKeyCredentialCreationOptionsJSON;

		let attResp;
		try {
			attResp = await startRegistration({ optionsJSON });
		} catch (error) {
			if (error instanceof Error) {
				if (error.name === "InvalidStateError") {
					errorText = "Error: Authenticator was probably already registered by user";
				} else {
					errorText = error.message;
				}
			}
			throw error;
		}

		const verificationResp = await fetch("/webauthn/registration/verify", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(attResp),
		});

		// Wait for the results of verification
		const verificationJSON = await verificationResp.json();

		// Show UI appropriate for the `verified` status
		if (verificationJSON && verificationJSON.verified) {
			errorText = "Success!";
		} else {
			errorText = `Oh no, something went wrong! Response: ${JSON.stringify(verificationJSON)}`;
		}
	};
</script>

<main class="flex flex-col space-y-8 items-center">
	<h1 class="text-center">Settings</h1>
	<section>
		<p>Username: {data.user.username}</p>
		<p>Email: {data.user.email}</p>
		<p>Email Verified: {data.user.emailVerified}</p>
		<p>Password Enabled: {data.user.passwordEnabled}</p>
	</section>

	<section>
		<Formsnap
			form={updatePasswordForm}
			action="?/updatePassword"
			method="post"
			fields={[
				{ name: "currentPassword", label: "Current Password", inputProps: { type: "password" } },
				{ name: "newPassword", label: "New Password", inputProps: { type: "password" } },
			]}
			buttons={[{ label: "Update" }]}
		>
			<h2 class="text-center">Update Password</h2>
		</Formsnap>
	</section>

	<div>
		<Button class="cursor-pointer" onclick={handleWebAuthn}>Register Passkey</Button>
		<span>{errorText}</span>
	</div>

	<section class="space-y-2">
		<h2>OAuth Authentication</h2>
		<div class="flex flex-col gap-2">
			{#each Object.entries(providers) as [provider, logo] (provider)}
				<div class="grid grid-cols-2 gap-4 items-center justify-between">
					<img src={logo} alt={provider} width="48" height="48" />
					{#if data.providers.includes(provider)}
						<form class="w-full" method="post" use:enhance action="?/unlink_oauth">
							<input name="provider" type="hidden" readonly value={provider} />
							<Button class="w-full cursor-pointer" type="submit" variant="destructive">
								Unlink
							</Button>
						</form>
					{:else}
						<Button class="cursor-pointer" href={`/login/${provider}`} variant="default">
							Link
						</Button>
					{/if}
				</div>
			{/each}
		</div>
	</section>

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

	<section>
		<h2 class="text-center">Authenticator app</h2>
		<div class="flex gap-2 items-center flex-col">
			{#if data.mfaList.totp}
				<Button href={Route.P_2FA_TOTP_SETUP}>Update TOTP</Button>
				<form method="post" use:enhance action="?/disconnect_totp">
					<Button type="submit">Disconnect</Button>
				</form>
			{:else}
				<Button href={Route.P_2FA_TOTP_SETUP}>Set up TOTP</Button>
			{/if}
		</div>
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
