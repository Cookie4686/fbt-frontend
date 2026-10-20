export interface AccountFields {
	account_id: number;
	category_id: number;
	code: string;
	name: string;
	is_debit: boolean;
}

export type AccountFieldsCreation = Omit<AccountFields, "account_id">;
