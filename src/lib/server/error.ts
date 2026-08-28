import { ConnectError } from "@connectrpc/connect";
import { codeToHttpStatus } from "@connectrpc/connect/protocol-connect";
import { error, isHttpError } from "@sveltejs/kit";

import H from "./http-code";

export function handleError(err: unknown): never {
	if (err instanceof ConnectError) {
		handleConnectError(err);
	} else if (isHttpError(err)) {
		throw err;
	} else {
		console.error(err);
		error(500);
	}
}

export function handleConnectError(err: ConnectError): never {
	const httpStatusCode = codeToHttpStatus(err.code);
	if (httpStatusCode == H.C_500_INTERNAL_SERVER_ERROR) {
		console.error(err);
	} else {
		console.log(httpStatusCode);
	}
	error(httpStatusCode, err.rawMessage);
}
