import { createClient } from "@connectrpc/connect";
import { error, type RequestEvent } from "@sveltejs/kit";
import {
	TransactionService,
	type TransactionServiceCreateRequest,
	type TransactionServiceGetAllRequest,
} from "$lib/proto/bookkeeping/v1/transaction_pb";

import type { TransactionEntry } from "../../schema/account";

import { handleError } from "../error";
import H from "../http-code";
import { transport, withTokenHeader } from "../transport";
import { ProtoToTransactionEntry } from "./common";

const client = createClient(TransactionService, transport);

export async function getTransaction(
	event: RequestEvent,
	req: RequestInput<TransactionServiceGetAllRequest>
): Promise<TransactionEntry[]> {
	try {
		const { session } = event.locals;
		if (!session) return error(H.C_401_UNAUTHORIZED);
		if (!session.twoFactorVerified) return error(H.C_403_FORBIDDEN);

		const response = await client.getAll(req, withTokenHeader(session.id));

		return response.transactionEntry.map((t) => ProtoToTransactionEntry(t));
	} catch (error) {
		handleError(error);
	}
}

export async function createTransaction(
	event: RequestEvent,
	request: RequestInput<TransactionServiceCreateRequest>
): Promise<TransactionEntry> {
	try {
		const { session } = event.locals;
		if (!session) return error(H.C_401_UNAUTHORIZED);
		if (!session.twoFactorVerified) return error(H.C_403_FORBIDDEN);

		const response = await client.create(request, withTokenHeader(session.id));

		if (!response.transactionEntry) error(500);

		return ProtoToTransactionEntry(response.transactionEntry);
	} catch (error) {
		handleError(error);
	}
}
