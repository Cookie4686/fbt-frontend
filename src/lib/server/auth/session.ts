import type { RequestEvent } from "@sveltejs/kit";
import type { Session, User } from "$lib/schema/auth";

import { BACKEND_URL } from "$env/static/private";

const DAY_IN_MS = 1000 * 60 * 60 * 24;

const sessionCookieName = "auth-session";

function getSessionToken(event: RequestEvent) {
	return event.cookies.get(sessionCookieName);
}

export function setSessionToken(event: RequestEvent, token: string) {
	event.cookies.set(sessionCookieName, token, {
		httpOnly: true,
		expires: new Date(Date.now() + DAY_IN_MS * 30),
		path: "/",
		sameSite: "strict",
		secure: import.meta.env.PROD
	});
}

function deleteSessionToken(event: RequestEvent) {
	event.cookies.delete(sessionCookieName, { path: "/" });
}

// Invalidate Session and Delete Session Token if success
export async function invalidateSession(event: RequestEvent): Promise<boolean> {
	const sessionToken = getSessionToken(event);

	if (sessionToken) {
		const response = await fetch(`${BACKEND_URL}/logout`, {
			method: "POST",
			headers: {
				Cookie: `session_id=${sessionToken};`
			}
		});
		if (response.status != 200) {
			return false;
		}
		deleteSessionToken(event);
	}
	return true;
}

export async function validateSession(
	event: RequestEvent
): Promise<{ session: Session | null; user: User | null }> {
	const sessionToken = getSessionToken(event);

	if (sessionToken) {
		const response = await fetch(`${BACKEND_URL}/validate`, {
			method: "POST",
			headers: {
				Cookie: `session_id=${sessionToken};`
			}
		});
		if (response.status == 200) {
			return (await response.json()) as unknown as { session: Session; user: User };
		} else {
			deleteSessionToken(event);
		}
	}
	return { session: null, user: null };
}
