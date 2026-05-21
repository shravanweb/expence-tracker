import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
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
