import {
	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET,
	LINE_CLIENT_ID,
	LINE_CLIENT_SECRET
} from "$env/static/private";
import { Google, Line } from "arctic";

export const providers = {
	google: new Google(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, "http://localhost:5173/oauth/google"),
	line: new Line(LINE_CLIENT_ID, LINE_CLIENT_SECRET, "http://localhost:5173/oauth/line")
};

export type Provider = keyof typeof providers;
