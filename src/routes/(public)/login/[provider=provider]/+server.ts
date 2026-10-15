import { createOAuthRedirect } from "#lib/server/auth/oauth.js";

import type { RequestEvent } from "./$types";

export function GET(event: RequestEvent): Response {
	return createOAuthRedirect(event, ["profile", "email", "openid"], event.params.provider);
}
