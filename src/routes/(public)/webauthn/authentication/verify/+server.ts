import {
	type AuthenticationResponseJSON,
	verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import { error, type RequestHandler } from "@sveltejs/kit";
import {
	getCurrentAuthenticationOptions,
	getUserPasskey,
	rpID,
	rpOrigin,
	updatePasskeyCounter,
} from "$lib/server/auth/webauthn";

export const POST: RequestHandler = async (event) => {
	const clientIP = event.getClientAddress();

	const body = (await event.request.json()) as AuthenticationResponseJSON;

	const currentOptions = await getCurrentAuthenticationOptions(clientIP);
	if (!currentOptions) return error(400, "no options found");

	const passkey = await getUserPasskey(event, { rpId: rpID, credentialId: body.id });

	if (!passkey) {
		throw new Error(`Could not find passkey ${body.id}`);
	}

	try {
		const verification = await verifyAuthenticationResponse({
			response: body,
			expectedChallenge: currentOptions.challenge,
			expectedOrigin: rpOrigin,
			expectedRPID: rpID,
			credential: {
				id: passkey.id,
				publicKey: new Uint8Array(passkey.publicKey),
				counter: passkey.counter,
				transports: passkey.transports,
			},
		});

		if (verification.verified) {
			await updatePasskeyCounter(event, {
				counter: BigInt(verification.authenticationInfo.newCounter),
				credentialId: passkey.id,
				rpId: rpID,
			});
		}
		return Response.json({ verified: verification.verified });
	} catch (err) {
		console.error(err);
		error(500);
	}
};
