import type {
	AuthenticatorTransportFuture,
	CredentialDeviceType,
	PublicKeyCredentialCreationOptionsJSON,
} from "@simplewebauthn/server";
import type { User } from "$lib/schema/auth";

import { createClient } from "@connectrpc/connect";
import { error, type RequestEvent } from "@sveltejs/kit";
import { FRONTEND_ADR, FRONTEND_URL, RP_NAME } from "$env/static/private";
import {
	WebAuthnService,
	type WebAuthnServiceGetUserPasskeyRequest,
	type WebAuthnServiceUpdatePasskeyCounterRequest,
} from "$lib/proto/auth/v1/webauthn_pb";

import { handleError } from "../error";
import H from "../http-code";
import redis from "../redis";
import { transport, withTokenHeader } from "../transport";
import { ProtoToPasskey } from "./common";
import { setSessionToken } from "./session";

/**
 * @param id A unique identifier for the credential
 * @param publicKey The public key bytes, used for subsequent authentication signature verification
 * @param registrationInfo.aaguid Authenticator's Attestation GUID indicating the type of the authenticator
 * @param counter The number of times the authenticator has been used on this site so far
 * @param deviceType Whether the passkey is single-device or multi-device
 * @param backedUp Whether the passkey has been backed up in some way
 * @param transports How the browser can talk with this credential's authenticator
 * */
export interface Passkey {
	id: Base64URLString;
	publicKey: Uint8Array;
	aaguid: Uint8Array;
	userID: string;
	counter: number;
	deviceType: CredentialDeviceType;
	backedUp: boolean;
	transports?: AuthenticatorTransportFuture[];
}

export const rpName = RP_NAME;
export const rpID = import.meta.env.PROD ? FRONTEND_ADR : "localhost";
export const rpOrigin = FRONTEND_URL;

function redisWebAuthnRegistrationKey(user: User): string {
	return `webauthn:registration:${user.id}`;
}

export async function getCurrentRegistrationOptions(user: User) {
	const value = await redis.get(redisWebAuthnRegistrationKey(user));
	return value ? (JSON.parse(value) as PublicKeyCredentialCreationOptionsJSON) : null;
}

export async function setCurrentRegistrationOptions(
	user: User,
	options: PublicKeyCredentialCreationOptionsJSON
) {
	await redis.set(redisWebAuthnRegistrationKey(user), JSON.stringify(options));
	await redis.expire(redisWebAuthnRegistrationKey(user), 60);
}

function redisWebAuthnAuthenticationKey(clientIP: string): string {
	return `webauthn:authentication:${clientIP}`;
}

export async function getCurrentAuthenticationOptions(clientIP: string) {
	const value = await redis.get(redisWebAuthnAuthenticationKey(clientIP));
	return value ? (JSON.parse(value) as PublicKeyCredentialRequestOptionsJSON) : null;
}

export async function setCurrentAuthenticationOptions(
	clientIP: string,
	options: PublicKeyCredentialRequestOptionsJSON
) {
	await redis.set(redisWebAuthnAuthenticationKey(clientIP), JSON.stringify(options));
	await redis.expire(redisWebAuthnAuthenticationKey(clientIP), 60);
}

const client = createClient(WebAuthnService, transport);

export async function getUserPasskey(
	event: RequestEvent,
	req: RequestInput<WebAuthnServiceGetUserPasskeyRequest>
): Promise<Passkey | undefined> {
	try {
		const response = await client.getUserPasskey(req);

		return response.credential ? ProtoToPasskey(response.credential) : undefined;
	} catch (error) {
		handleError(error);
	}
}

export async function createUserPasskey(
	event: RequestEvent,
	passkey: Passkey
): Promise<Passkey | undefined> {
	try {
		const { session } = event.locals;
		if (!session) return error(H.C_401_UNAUTHORIZED);

		const response = await client.createUserPasskey(
			{
				credential: {
					rpId: rpID,
					credentialId: passkey.id,
					userId: passkey.userID,
					publicKey: passkey.publicKey,
					aaguid: passkey.aaguid,
					counter: BigInt(passkey.counter),
					transports: passkey.transports,
					deviceType: passkey.deviceType,
					backedUp: passkey.backedUp,
				},
			},
			withTokenHeader(session.id)
		);

		return response.credential ? ProtoToPasskey(response.credential) : undefined;
	} catch (error) {
		handleError(error);
	}
}

export async function updatePasskeyCounter(
	event: RequestEvent,
	req: RequestInput<WebAuthnServiceUpdatePasskeyCounterRequest>
): Promise<void> {
	try {
		const response = await client.updatePasskeyCounter(req);
		if (!response.session) error(500);

		setSessionToken(event, response.session.id);
	} catch (error) {
		handleError(error);
	}
}
