import type { AuthenticatorTransportFuture, CredentialDeviceType } from "@simplewebauthn/server";

import type {
	WebAuthnCredential as ProtoCredential,
	Session as ProtoSession,
	User as ProtoUser,
} from "#lib/proto/auth/v1/common_pb.js";
import type { Session, User } from "#lib/schema/auth.js";

import type { Passkey } from "./webauthn";

export function ProtoToUser(user: ProtoUser): User {
	return {
		id: user.id,
		username: user.username,
		email: user.email,
		emailVerified: user.emailVerified,
		passwordEnabled: user.passwordEnabled,
	};
}

export function ProtoToSession(session: ProtoSession): Session {
	return {
		id: session.id,
		userID: session.userId,
		twoFactorVerified: session.twoFactorVerified,
		expiresAt:
			session.expiresAt ?
				new Date(Number(session.expiresAt.seconds)).toISOString()
			:	new Date().toISOString(),
	};
}

export function ProtoToPasskey(credential: ProtoCredential): Passkey {
	return {
		id: credential.credentialId,
		userID: credential.userId,
		backedUp: credential.backedUp,
		aaguid: credential.aaguid,
		counter: Number(credential.counter),
		deviceType: credential.deviceType as CredentialDeviceType,
		publicKey: credential.publicKey,
		transports: credential.transports as AuthenticatorTransportFuture[],
	};
}
