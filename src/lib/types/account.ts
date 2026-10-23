import type { OptionalNullable } from "#lib/utils.js";

export interface AccountFields {
	account_id: number;
	category_id: number;
	code: string;
	name: string;
	is_debit: boolean;
}

export type AccountFieldsCreation = OptionalNullable<Omit<AccountFields, "account_id">>;
