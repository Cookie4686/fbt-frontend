import type { ParamMatcher } from "@sveltejs/kit";
import type { Provider } from "$lib/server/auth/provider";

export const match = ((param: string): param is Provider => {
	return ["google", "line"].find((provider) => provider === param) != undefined;
}) satisfies ParamMatcher;
