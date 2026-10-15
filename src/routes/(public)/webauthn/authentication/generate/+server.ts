import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { type RequestHandler } from "@sveltejs/kit";

import { type Passkey, rpID, setCurrentAuthenticationOptions } from "#lib/server/auth/webauthn.js";

export const GET: RequestHandler = async (event) => {
	const clientIP = event.getClientAddress();

	const userPasskeys: Passkey[] = [];

	const options: PublicKeyCredentialRequestOptionsJSON = await generateAuthenticationOptions({
		rpID,
		// Require users to use a previously-registered authenticator
		allowCredentials: userPasskeys.map((passkey) => ({
			id: passkey.id,
			transports: passkey.transports,
		})),
	});

	await setCurrentAuthenticationOptions(clientIP, options);

	return Response.json(options);
};
