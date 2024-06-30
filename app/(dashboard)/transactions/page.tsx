"use client";

import { Loader, Plus } from "lucide-react";

import { useBulkDeleteTransactions } from "@/features/transactions/api/use-bulk-delete-transactions";
import { useGetTransactions } from "@/features/transactions/api/use-get-transactions";
import { useNewTransaction } from "@/features/transactions/hooks/use-new-transaction";

import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { columns } from "./columns";

export default function TransactionsPage() {
	const newTransaction = useNewTransaction();
	const deleteTransactions = useBulkDeleteTransactions();
	const transactionsQuery = useGetTransactions();

	const isDisabled =
		transactionsQuery.isLoading || deleteTransactions.isPending;

	const transactions = transactionsQuery.data || [];

	if (transactionsQuery.isLoading) {
		return (
			<div className="mx-auto -mt-24 w-full max-w-screen-xl pb-10">
				<Card className="border-none drop-shadow-sm">
					<CardHeader>
						<Skeleton className="h-8 w-48" />
					</CardHeader>
					<CardContent>
						<div className="flex h-[500px] w-full items-center justify-center">
							<Loader className="size-6 animate-spin text-slate-300" />
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}
	return (
		<div className="mx-auto -mt-24 w-full max-w-screen-xl pb-10">
			<Card className="border-none drop-shadow-sm">
				<CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
					<CardTitle className="line-clamp-1 text-xl">
						Transactions History
					</CardTitle>
					<Button onClick={newTransaction.onOpen} size="sm">
						<Plus className="mr-2 size-4" />
						Add new
					</Button>
				</CardHeader>
				<CardContent>
					<DataTable
						filterKey="date"
						columns={columns}
						data={transactions}
						onDelete={(row) => {
							const ids = row.map((r) => r.original.id);
							deleteTransactions.mutate({ ids });
						}}
						disabled={isDisabled}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
