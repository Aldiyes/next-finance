"use client";

import { useSearchParams } from "next/navigation";
import { FaPiggyBank } from "react-icons/fa";
import { FaArrowTrendDown, FaArrowTrendUp } from "react-icons/fa6";

import { useGetSummary } from "@/features/summary/api/use-get-summary";

import { formatDateRange } from "@/lib/utils";

import { DataCard } from "@/components/data-card";

export const DataGrid = () => {
	const { data, isLoading } = useGetSummary();
	const params = useSearchParams();
	const to = params.get("to") || undefined;
	const from = params.get("from") || undefined;

	const dateRangeLabel = formatDateRange({ to, from });

	if (isLoading) {
		return (
			<div className="mb-8 grid grid-cols-1 gap-8 pb-2 lg:grid-cols-3">
				<DataCard.Skeleton />
				<DataCard.Skeleton />
				<DataCard.Skeleton />
			</div>
		);
	}

	return (
		<div className="mb-8 grid grid-cols-1 gap-8 pb-2 lg:grid-cols-3">
			<DataCard
				title="Remaining"
				value={data?.remainingAmount}
				percentageChange={data?.remainingChange}
				icon={FaPiggyBank}
				variant="waring"
				dateRange={dateRangeLabel}
			/>
			<DataCard
				title="Income"
				value={data?.incomeAmount}
				percentageChange={data?.incomeChange}
				icon={FaArrowTrendUp}
				variant="success"
				dateRange={dateRangeLabel}
			/>
			<DataCard
				title="Expenses"
				value={data?.expensesAmount}
				percentageChange={data?.expensesChange}
				icon={FaArrowTrendDown}
				variant="danger"
				dateRange={dateRangeLabel}
			/>
		</div>
	);
};
