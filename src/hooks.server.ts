import { type Handle, sequence } from "@sveltejs/kit/hooks";

import { getTextDirection } from "#lib/paraglide/runtime.js";
import { paraglideMiddleware } from "#lib/paraglide/server.js";

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) =>
				html
					.replace("%paraglide.lang%", locale)
					.replace("%paraglide.dir%", getTextDirection(locale)),
		});
	});

// const handleAuth: Handle = async ({ event, resolve }) => {
// 	try {
// 		await validateSession(event);
// 	} catch {
// 		deleteSessionToken(event);
// 	}
//
// 	return resolve(event);
// };
//
export const handle: Handle = sequence(handleParaglide);
