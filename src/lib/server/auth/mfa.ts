import { createClient } from "@connectrpc/connect";
import { error, type RequestEvent } from "@sveltejs/kit";

import {
	MFAService,
	type MFAServiceStatusRequest,
	type MFAServiceTOTPUpsertKeyRequest,
	type MFAServiceTOTPValidateRequest,
} from "#lib/proto/auth/v1/mfa_pb.js";

import { handleError } from "../error";
import H from "../http-code";
import { transport, withTokenHeader } from "../transport";
import { setSessionToken } from "./session";

const client = createClient(MFAService, transport);

export async function getUserMFA(
	event: RequestEvent,
	req: RequestInput<MFAServiceStatusRequest>
): Promise<{ totp: boolean }> {
	try {
		const { session } = event.locals;
		if (!session) return error(H.C_401_UNAUTHORIZED);

		const response = await client.status(req, withTokenHeader(session.id));
		return { totp: response.totpEnabled };
	} catch (error) {
		handleError(error);
	}
}

export async function upsertTOTP(
	event: RequestEvent,
	req: RequestInput<MFAServiceTOTPUpsertKeyRequest>
): Promise<void> {
	try {
		const { session } = event.locals;
		if (!session) return error(H.C_401_UNAUTHORIZED);

		const { session: newSession } = await client.tOTPUpsertKey(req, withTokenHeader(session.id));
		if (!newSession) error(500);

		setSessionToken(event, newSession.id);
	} catch (error) {
		handleError(error);
	}
}

export async function validateTOTP(
	event: RequestEvent,
	req: RequestInput<MFAServiceTOTPValidateRequest>
): Promise<void> {
	try {
		const { session } = event.locals;
		if (!session) return error(H.C_401_UNAUTHORIZED);

		const response = await client.tOTPValidate(req, withTokenHeader(session.id));
		if (!response.session) error(H.C_500_INTERNAL_SERVER_ERROR);

		setSessionToken(event, response.session.id);
	} catch (error) {
		handleError(error);
	}
}
