import { error } from "@sveltejs/kit";
import { BACKEND_URL } from "$env/static/private";

export async function getUserMFA(sessionID: string) {
	const response = await fetch(`${BACKEND_URL}/mfa/status`, {
		method: "GET",
		headers: {
			Cookie: `session_id=${sessionID};`
		}
	});
	if (response.status != 200) {
		error(response.status);
	}
	return (await response.json()) as {
		totp: boolean;
	};
}

export async function upsertTOTP(key: string, sessionID: string) {
	const response = await fetch(`${BACKEND_URL}/mfa/totp`, {
		method: "POST",
		headers: {
			Cookie: `session_id=${sessionID};`
		},
		body: JSON.stringify({ key })
	});
	if (response.status != 200) {
		error(response.status);
	}
}

export async function validateTOTP(
	code: string,
	sessionID: string
): Promise<{ is_passed: boolean }> {
	const response = await fetch(`${BACKEND_URL}/mfa/totp/validate`, {
		method: "POST",
		headers: {
			Cookie: `session_id=${sessionID};`
		},
		body: JSON.stringify({
			code
		})
	});
	if (response.status != 200) {
		error(response.status);
	}

	return (await response.json()) as {
		is_passed: boolean;
	};
}
