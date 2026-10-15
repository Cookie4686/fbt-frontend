import { createClient } from "@connectrpc/connect";
import { error, type RequestEvent } from "@sveltejs/kit";

import {
	AccountService,
	type AccountServiceCreateRequest,
	type AccountServiceDeleteRequest,
	type AccountServiceGetAllRequest,
	type AccountServiceUpdateRequest,
} from "#lib/proto/bookkeeping/v1/account_pb.js";

import type { Account } from "../../schema/account";

import { handleError } from "../error";
import H from "../http-code";
import { transport, withTokenHeader } from "../transport";
import { ProtoToAccount } from "./common";

const client = createClient(AccountService, transport);

export async function getAccounts(
	event: RequestEvent,
	req: RequestInput<AccountServiceGetAllRequest>
): Promise<Account[]> {
	try {
		const { session } = event.locals;
		if (!session) return error(H.C_401_UNAUTHORIZED);
		if (!session.twoFactorVerified) return error(H.C_403_FORBIDDEN);

		const response = await client.getAll(req, withTokenHeader(session.id));

		return response.account.map((a) => ProtoToAccount(a));
	} catch (error) {
		handleError(error);
	}
}

export async function createAccount(
	event: RequestEvent,
	req: RequestInput<AccountServiceCreateRequest>
): Promise<Account> {
	try {
		const { session } = event.locals;
		if (!session) return error(H.C_401_UNAUTHORIZED);
		if (!session.twoFactorVerified) return error(H.C_403_FORBIDDEN);

		const response = await client.create(req, withTokenHeader(session.id));

		if (!response.account) error(500);

		return ProtoToAccount(response.account);
	} catch (error) {
		handleError(error);
	}
}

export async function updateAccount(
	event: RequestEvent,
	req: RequestInput<AccountServiceUpdateRequest>
): Promise<Account> {
	try {
		const { session } = event.locals;
		if (!session) return error(H.C_401_UNAUTHORIZED);
		if (!session.twoFactorVerified) return error(H.C_403_FORBIDDEN);

		const response = await client.update(req, withTokenHeader(session.id));

		if (!response.account) error(500);

		return ProtoToAccount(response.account);
	} catch (error) {
		handleError(error);
	}
}

export async function deleteAccount(
	event: RequestEvent,
	req: RequestInput<AccountServiceDeleteRequest>
): Promise<void> {
	try {
		const { session } = event.locals;
		if (!session) return error(H.C_401_UNAUTHORIZED);
		if (!session.twoFactorVerified) return error(H.C_403_FORBIDDEN);

		await client.delete(req, withTokenHeader(session.id));
	} catch (error) {
		handleError(error);
	}
}
