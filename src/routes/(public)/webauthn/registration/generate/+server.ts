import { generateRegistrationOptions } from "@simplewebauthn/server";
import { redirect, type RequestHandler } from "@sveltejs/kit";
import Route from "$lib/route";
import {
	type Passkey,
	rpID,
	rpName,
	setCurrentRegistrationOptions,
} from "$lib/server/auth/webauthn";

export const GET: RequestHandler = async (event) => {
	const { user } = event.locals;
	if (!user) return redirect(302, Route.P_LOGIN);

	const userPasskeys: Passkey[] = [];

	const options = await generateRegistrationOptions({
		rpName,
		rpID,
		userName: user.username,
		attestationType: "none",
		// Prevent users from re-registering existing authenticators
		excludeCredentials: userPasskeys.map((passkey) => ({
			id: passkey.id,
			transports: passkey.transports,
		})),
		// See "Guiding use of authenticators via authenticatorSelection"
		authenticatorSelection: {
			// Defaults
			residentKey: "preferred",
			userVerification: "preferred",
			// Optional
			authenticatorAttachment: "platform",
		},
	});

	await setCurrentRegistrationOptions(user, options);

	return Response.json(options);
};
