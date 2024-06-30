"use client";

import { Loader, Plus } from "lucide-react";

import { useBulkDeleteAccounts } from "@/features/accounts/api/use-bulk-delete-accounts";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";
import { useNewTransaction } from "@/features/transactions/hooks/use-new-transaction";

import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { columns } from "./columns";

export default function TransactionsPage() {
	const newTransaction = useNewTransaction();
	const deleteAccounts = useBulkDeleteAccounts();
	const accountsQuery = useGetAccounts();

	const isDisabled = accountsQuery.isLoading || deleteAccounts.isPending;

	const accounts = accountsQuery.data || [];

	if (accountsQuery.isLoading) {
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
						filterKey="name"
						columns={columns}
						data={accounts}
						onDelete={(row) => {
							const ids = row.map((r) => r.original.id);
							deleteAccounts.mutate({ ids });
						}}
						disabled={isDisabled}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
