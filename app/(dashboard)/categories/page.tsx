"use client";

import { Loader, Plus } from "lucide-react";

import { useBulkDeleteCategories } from "@/features/categories/api/use-bulk-delete-categories";
import { useGetCategories } from "@/features/categories/api/use-get-categories";
import { useNewCategory } from "@/features/categories/hooks/use-new-category";

import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { columns } from "./columns";

export default function CategoriesPage() {
	const newCategory = useNewCategory();
	const deleteCategories = useBulkDeleteCategories();
	const categoriesQuery = useGetCategories();

	const isDisabled = categoriesQuery.isLoading || deleteCategories.isPending;

	const categories = categoriesQuery.data || [];

	if (categoriesQuery.isLoading) {
		return (
			<div className="mx-auto -mt-24 w-full max-w-screen-xl pb-10">
				<Card className="border-none drop-shadow-sm">
					<CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
						<Skeleton className="h-8 w-48 bg-neutral-200" />
						<Skeleton className="h-8 w-28 bg-neutral-200" />
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
						Categories Page
					</CardTitle>
					<Button onClick={newCategory.onOpen} size="sm">
						<Plus className="mr-2 size-4" />
						Add new
					</Button>
				</CardHeader>
				<CardContent>
					<DataTable
						filterKey="name"
						columns={columns}
						data={categories}
						onDelete={(row) => {
							const ids = row.map((r) => r.original.id);
							deleteCategories.mutate({ ids });
						}}
						disabled={isDisabled}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
