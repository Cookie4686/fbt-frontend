import { createClient } from "@connectrpc/connect";
import { error, type RequestEvent } from "@sveltejs/kit";
import { CredentialService, type CredentialServiceLoginRequest, type CredentialServiceRegisterRequest } from "$lib/proto/auth/v1/credential_pb";

import { handleError } from "../error";
import { transport } from "../transport";
import { setSessionToken } from "./session";

const client = createClient(CredentialService, transport);

export async function register(
  event: RequestEvent,
  req: RequestInput<CredentialServiceRegisterRequest>
): Promise<void> {
  try {
    const response = await client.register(req);
    if (!response.session) error(500);

    setSessionToken(event, response.session.id);
  } catch (error) {
    handleError(error);
  }
}

export async function login(
  event: RequestEvent,
  req: RequestInput<CredentialServiceLoginRequest>
): Promise<void> {
  try {
    const response = await client.login(req);
    if (!response.session) error(500);

    setSessionToken(event, response.session.id);
  } catch (error) {
    handleError(error);
  }
}
