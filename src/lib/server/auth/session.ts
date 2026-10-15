import { createClient } from "@connectrpc/connect";
import { error, type RequestEvent } from "@sveltejs/kit";

import { SessionService } from "#lib/proto/auth/v1/session_pb.js";

import { handleError } from "../error";
import H from "../http-code";
import { transport, withTokenHeader } from "../transport";
import { ProtoToSession, ProtoToUser } from "./common";

const DAY_IN_MS = 1000 * 60 * 60 * 24;

const sessionCookieName = "auth-session";

const client = createClient(SessionService, transport);

export function getSessionToken(event: RequestEvent) {
	return event.cookies.get(sessionCookieName);
}

export function setSessionToken(event: RequestEvent, token: string) {
	event.cookies.set(sessionCookieName, token, {
		httpOnly: true,
		expires: new Date(Date.now() + DAY_IN_MS * 30),
		path: "/",
		sameSite: "lax",
		secure: import.meta.env.PROD,
	});
}

export function deleteSessionToken(event: RequestEvent) {
	event.cookies.delete(sessionCookieName, { path: "/" });
}

// Invalidate Session and Delete Session Token if success
export async function invalidateSession(event: RequestEvent): Promise<boolean> {
	const sessionToken = getSessionToken(event);

	if (sessionToken) {
		try {
			await client.logout({}, withTokenHeader(sessionToken));
			deleteSessionToken(event);
		} catch (error) {
			console.error(error);
			return false;
		}
	}
	return true;
}

export async function validateSession(event: RequestEvent): Promise<void> {
	try {
		const sessionToken = getSessionToken(event);
		if (sessionToken) {
			const { session, user } = await client.validate({}, withTokenHeader(sessionToken));
			if (!session || !user) error(H.C_500_INTERNAL_SERVER_ERROR);

			event.locals.session = ProtoToSession(session);
			event.locals.user = ProtoToUser(user);
		}
	} catch (error) {
		handleError(error);
	}
}
