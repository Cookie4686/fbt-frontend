import type { OptionalNullable } from "#lib/utils.js";

export interface TransactionTypeFields {
	transaction_type: string;
	is_deletable: boolean;
}

export interface TransactionFields {
	transaction_id: number;

	datetime: string;
	description: string;
	note: string | null;

	sequence: number | null;
}
export type TransactionFieldsCreation = OptionalNullable<Omit<TransactionFields, "transaction_id">>;

export interface TransactionTypeInfoFields {
	transaction_type: string;
	transaction_id: number;

	data: object | null;
}

export interface EntryFields {
	transaction_id: number;
	account_id: number;

	amount: number;
	is_debit: boolean;
}
export type EntryFieldsCreation = EntryFields;

export type TransactionWithEntry = TransactionFields & { entries: EntryFields[] };
