import * as z from "zod";

import { Trash } from "lucide-react";

import { insertAccountSchema } from "@/db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = insertAccountSchema.pick({
	name: true,
});

type FormValues = z.input<typeof formSchema>;

type Props = {
	id?: string;
	defaultValues?: FormValues;
	onSubmit: (values: FormValues) => void;
	onDelete?: () => void;
	disabled?: boolean;
};

export const AccountForm = ({
	id,
	defaultValues,
	onSubmit,
	onDelete,
	disabled,
}: Props) => {
	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: defaultValues,
	});

	const handleSubmit = (values: FormValues) => {
		onSubmit(values);
	};

	const handleDelete = () => {
		onDelete?.();
	};
	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(handleSubmit)}
				className="space-y-4 pt-4"
			>
				<FormField
					name="name"
					control={form.control}
					render={({ field }) => (
						<FormItem>
							<FormLabel>Name</FormLabel>
							<FormControl>
								<Input
									disabled={disabled}
									placeholder="e.g. Cash, Bank, Credit Card"
									{...field}
								/>
							</FormControl>
						</FormItem>
					)}
				/>
				<Button disabled={disabled} className="w-full">
					{id ? "Save Changes" : "Create account"}
				</Button>
				{!!id && (
					<Button
						type="button"
						variant="outline"
						size="icon"
						disabled={disabled}
						onClick={handleDelete}
						className="w-full"
					>
						<Trash className="mr-2 size-4" />
						Delete account
					</Button>
				)}
			</form>
		</Form>
	);
};
