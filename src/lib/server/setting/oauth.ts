import { error } from "@sveltejs/kit";
import { BACKEND_URL } from "$env/static/private";

import type { Provider } from "../auth/provider";

export async function getUserProviders(sessionID: string): Promise<{ providers: Provider[] }> {
	const response = await fetch(`${BACKEND_URL}/oauth/status`, {
		method: "GET",
		headers: {
			Cookie: `session_id=${sessionID};`
		}
	});
	if (response.status != 200) {
		error(response.status);
	}

	return (await response.json()) as {
		providers: Provider[];
	};
}
