import type { OptionalNullable } from "#lib/utils.js";

import type { AccountFields } from "./account";

export const categoryTypes = ["asset", "liability", "equity", "revenue", "expense"] as const;

export type CategoryTypeEnum = (typeof categoryTypes)[number];

export interface CategoryTypeFields {
	category_type: string;
	is_deletable: boolean;

	account_type: string | null;
}
export type CategoryTypeFieldsCreation = OptionalNullable<CategoryTypeFields>;

export interface CategoryFields {
	category_id: number;
	parent_id: number | null;
	category_type: CategoryTypeEnum | null;

	name: string;
	description: string | null;
	code_prefix: string | null;

	sequence: number | null;
}
export type CategoryFieldsCreation = OptionalNullable<Omit<CategoryFields, "category_id">>;

export type CategoryWithAccount = CategoryFields & { accounts: AccountFields[] };
