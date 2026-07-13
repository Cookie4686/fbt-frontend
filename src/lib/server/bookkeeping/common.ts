import type {
	Account as ProtoAccount,
	Entry as ProtoEntry,
	TransactionEntry as ProtoTransactionEntry,
} from "$lib/proto/bookkeeping/v1/common_pb";

import type { Account, Entry, TransactionEntry } from "../../schema/account";

export function ProtoToAccount(account: ProtoAccount): Account {
	return {
		id: account.id,
		name: account.name,
		isDebit: account.isDebit,
		userID: account.userId,
	};
}

export function ProtoToTransactionEntry(transactionEntry: ProtoTransactionEntry): TransactionEntry {
	return {
		id: Number(transactionEntry.id),
		datetime:
			transactionEntry.time ?
				new Date(Number(transactionEntry.time.seconds)).toISOString()
			:	new Date(Date.now()).toISOString(),
		entries: transactionEntry.entries.map((e) => ProtoToEntry(e)),
	};
}

function ProtoToEntry(entry: ProtoEntry): Entry {
	return {
		accountID: entry.accountId,
		amount: entry.amount,
	};
}
