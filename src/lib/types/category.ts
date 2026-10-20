import type { OptionalNullable } from "#lib/utils.js";

export const categoryTypes = ["asset", "liability", "equity", "revenue", "expense"] as const;

export type CategoryTypeEnum = (typeof categoryTypes)[number];

export interface CategoryType {
	category_type: string;
	is_deletable: boolean;
}

export interface CategoryFields {
	category_id: number;
	parent_id: number | null;

	name: string;
	category_type: CategoryTypeEnum | null;
}
export type CategoryFieldsCreation = OptionalNullable<Omit<CategoryFields, "category_id">>;
