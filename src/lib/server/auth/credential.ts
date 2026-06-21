import type { Session, User } from "$lib/schema/auth";

import { error } from "@sveltejs/kit";
import { BACKEND_URL } from "$env/static/private";

export async function register(user: {
	username: User["username"];
	email: User["email"];
	password: string;
}): Promise<Session> {
	const response = await fetch(`${BACKEND_URL}/credentials/register`, {
		method: "POST",
		body: JSON.stringify({ ...user })
	});
	if (response.status != 200) {
		error(response.status);
	}

	return (await response.json()) as unknown as Session;
}

export async function login(user: {
	username: User["username"];
	password: string;
}): Promise<Session> {
	const response = await fetch(`${BACKEND_URL}/credentials/login`, {
		method: "POST",
		body: JSON.stringify({ ...user })
	});
	if (response.status != 200) {
		error(response.status);
	}

	return (await response.json()) as unknown as Session;
}
