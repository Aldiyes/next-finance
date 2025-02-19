import { format, parse } from "date-fns";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImportTable } from "./import-table";

type Props = {
	data: string[][];
	onCancle: () => void;
	onSubmit: (data: any) => void;
};

const dateFormat = "yyyy-MM-dd HH:mm:ss";
const outputFormat = "yyyy-MM-dd";

const requiredOptions = ["amount", "date", "payee"];

interface SelectedColumnState {
	[key: string]: string | null;
}

export const ImportCard = ({ data, onCancle, onSubmit }: Props) => {
	const [selectedColumns, setSelectedColumns] = useState<SelectedColumnState>(
		{},
	);

	const headers = data[0];
	const body = data.slice(1);

	const onTableHeadSelectChange = (
		columnIndex: number,
		value: string | null,
	) => {
		setSelectedColumns((prev) => {
			const newSelectedColumns = { ...prev };

			for (const key in newSelectedColumns) {
				if (newSelectedColumns[key] === value) {
					newSelectedColumns[key] = null;
				}
			}

			if (value === "skip") {
				value = null;
			}

			newSelectedColumns[`column_${columnIndex}`] = value;

			return newSelectedColumns;
		});
	};

	const progress = Object.values(selectedColumns).filter(Boolean).length;

	const handleContinue = () => {
		const getColumnIndex = (column: string) => {
			return column.split("_")[1];
		};

		const mappedData = {
			headers: headers.map((_header, index) => {
				const columnIndex = getColumnIndex(`column_${index}`);
				return selectedColumns[`column_${columnIndex}`] || null;
			}),
			body: body
				.map((row) => {
					const transformedRow = row.map((cell, index) => {
						const columnIndex = getColumnIndex(`column_${index}`);
						return selectedColumns[`column_${columnIndex}`] ? cell : null;
					});

					return transformedRow.every((item) => item === null)
						? []
						: transformedRow;
				})
				.filter((row) => row.length > 0),
		};

		const arrayOfData = mappedData.body.map((row) => {
			return row.reduce((acc: any, cell, index) => {
				const header = mappedData.headers[index];
				if (header !== null) {
					acc[header] = cell;
				}

				return acc;
			}, {});
		});

		const formatedData = arrayOfData.map((item) => ({
			...item,
			amount: parseFloat(item.amount),
			date: format(parse(item.date, dateFormat, new Date()), outputFormat),
		}));

		onSubmit(formatedData);
	};

	return (
		<div className="mx-auto -mt-24 w-full max-w-screen-xl pb-10">
			<Card className="border-none drop-shadow-sm">
				<CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
					<CardTitle className="line-clamp-1 text-xl">
						Import Transaction
					</CardTitle>
					<div className="flex flex-col items-center gap-x-2 gap-y-2 lg:flex-row">
						<Button onClick={onCancle} size="sm" className="w-full lg:w-auto">
							Cancle
						</Button>
						<Button
							disabled={progress < requiredOptions.length}
							onClick={handleContinue}
							className="w-full lg:w-auto"
						>
							Continue ({progress} / {requiredOptions.length})
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<ImportTable
						headers={headers}
						body={body}
						selectedColumns={selectedColumns}
						onTableHeadSelectChange={onTableHeadSelectChange}
					/>
				</CardContent>
			</Card>
		</div>
	);
};
