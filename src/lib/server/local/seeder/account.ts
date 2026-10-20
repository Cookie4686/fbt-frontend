import { type AccountFieldsCreation } from "#lib/types/account.js";
import { type CategoryFieldsCreation } from "#lib/types/category.js";
import { categoryTypes } from "#lib/types/category.js";

import type { Repo } from "../service/repo";

type CategorySeedItem = CategoryFieldsCreation & {
	accounts?: Omit<AccountFieldsCreation, "category_id">[];
} & { subCategories?: CategorySeedItem[] };

const INIT_DATA: CategorySeedItem[] = [
	{
		name: "Asset",
		category_type: "asset",
		subCategories: [
			{
				name: "Current Asset",
				accounts: [{ code: "1001", name: "Cash", is_debit: true }],
			},
			{ name: "Non-Current Asset" },
		],
	},
	{
		name: "Liability",
		category_type: "liability",
		subCategories: [{ name: "Current Liability" }, { name: "Non-Current Liability" }],
	},
	{ name: "Equity", category_type: "equity", subCategories: [{ name: "Retained Earnings" }] },
	{
		name: "Revenue",
		category_type: "revenue",
		subCategories: [{ name: "Interest" }, { name: "Dividend" }],
	},
	{
		name: "Expense",
		category_type: "expense",
		subCategories: [{ name: "Operating" }, { name: "Others" }],
	},
];

export function seedAccount(repo: Repo, currentVersion: string) {
	if (currentVersion >= "v0.1.0") return;

	// Seed CategoryTypeEnum
	for (const categoryType of categoryTypes) {
		repo.categoryType.create({ category_type: categoryType, is_deletable: false });
	}

	const seedCategory = (
		category: CategorySeedItem,
		parent_id: CategoryFieldsCreation["parent_id"]
	) => {
		const { name, category_type, accounts, subCategories } = category;

		const category_id = repo.category.create({ parent_id, name, category_type });

		if (accounts) {
			for (const account of accounts) {
				repo.account.create({ category_id, ...account });
			}
		}

		if (subCategories) {
			for (const subCategory of subCategories) {
				seedCategory(subCategory, category_id);
			}
		}
	};

	// Seed initial data
	for (const category of INIT_DATA) {
		seedCategory(category, null);
	}
}
