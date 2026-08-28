import type { CallOptions } from "@connectrpc/connect";

import { createGrpcTransport } from "@connectrpc/connect-node";
import { BACKEND_URL } from "$app/env/private";

export const transport = createGrpcTransport({
  baseUrl: BACKEND_URL,
});

export function withTokenHeader(sessionId: string): CallOptions {
  return { headers: { session_id: sessionId } };
}
