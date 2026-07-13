import type { User } from "$lib/schema/auth";

import {
	type RegistrationResponseJSON,
	type VerifiedRegistrationResponse,
	verifyRegistrationResponse,
} from "@simplewebauthn/server";
import { error, redirect, type RequestEvent, type RequestHandler } from "@sveltejs/kit";
import Route from "$lib/route";
import {
	createUserPasskey,
	getCurrentRegistrationOptions,
	type Passkey,
	rpID,
	rpOrigin,
} from "$lib/server/auth/webauthn";

export const POST: RequestHandler = async (event) => {
	const { user } = event.locals;
	if (!user) return redirect(302, Route.P_LOGIN);
	const body = (await event.request.json()) as RegistrationResponseJSON;

	const currentOptions = await getCurrentRegistrationOptions(user);
	if (!currentOptions) return error(400, "no options found");

	try {
		const verification = await verifyRegistrationResponse({
			response: body,
			expectedChallenge: currentOptions.challenge,
			expectedOrigin: rpOrigin,
			expectedRPID: rpID,
		});
		if (verification.verified) {
			await saveWebAuthnRegistrationCredential(event, user, verification.registrationInfo);
		}
		return Response.json({ verified: verification.verified });
	} catch (err) {
		console.error(err);
		if (err instanceof Error) {
			error(400, { message: err.message });
		}
		error(500);
	}
};

async function saveWebAuthnRegistrationCredential(
	event: RequestEvent,
	user: User,
	registrationInfo: NonNullable<VerifiedRegistrationResponse["registrationInfo"]>
) {
	const { aaguid, credential, credentialDeviceType, credentialBackedUp } = registrationInfo;

	const newPasskey: Passkey = {
		userID: user.id,
		id: credential.id,
		aaguid: Buffer.from(aaguid),
		publicKey: credential.publicKey,
		counter: credential.counter,
		transports: credential.transports,
		deviceType: credentialDeviceType,
		backedUp: credentialBackedUp,
	};

	await createUserPasskey(event, newPasskey);
}
