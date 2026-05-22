import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import type { ImportRow } from "@/lib/transaction-io";
import type { Transaction } from "@/components/TransactionsList";
import { db } from "@/lib/firebase";

function transactionsRef(userId: string) {
  return collection(db, "users", userId, "transactions");
}

export async function fetchTransactions(userId: string): Promise<Transaction[]> {
  const q = query(transactionsRef(userId), orderBy("transaction_date", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      type: data.type as Transaction["type"],
      amount: Number(data.amount),
      category: data.category as string,
      description: (data.description as string | null) ?? null,
      transaction_date: data.transaction_date as string,
    };
  });
}

export async function addTransaction(
  userId: string,
  data: Omit<Transaction, "id">,
): Promise<void> {
  await addDoc(transactionsRef(userId), {
    ...data,
    created_at: serverTimestamp(),
  });
}

export async function removeTransaction(userId: string, transactionId: string): Promise<void> {
  await deleteDoc(doc(db, "users", userId, "transactions", transactionId));
}

const IMPORT_BATCH_SIZE = 400;

export async function importTransactions(userId: string, rows: ImportRow[]): Promise<number> {
  let imported = 0;

  for (let i = 0; i < rows.length; i += IMPORT_BATCH_SIZE) {
    const chunk = rows.slice(i, i + IMPORT_BATCH_SIZE);
    const batch = writeBatch(db);

    for (const row of chunk) {
      const ref = doc(transactionsRef(userId));
      batch.set(ref, {
        type: row.type,
        amount: row.amount,
        category: row.category,
        description: row.description ?? null,
        transaction_date: row.transaction_date,
        created_at: serverTimestamp(),
      });
    }

    await batch.commit();
    imported += chunk.length;
  }

  return imported;
}
