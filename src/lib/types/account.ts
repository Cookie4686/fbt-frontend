import type { OptionalNullable } from "#lib/utils.js";

export const accountTypes = ["depreciable", "financial-asset"] as const;

export type AccountTypeEnum = (typeof accountTypes)[number];

export interface AccountFields {
	account_id: number;
	category_id: number;

	code: string;
	name: string;
	is_debit: boolean;
	description?: string;
}

export interface AccountTypeInfoFields {
	account_id: number;
	account_type: string;

	data: object;
}

export type AccountFieldsCreation = OptionalNullable<Omit<AccountFields, "account_id">>;
