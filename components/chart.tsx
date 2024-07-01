import { AreaChart, BarChart, LineChart, SearchIcon } from "lucide-react";
import { useState } from "react";

import { AreaVariant } from "@/components/area-variant";
import { BarVariant } from "@/components/bar-variant";
import { LineVariant } from "@/components/line-variant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

type Props = {
	data?: {
		date: string;
		income: number;
		expenses: number;
	}[];
};

export const Chart = ({ data = [] }: Props) => {
	const [chartType, setChartType] = useState("area");

	const onTypeChange = (type: string) => {
		// TODO: Add paywall
		setChartType(type);
	};
	return (
		<Card className="border-none drop-shadow-sm">
			<CardHeader className="flex justify-between space-y-2 lg:flex-row lg:items-center lg:space-y-0">
				<CardTitle className="line-clamp-1 text-xl">Transactions</CardTitle>
				<Select defaultValue={chartType} onValueChange={onTypeChange}>
					<SelectTrigger className="h-9 rounded-md px-3 lg:w-auto">
						<SelectValue placeholder={chartType} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="area">
							<div className="flex items-center">
								<AreaChart className="shirnk-0 mr-2 size-4" />
								<p className="line-clamp-1">Area chart</p>
							</div>
						</SelectItem>
						<SelectItem value="line">
							<div className="flex items-center">
								<LineChart className="shirnk-0 mr-2 size-4" />
								<p className="line-clamp-1">Line chart</p>
							</div>
						</SelectItem>
						<SelectItem value="bar">
							<div className="flex items-center">
								<BarChart className="shirnk-0 mr-2 size-4" />
								<p className="line-clamp-1">Bar chart</p>
							</div>
						</SelectItem>
					</SelectContent>
				</Select>
			</CardHeader>
			<CardContent>
				{data.length === 0 ? (
					<div className="flex h-[350px] w-full flex-col items-center justify-center gap-y-4">
						<SearchIcon className="size-6 text-muted-foreground" />
						<p className="text-sm text-muted-foreground">
							No data for this period
						</p>
					</div>
				) : (
					<>
						{chartType === "area" && <AreaVariant data={data} />}
						{chartType === "bar" && <BarVariant data={data} />}
						{chartType === "line" && <LineVariant data={data} />}
					</>
				)}
			</CardContent>
		</Card>
	);
};
