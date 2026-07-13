import { createClient } from "@connectrpc/connect";
import { error, type RequestEvent } from "@sveltejs/kit";
import {
	EmailService,
	type EmailServiceSendOTPRequest,
	type EmailServiceVerifyRequest,
} from "$lib/proto/auth/v1/email_pb";

import { handleError } from "../error";
import H from "../http-code";
import { transport, withTokenHeader } from "../transport";
import { setSessionToken } from "./session";

const HOUR_IN_MS = 1000 * 60 * 60;

const emailVerificationCookieName = "email-verification-session";

function getEmailVerificationToken(event: RequestEvent) {
	return event.cookies.get(emailVerificationCookieName);
}

function setEmailVerificationToken(event: RequestEvent, token: string) {
	event.cookies.set(emailVerificationCookieName, token, {
		httpOnly: true,
		expires: new Date(Date.now() + HOUR_IN_MS),
		path: "/",
		sameSite: "strict",
		secure: import.meta.env.PROD,
	});
}

export function hasEmailVerification(event: RequestEvent): boolean {
	return Boolean(event.cookies.get(emailVerificationCookieName));
}

const client = createClient(EmailService, transport);

export async function sendEmailOTP(
	event: RequestEvent,
	req: RequestInput<EmailServiceSendOTPRequest>
) {
	try {
		const { session } = event.locals;
		if (!session) return error(H.C_401_UNAUTHORIZED);

		const response = await client.sendOTP(req, withTokenHeader(session.id));
		setEmailVerificationToken(event, response.verificationId);
	} catch (error) {
		handleError(error);
	}
}

export async function verifyEmailOTP(
	event: RequestEvent,
	req: Omit<RequestInput<EmailServiceVerifyRequest>, "verificationId">
): Promise<void> {
	try {
		const { session } = event.locals;
		if (!session) return error(H.C_401_UNAUTHORIZED);

		const verificationId = getEmailVerificationToken(event);
		if (!verificationId) return error(H.C_400_BAD_REQUEST);

		const response = await client.verify({ ...req, verificationId }, withTokenHeader(session.id));
		if (!response.session) error(500);

		setSessionToken(event, response.session.id);
	} catch (error) {
		handleError(error);
	}
}
