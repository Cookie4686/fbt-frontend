import { decodeBase64, encodeBase64 } from "@oslojs/encoding";
import { createTOTPKeyURI, verifyTOTPWithGracePeriod } from "@oslojs/otp";
import { fail, redirect } from "@sveltejs/kit";
import Route from "$lib/route";
import { digits, period, totpSetupFormSchema } from "$lib/schema/mfa";
import { upsertTOTP } from "$lib/server/auth/mfa.js";
import { message, setError, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
	const key = new Uint8Array(20);
	crypto.getRandomValues(key);

	const { user } = await event.parent();

	const keyURI = createTOTPKeyURI("FBT App", user.username, key, period, digits);
	const secret = new URLSearchParams(keyURI).get("secret") ?? "";

	const form = await superValidate({ key: encodeBase64(key), secret }, zod4(totpSetupFormSchema), {
		errors: false,
	});

	console.debug(keyURI, secret);

	return { keyURI, form };
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod4(totpSetupFormSchema));
		if (!form.valid) return fail(400, { form });

		const { session, user } = event.locals;

		if (!session || !user) return message(form, "Unauthorized", { status: 401 });

		const { code, key: encodedKey, secret } = form.data;

		let totpKey: Uint8Array;
		try {
			totpKey = decodeBase64(encodedKey);
		} catch {
			return message(form, "Invalid key", { status: 401 });
		}
		if (totpKey.byteLength !== 20) return message(form, "Invalid key", { status: 401 });

		if (!verifyTOTPWithGracePeriod(totpKey, period, digits, code, period))
			return setError(form, "code", "Invalid code.");

		try {
			await upsertTOTP(event, { key: secret });
		} catch {
			setError(form, "error occured");
		}

		return redirect(302, Route.A_SETTINGS);
	},
};
