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
				subCategories: [
					{
						name: "Cash & Equivalent",
						code_prefix: "11|3",
						accounts: [{ code: "11001", name: "Cash", is_debit: true }],
					},
					{ name: "Prepaid Expense", code_prefix: "12|3" },
					{ name: "Account Receivable", code_prefix: "13|3" },
				],
			},
			{ name: "Non-Current Asset" },
		],
	},
	{
		name: "Liability",
		category_type: "liability",
		subCategories: [
			{
				name: "Current Liability",
				subCategories: [
					{ name: "Accrued Expense", code_prefix: "21|3" },
					{ name: "Accounts Payable", code_prefix: "22|3" },
				],
			},
			{ name: "Non-Current Liability", code_prefix: "22|3" },
		],
	},
	{
		name: "Equity",
		category_type: "equity",
		subCategories: [
			{ name: "Retained Earnings" },
			{ name: "Main Budget" },
			{ name: "Secondary Budget" },
		],
	},
	{
		name: "Revenue",
		category_type: "revenue",
		subCategories: [{ name: "Investment", subCategories: [{ name: "Interest Income" }] }],
	},
	{
		name: "Expense",
		category_type: "expense",
		subCategories: [{ name: "Operating Expense", subCategories: [{ name: "Food Expense" }] }],
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
		const { accounts, subCategories, ...categoryFields } = category;

		const category_id = repo.category.create({ ...categoryFields, parent_id });

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
