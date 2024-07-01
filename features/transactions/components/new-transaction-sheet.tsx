import { Loader } from "lucide-react";
import * as z from "zod";

import { insertTransactionSchema } from "@/db/schema";

import { useCreateTransaction } from "@/features/transactions/api/use-create-transaction";
import { TransactionForm } from "@/features/transactions/components/transaction-form";
import { useNewTransaction } from "@/features/transactions/hooks/use-new-transaction";

import { useCreateCategory } from "@/features/categories/api/use-create-category";
import { useGetCategories } from "@/features/categories/api/use-get-categories";

import { useCreateAccount } from "@/features/accounts/api/use-create-account";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";

import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";

const formSchema = insertTransactionSchema.omit({
	id: true,
});

type FormValues = z.input<typeof formSchema>;

export const NewTransactionSheet = () => {
	const { isOpen, onClose } = useNewTransaction();
	const createMutation = useCreateTransaction();

	const categoryMutation = useCreateCategory();
	const categoryQuery = useGetCategories();

	const onCreateCategory = (name: string) =>
		categoryMutation.mutate({
			name,
		});

	const categoryOptions = (
		Array.isArray(categoryQuery.data) ? categoryQuery.data : []
	).map((category) => ({
		label: category.name,
		value: category.id,
	}));

	const accountMutation = useCreateAccount();
	const accountQuery = useGetAccounts();

	const onCreateAccount = (name: string) =>
		accountMutation.mutate({
			name,
		});

	const accountOptions = (
		Array.isArray(accountQuery.data) ? accountQuery.data : []
	).map((account) => ({
		label: account.name,
		value: account.id,
	}));

	const onSubmit = (values: FormValues) => {
		createMutation.mutate(values, {
			onSuccess: () => onClose(),
		});
	};

	const isPending =
		createMutation.isPending ||
		categoryMutation.isPending ||
		accountMutation.isPending;

	const isLoading = categoryQuery.isLoading || accountQuery.isLoading;

	return (
		<Sheet open={isOpen} onOpenChange={onClose}>
			<SheetContent className="space-y-4">
				<SheetHeader>
					<SheetTitle>New Transaction</SheetTitle>
					<SheetDescription>Add a new transaction.</SheetDescription>
				</SheetHeader>
				{isLoading ? (
					<div className="absolute inset-0 flex items-center justify-center">
						<Loader className="size-4 animate-spin text-muted-foreground" />
					</div>
				) : (
					<TransactionForm
						onSubmit={onSubmit}
						disabled={isPending}
						categoryOptions={categoryOptions}
						onCreateCategory={onCreateCategory}
						accountOptions={accountOptions}
						onCreateAccount={onCreateAccount}
					/>
				)}
			</SheetContent>
		</Sheet>
	);
};
