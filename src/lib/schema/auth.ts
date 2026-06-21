import z from "zod";

export type User = Readonly<{
	id: string;
	username: string;
	email: string;
	emailVerified: boolean;
}>;

export type Session = Readonly<{
	id: string;
	userId: string;
	expiresAt: string;
	twoFactorVerified: boolean;
}>;

export type UserOAuth = Readonly<{
	userId: string;
	providerId: number;
	idToken: string;
}>;

const username = z
	.string()
	.min(3, { error: "must be at least 3 characters long" })
	.max(31, { error: "must not be more than 31 characters long" })
	.regex(/^[a-zA-Z0-9]+$/, "can only include a-z, 0-9, underscore and dash");

export const password = z
	.string()
	.min(8, { error: "must be at least 8 characters long" })
	.max(255, { error: "must not be more than 255 characters long" });

const email = z.email();

export const loginSchema = z.object({
	username,
	password
});

export const registerSchema = z
	.object({
		username,
		email,
		password,
		confirmedPassword: z.string()
	})
	.refine(({ password, confirmedPassword }) => password === confirmedPassword, {
		error: "Password and Confirm Password does not match",
		path: ["confirmedPassword"]
	});

export const oauthSchema = z
	.object({
		username,
		email,
		password,
		confirmedPassword: z.string(),
		idToken: z.string(),
		registrationId: z.string()
	})
	.refine(({ password, confirmedPassword }) => password === confirmedPassword, {
		error: "Password and Confirm Password does not match",
		path: ["confirmedPassword"]
	});
