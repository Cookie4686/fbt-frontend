import { defineEnvVars } from "@sveltejs/kit/env";
import { building } from "$app/env";
import z from "zod";

export const variables = defineEnvVars({
	FRONTEND_ADR: {
		public: true,
		schema: building ? z.string().optional() : z.string(),
	},
	FRONTEND_URL: {
		public: true,
		schema: building ? z.url().optional() : z.url(),
	},
	BACKEND_ADR: {
		schema: building ? z.string().optional() : z.string(),
	},
	BACKEND_URL: {
		schema: building ? z.url().default("http://localhost:8080") : z.url(),
	},
	REDIS_URL: {
		schema: building ? z.string().optional() : z.string(),
	},
	RP_NAME: {
		schema: building ? z.string().optional() : z.string(),
	},
	GOOGLE_CLIENT_ID: {
		schema: building ? z.string().optional() : z.string(),
	},
	GOOGLE_CLIENT_SECRET: {
		schema: building ? z.string().optional() : z.string(),
	},
	LINE_CLIENT_ID: {
		schema: building ? z.string().optional() : z.string(),
	},
	LINE_CLIENT_SECRET: {
		schema: building ? z.string().optional() : z.string(),
	},
});
