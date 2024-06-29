"use client";

import { Button } from "@/components/ui/button";
import { useNewAccount } from "@/features/accounts/hooks/use-new-account";

export default function DashboardPage() {
	const { onOpen } = useNewAccount();
	return (
		<div>
			<Button onClick={onOpen}>Create an account</Button>
		</div>
	);
}
