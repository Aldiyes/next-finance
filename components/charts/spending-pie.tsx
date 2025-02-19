import { FileSearch, Loader, PieChart, Radar, Target } from "lucide-react";
import { useState } from "react";

import { PieVariant } from "@/components/charts/pie-variant";
import { RadarVariant } from "@/components/charts/radar-variant";
import { RadialVariant } from "@/components/charts/radial-variant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
	data?: {
		name: string;
		value: number;
	}[];
};

export const SpendingPie = ({ data = [] }: Props) => {
	const [chartType, setChartType] = useState("pie");

	const onTypeChange = (type: string) => {
		// TODO: Add paywall
		setChartType(type);
	};
	return (
		<Card className="border-none drop-shadow-sm">
			<CardHeader className="flex justify-between space-y-2 lg:flex-row lg:items-center lg:space-y-0">
				<CardTitle className="line-clamp-1 text-xl">Categories</CardTitle>
				<Select defaultValue={chartType} onValueChange={onTypeChange}>
					<SelectTrigger className="h-9 rounded-md px-3 lg:w-auto">
						<SelectValue placeholder={chartType} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="pie">
							<div className="flex items-center">
								<PieChart className="shirnk-0 mr-2 size-4" />
								<p className="line-clamp-1">Pie chart</p>
							</div>
						</SelectItem>
						<SelectItem value="radar">
							<div className="flex items-center">
								<Radar className="shirnk-0 mr-2 size-4" />
								<p className="line-clamp-1">Radar chart</p>
							</div>
						</SelectItem>
						<SelectItem value="radial">
							<div className="flex items-center">
								<Target className="shirnk-0 mr-2 size-4" />
								<p className="line-clamp-1">Radial chart</p>
							</div>
						</SelectItem>
					</SelectContent>
				</Select>
			</CardHeader>
			<CardContent>
				{data.length === 0 ? (
					<div className="flex h-[350px] w-full flex-col items-center justify-center gap-y-4">
						<FileSearch className="size-6 text-muted-foreground" />
						<p className="text-sm text-muted-foreground">
							No data for this period
						</p>
					</div>
				) : (
					<>
						{chartType === "pie" && <PieVariant data={data} />}
						{chartType === "radar" && <RadarVariant data={data} />}
						{chartType === "radial" && <RadialVariant data={data} />}
					</>
				)}
			</CardContent>
		</Card>
	);
};

SpendingPie.Skeleton = function SpendingPieSkeleton() {
	return (
		<Card className="border-none drop-shadow-sm">
			<CardHeader className="flex justify-between space-y-2 lg:flex-row lg:items-center lg:space-y-0">
				<Skeleton className="h-8 w-48 bg-neutral-200" />
				<Skeleton className="h-8 w-full bg-neutral-200 lg:w-[120px]" />
			</CardHeader>
			<CardContent>
				<div className="flex h-[350px] w-full items-center justify-center">
					<Loader className="size-6 animate-spin text-slate-300" />
				</div>
			</CardContent>
		</Card>
	);
};
