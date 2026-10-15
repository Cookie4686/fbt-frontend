import { fail } from "@sveltejs/kit";
// import { updateUserPassword, verifyUserPassword } from "#lib/server/auth/credential.js";
// import {
// 	EmailVerificationRequest,
// 	sendVerificationEmailBucket,
// } from "#lib/server/auth/email-verification";
// import { ExpiringTokenBucket } from "#lib/server/auth/rate-limit";
// // import { get2FARedirect } from "#lib/server/2fa";
import { message, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";

import { updatePasswordSchema } from "#lib/schema/settings.js";
import { getUserMFA } from "#lib/server/auth/mfa.js";
import { getUserOAuth, unlink } from "#lib/server/auth/oauth.js";
import { ExpiringTokenBucket } from "#lib/server/rate-limit.js";

// import {
// 	createSessionAndSetCookie,
// 	invalidateAllUserSessions,
// } from "@/server/auth/session";
// // import { getUserPasswordHash, getUserRecoverCode, resetUserRecoveryCode, updateUserPassword } from "#lib/server/user";
// // import {
// // 	deleteUserPasskeyCredential,
// // 	deleteUserSecurityKeyCredential,
// // 	getUserPasskeyCredentials,
// // 	getUserSecurityKeyCredentials
// // } from "#lib/server/webauthn";
// import { deleteUserTOTPKey, totpUpdateBucket } from "@/server/auth/totp";
// import { getUserBackupCodesCount } from "@/server/auth/backup-code";
import type { Actions, PageServerLoad } from "./$types";

// import { updateEmailFormSchema, updatePasswordFormSchema } from "./schema";

export const load: PageServerLoad = async (event) => {
	const { user } = await event.parent();

	const [providers, updatePasswordForm, mfaList] = await Promise.all([
		getUserOAuth(event, {}),
		superValidate(zod4(updatePasswordSchema)),
		getUserMFA(event, {}),
	]);

	// if (!user.emailVerified) return redirect(302, "/verify-email");

	return { providers, updatePasswordForm, mfaList, user };

	// const recoveryCodeCount: number | null =
	// 	user.registered2FA ? await getUserBackupCodesCount(user.id) : null;

	// const passkeyCredentials = getUserPasskeyCredentials(event.locals.user.id);
	// const securityKeyCredentials = getUserSecurityKeyCredentials(event.locals.user.id);
	// return {
	// 	recoveryCode,
	// 	user: event.locals.user,
	// 	passkeyCredentials,
	// 	securityKeyCredentials,
	// };
};

const passwordUpdateBucket = new ExpiringTokenBucket<string>(3, 60 * 30);

export const actions: Actions = {
	unlink_oauth: async (event) => {
		const { session, user } = event.locals;
		if (session === null || user === null) return fail(401);

		const formData = await event.request.formData();
		const provider = formData.get("provider")?.toString();
		if (typeof provider !== "string") return fail(400);

		await unlink(event, { provider: provider });
		return {};
	},
	updatePassword: async (event) => {
		const form = await superValidate(event, zod4(updatePasswordSchema));
		if (!form.valid) return fail(400, { form });

		const { session, user } = event.locals;
		if (!session || !user) return message(form, "Unauthorized", { status: 401 });

		// if (user.registered2FA && !session.twoFactorVerified) {
		// 	return fail(403, { password: { message: "Forbidden", }, });
		// }
		if (!passwordUpdateBucket.check(session.id, 1))
			return message(form, "Too many requests", { status: 429 });
		if (!passwordUpdateBucket.consume(session.id, 1))
			return message(form, "Too many requests", { status: 429 });

		// const { currentPassword, newPassword } = form.data;
		// const validPassword = await verifyUserPassword(user.id, currentPassword);
		// if (!validPassword) return setError(form, "password", "Incorrect password.");

		passwordUpdateBucket.reset(session.id);
		// await Promise.all([
		// 	updateUserPassword(user.id, newPassword),
		// 	invalidateAllUserSessions(user.id)
		// ]);

		// await createSessionAndSetCookie(event, user.id);
		return { form };
	},
	/* 	updateEmail: async (event) => {
		const form = await superValidate(event, zod4(updateEmailFormSchema));
		if (!form.valid) return fail(400, { form });

		const { session, user } = event.locals;
		if (session === null || user === null) return message(form, "Unauthorized", { status: 401 });
		// if (user.registered2FA && !session.twoFactorVerified) {
		// 	return fail(403, { email: { message: "Forbidden", }, });
		// }
		if (!sendVerificationEmailBucket.check(user.id, 1))
			return message(form, "Too many requests", { status: 429 });

		// const emailAvailable = checkEmailAvailability(email);
		// if (!emailAvailable) {
		// 	return fail(400, { email: { message: "This email is already used" } });
		// }
		if (!sendVerificationEmailBucket.consume(user.id, 1))
			return message(form, "Too many requests", { status: 429 });

		const { email } = form.data;

		const verificationRequest = await EmailVerificationRequest.user(user).create(email);
		EmailVerificationRequest.send(verificationRequest);
		EmailVerificationRequest.setCookie(event, verificationRequest);
		return redirect(302, "/verify-email");
	}, */

	/* 	disconnect_totp: async (event) => {
		const { session, user } = event.locals;
		if (session === null || user === null) return fail(401);

		if (!user.emailVerified) return fail(403);

		if (user.registered2FA && !session.twoFactorVerified) return fail(403);

		if (!totpUpdateBucket.consume(user.id, 1)) return fail(429);

		await deleteUserTOTPKey(user.id);
		return {};
	 */
};
// delete_passkey: async (event) => {
// 	const { session, user } = event.locals;
// 	if (session === null || user === null) return fail(401);

// 	if (!user.emailVerified) return fail(403);
// 	if (user.registered2FA && !session.twoFactorVerified) return fail(403);

// 	const formData = await event.request.formData();
// 	const encodedCredentialId = formData.get("credential_id");
// 	if (typeof encodedCredentialId !== "string") return fail(400);

// 	let credentialId: Uint8Array;
// 	try {
// 		credentialId = decodeBase64(encodedCredentialId);
// 	} catch {
// 		return fail(400);
// 	}
// 	const deleted = deleteUserPasskeyCredential(user.id, credentialId);
// 	if (!deleted) {
// 		return fail(400);
// 	}
// 	return {};
// },
// delete_security_key: async (event) => {
// 	const { session, user } = event.locals;
// 	if (session === null || user === null) return fail(401);

// 	if (!user.emailVerified) return fail(403);
// 	if (user.registered2FA && !session.twoFactorVerified) return fail(403);

// 	const formData = await event.request.formData();
// 	const encodedCredentialId = formData.get("credential_id");
// 	if (typeof encodedCredentialId !== "string") {
// 		return fail(400);
// 	}
// 	let credentialId: Uint8Array;
// 	try {
// 		credentialId = decodeBase64(encodedCredentialId);
// 	} catch {
// 		return fail(400);
// 	}
// 	const deleted = deleteUserSecurityKeyCredential(event.locals.user.id, credentialId);
// 	if (!deleted) {
// 		return fail(400);
// 	}
// 	return {};
// },
