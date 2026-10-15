import { createClient } from "@connectrpc/connect";
import { error, redirect, type RequestEvent } from "@sveltejs/kit";
import { decodeIdToken, generateCodeVerifier, generateState, OAuth2Tokens } from "arctic";

import {
	OAuthService,
	type OAuthServiceLinkRequest,
	type OAuthServiceLoginRequest,
	type OAuthServiceRegisterRequest,
	type OAuthServiceStatusRequest,
	type OAuthServiceUnlinkRequest,
} from "#lib/proto/auth/v1/oauth_pb.js";

import { handleError } from "../error";
import H from "../http-code";
import { transport, withTokenHeader } from "../transport";
import { type Provider, providers } from "./provider";
import { setSessionToken } from "./session";

interface OAuthData {
	tokenId: string;
	username: string | null;
	email: string | undefined;
	emailVerified: boolean;
}

const DAY_IN_MS = 1000 * 60 * 60 * 24;

const registrationCookieName = "oauth-registration-session";

export function getRegistrationToken(event: RequestEvent) {
	return event.cookies.get(registrationCookieName);
}

export function setRegistrationToken(event: RequestEvent, token: string) {
	event.cookies.set(registrationCookieName, token, {
		httpOnly: true,
		expires: new Date(Date.now() + DAY_IN_MS),
		path: "/",
		sameSite: "lax",
		secure: import.meta.env.PROD,
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
		secure: import.meta.env.PROD,
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

	return redirect(302, url.toString());
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
		email: claims?.email ?? undefined,
		emailVerified: Boolean(claims?.email_verified),
	};
}

const client = createClient(OAuthService, transport);

export async function getUserOAuth(
	event: RequestEvent,
	req: RequestInput<OAuthServiceStatusRequest>
): Promise<string[]> {
	try {
		const { session } = event.locals;
		if (!session) return error(H.C_401_UNAUTHORIZED);

		const response = await client.status(req, withTokenHeader(session.id));

		return response.providers;
	} catch (error) {
		handleError(error);
	}
}

export async function register(
	event: RequestEvent,
	req: Omit<RequestInput<OAuthServiceRegisterRequest>, "registrationId">
): Promise<void> {
	try {
		const registrationId = getRegistrationToken(event);
		if (!registrationId) return error(H.C_400_BAD_REQUEST);

		const response = await client.register({ registrationId, ...req });
		if (!response.session) error(H.C_500_INTERNAL_SERVER_ERROR);

		setSessionToken(event, response.session.id);
	} catch (error) {
		handleError(error);
	}
}

export async function login(
	event: RequestEvent,
	req: RequestInput<OAuthServiceLoginRequest>
): Promise<boolean> {
	try {
		const response = await client.login(req);

		if (response.session) {
			setSessionToken(event, response.session.id);
		}
		if (response.registrationId) {
			setRegistrationToken(event, response.registrationId);
		}

		return response.registrationNeeded;
	} catch (error) {
		handleError(error);
	}
}

export async function link(
	event: RequestEvent,
	req: RequestInput<OAuthServiceLinkRequest>
): Promise<void> {
	try {
		const { session } = event.locals;
		if (!session) return error(H.C_401_UNAUTHORIZED);

		const response = await client.link(req, withTokenHeader(session.id));
		if (!response.session) error(H.C_500_INTERNAL_SERVER_ERROR);

		setSessionToken(event, response.session.id);
	} catch (error) {
		handleError(error);
	}
}

export async function unlink(
	event: RequestEvent,
	req: RequestInput<OAuthServiceUnlinkRequest>
): Promise<void> {
	try {
		const { session } = event.locals;
		if (!session) return error(H.C_401_UNAUTHORIZED);

		const response = await client.unlink(req, withTokenHeader(session.id));
		if (!response.session) error(H.C_500_INTERNAL_SERVER_ERROR);

		setSessionToken(event, response.session.id);
	} catch (error) {
		handleError(error);
	}
}
