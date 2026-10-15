import { defineParams } from "@sveltejs/kit/params";

import type { Provider } from "#lib/server/auth/provider.js";

const matchProvider = (param: string): param is Provider => {
	return ["google", "line"].find((provider) => provider === param) != undefined;
};

export const params = defineParams({
	provider: (param) => (matchProvider(param) ? param : undefined),
});
