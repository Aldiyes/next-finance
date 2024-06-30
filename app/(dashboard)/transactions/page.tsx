"use client";

import { Loader, Plus } from "lucide-react";
import { useState } from "react";

import { useBulkDeleteTransactions } from "@/features/transactions/api/use-bulk-delete-transactions";
import { useGetTransactions } from "@/features/transactions/api/use-get-transactions";
import { useNewTransaction } from "@/features/transactions/hooks/use-new-transaction";

import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { columns } from "./columns";
import { ImportCard } from "./import-card";
import { UploadButton } from "./upload-button";

enum VARIANTS {
	LIST = "LIST",
	IMPORT = "IMPORT",
}

const INITIAL_IMPORT_RESULT = {
	data: [],
	errors: [],
	meta: {},
};

export default function TransactionsPage() {
	const [variant, setVariant] = useState<VARIANTS>(VARIANTS.LIST);
	const [importResult, setImportResult] = useState(INITIAL_IMPORT_RESULT);
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

	const onUpload = (result: typeof INITIAL_IMPORT_RESULT) => {
		setImportResult(result);
		setVariant(VARIANTS.IMPORT);
	};

	const onCancleImport = () => {
		setImportResult(INITIAL_IMPORT_RESULT);
		setVariant(VARIANTS.LIST);
	};

	if (variant === VARIANTS.IMPORT) {
		return (
			<>
				<ImportCard
					data={importResult.data}
					onCancle={onCancleImport}
					onSubmit={() => {}}
				/>
			</>
		);
	}
	return (
		<div className="mx-auto -mt-24 w-full max-w-screen-xl pb-10">
			<Card className="border-none drop-shadow-sm">
				<CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
					<CardTitle className="line-clamp-1 text-xl">
						Transactions History
					</CardTitle>
					<div className="flex flex-col items-center gap-x-2 gap-y-2 lg:flex-row">
						<Button
							onClick={newTransaction.onOpen}
							size="sm"
							className="w-full lg:w-auto"
						>
							<Plus className="mr-2 size-4" />
							Add new
						</Button>
						<UploadButton onUpload={onUpload} />
					</div>
				</CardHeader>
				<CardContent>
					<DataTable
						filterKey="payee"
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
