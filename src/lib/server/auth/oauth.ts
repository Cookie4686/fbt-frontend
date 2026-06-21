import type { Session, User } from "$lib/schema/auth";

import { error, type RequestEvent } from "@sveltejs/kit";
import { BACKEND_URL } from "$env/static/private";
import { decodeIdToken, generateCodeVerifier, generateState, OAuth2Tokens } from "arctic";

import { type Provider, providers } from "./provider";

interface OAuthData {
	tokenId: string;
	username: string | null;
	email: string | null;
	emailVerified: boolean;
}

const DAY_IN_MS = 1000 * 60 * 60 * 24;

const registrationCookieName = "auth-session";

export function getRegistrationToken(event: RequestEvent) {
	return event.cookies.get(registrationCookieName);
}

export function setRegistrationToken(event: RequestEvent, token: string) {
	event.cookies.set(registrationCookieName, token, {
		httpOnly: true,
		expires: new Date(Date.now() + DAY_IN_MS),
		path: "/",
		sameSite: "lax",
		secure: import.meta.env.PROD
	});
}

export function deleteRegistrationToken(event: RequestEvent) {
	event.cookies.delete(registrationCookieName, { path: "/" });
}

function setCookie(event: RequestEvent, key: string, value: string) {
	event.cookies.set(key, value, {
		httpOnly: true,
		maxAge: 60 * 10,
		path: "/",
		sameSite: "lax",
		secure: import.meta.env.PROD
	});
}

export function createOAuthRedirect(
	event: RequestEvent,
	scopes: string[],
	provider: Provider
): Response {
	const state = generateState();
	const codeVerifier = generateCodeVerifier();
	const url = providers[provider].createAuthorizationURL(state, codeVerifier, scopes);

	setCookie(event, `${provider}_oauth_state`, state);
	setCookie(event, `${provider}_code_verifier`, codeVerifier);

	return new Response(null, { headers: { Location: url.toString() }, status: 302 });
}

export async function handleOAuthCallback(
	event: RequestEvent,
	provider: Provider
): Promise<Readonly<OAuthData> | null> {
	const error = event.url.searchParams.get("error");
	if (error) {
		console.error(provider, event.url.searchParams);
		return null;
	}

	const code = event.url.searchParams.get("code");
	const state = event.url.searchParams.get("state");
	const storedState = event.cookies.get(`${provider}_oauth_state`) ?? null;
	const codeVerifier = event.cookies.get(`${provider}_code_verifier`) ?? null;

	if (code === null || state === null || storedState === null || codeVerifier === null) {
		return null;
	}
	if (state !== storedState) {
		return null;
	}

	let tokens: OAuth2Tokens;
	try {
		tokens = await providers[provider].validateAuthorizationCode(code, codeVerifier);
	} catch (error) {
		// Invalid code or client credentials
		console.error(error);
		return null;
	}
	const claims = decodeIdToken(tokens.idToken()) as {
		sub: string;
		[key: string]: string | undefined;
	};

	return {
		tokenId: claims.sub,
		username: claims?.name ?? null,
		email: claims?.email ?? null,
		emailVerified: Boolean(claims?.email_verified)
	};
}

export async function login(
	provider: Provider,
	token: string,
	email: string | null
): Promise<{ session: Session; registration_id: string; registration_needed: boolean }> {
	const response = await fetch(`${BACKEND_URL}/oauth/login`, {
		method: "POST",
		body: JSON.stringify({ provider, token, email })
	});
	if (response.status != 200) {
		error(response.status);
	}

	return (await response.json()) as {
		session: Session;
		registration_id: string;
		registration_needed: boolean;
	};
}

export async function register(data: {
	provider: string;
	registrationID: string;
	tokenID: string;
	username: User["username"];
	email: User["email"];
	password: string;
	passwordEnabled: boolean;
}): Promise<Session> {
	const response = await fetch(`${BACKEND_URL}/oauth/register`, {
		method: "POST",
		body: JSON.stringify({
			provider: data.provider,
			registration_id: data.registrationID,
			id_token: data.tokenID,
			username: data.username,
			email: data.email,
			password: data.password,
			password_enabled: data.passwordEnabled
		})
	});
	if (response.status != 200) {
		error(response.status);
	}

	return (await response.json()) as Session;
}
