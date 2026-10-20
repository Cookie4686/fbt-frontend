// import { fail } from "@sveltejs/kit";
// import { message, superValidate } from "sveltekit-superforms";
// import { zod4 } from "sveltekit-superforms/adapters";
//
// import type { Actions } from "./$types";
//
// import { createWorkspaceSchema } from "./schema";
//
// export const actions: Actions = {
// 	createWorkspace: async ({ request }) => {
// 		const form = await superValidate(request, zod4(createWorkspaceSchema));
//
// 		if (!form.valid) return fail(400, { form });
//
// 		// TODO: call create workspace service
//
// 		return message(form, "success");
// 	},
// };
