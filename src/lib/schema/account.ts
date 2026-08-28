import { z } from "zod";

export type Account = Readonly<{
	id: number;
	name: string;
	isDebit: boolean;
	userID: string;
}>;

const id = z.coerce.number();
const name = z.string().nonempty();
const isDebit = z
	.string()
	.optional()
	.transform((value) => value === "on");

export const createAccountSchema = z.object({
	name,
	isDebit,
});

export const updateAccountSchema = z.object({
	id,
	name,
	isDebit,
});

export const deleteAccountSchema = z.object({
	id,
});

export type TransactionEntry = Readonly<{
	id: number;
	datetime: string;
	entries: Entry[];
}>;

export type Entry = Readonly<{
	accountID: number;
	amount: number;
}>;
