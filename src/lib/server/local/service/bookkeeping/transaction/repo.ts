import type {
	EntryFieldsCreation,
	TransactionFields,
	TransactionFieldsCreation,
	TransactionWithEntry,
} from "#lib/types/transaction.js";

import type { Repo } from "../../repo";

type EntryPayload = Omit<EntryFieldsCreation, "transaction_id">;

function assertEntryCount(entries: EntryPayload[]) {
	if (entries.length < 2) throw new Error("A transaction requires at least two entries");
}

export class TransactionRepo {
	private repo: Repo;

	constructor(repo: Repo) {
		this.repo = repo;
	}

	public getAll() {
		return this.repo.db
			.prepare(
				`
          SELECT * FROM transactions
          ORDER BY datetime ASC, sequence ASC
        `
			)
			.all() as unknown as TransactionFields[];
	}

	public getAllWithEntry(): TransactionWithEntry[] {
		const transactions = this.getAll();
		const entries = this.repo.entry.getAll();

		return transactions.map((transaction) => ({
			...transaction,
			entries: entries.filter(
				({ transaction_id }) => transaction_id === transaction.transaction_id
			),
		}));
	}

	public createTransaction(payload: TransactionFieldsCreation, entries: EntryPayload[]) {
		assertEntryCount(entries);

		const { datetime, description, note = null, sequence = null } = payload;

		return this.repo.runInTransaction(() => {
			const response = this.repo.db
				.prepare(
					`
            INSERT INTO transactions (datetime, description, note, sequence)
            VALUES (?, ?, ?, ?)
            RETURNING transaction_id
          `
				)
				.get(datetime, description, note, sequence);
			const transactionID = response?.transaction_id as number;

			this.createEntries(transactionID, entries);

			return transactionID;
		});
	}

	public updateTransaction(
		payload: Pick<TransactionFields, "transaction_id"> & TransactionFieldsCreation
	) {
		const { transaction_id, datetime, description, note = null, sequence = null } = payload;

		this.repo.db
			.prepare(
				`
          UPDATE transactions
          SET datetime = ?, description = ?, note = ?, sequence = ?
          WHERE transaction_id = ?
        `
			)
			.run(datetime, description, note, sequence, transaction_id);
	}

	public updateTransactionEntry(
		transactionID: TransactionFields["transaction_id"],
		entries: EntryPayload[]
	) {
		assertEntryCount(entries);

		this.repo.runInTransaction(() => {
			this.deleteEntries(transactionID);
			this.createEntries(transactionID, entries);
		});
	}

	public deleteTransaction(transactionID: TransactionFields["transaction_id"]) {
		this.repo.runInTransaction(() => {
			this.deleteEntries(transactionID);
			this.repo.db
				.prepare(
					`
            DELETE FROM transaction_type_info
            WHERE transaction_id = ?
          `
				)
				.run(transactionID);
			this.repo.db
				.prepare(
					`
            DELETE FROM transactions
            WHERE transaction_id = ?
          `
				)
				.run(transactionID);
		});
	}

	private createEntries(
		transactionID: TransactionFields["transaction_id"],
		entries: EntryPayload[]
	) {
		const insert = this.repo.db.prepare(
			`
        INSERT INTO entry (transaction_id, account_id, amount, is_debit)
        VALUES (?, ?, ?, ?)
      `
		);
		for (const { account_id, amount, is_debit } of entries) {
			insert.run(transactionID, account_id, amount, +is_debit);
		}
	}

	private deleteEntries(transactionID: TransactionFields["transaction_id"]) {
		this.repo.db
			.prepare(
				`
          DELETE FROM entry
          WHERE transaction_id = ?
        `
			)
			.run(transactionID);
	}
}
