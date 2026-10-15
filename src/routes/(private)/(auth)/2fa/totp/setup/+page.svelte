<script lang="ts">
	import { superForm } from "sveltekit-superforms";
	import { zod4Client } from "sveltekit-superforms/adapters";

	import Formsnap from "#lib/components/formsnap.svelte";
	import { totpSetupFormSchema } from "#lib/schema/mfa.js";

	import type { PageServerData } from "./$types";
	const { data }: { data: PageServerData } = $props();
	import QR from "@svelte-put/qr/svg/QR.svelte";

	const form = (() =>
		superForm(data.form, {
			validators: zod4Client(totpSetupFormSchema),
			delayMs: 300,
			timeoutMs: 10000,
		}))();
</script>

<Formsnap
	{form}
	method="post"
	fields={[
		{
			name: "key",
			hidden: true,
			inputProps: { hidden: true, readonly: true, autocomplete: "off" },
		},
		{
			name: "secret",
			hidden: true,
			inputProps: { hidden: true, readonly: true, autocomplete: "off" },
		},
		{ name: "code", label: "Verify the code from the app", inputProps: { autocomplete: "off" } },
	]}
	buttons={[{ label: "Save" }]}
>
	<h1>Set up authenticator app</h1>
	<div style="width:200px; height: 200px;">
		<QR data={data.keyURI} moduleFill="black" anchorOuterFill="black" anchorInnerFill="black" />
	</div>
</Formsnap>
