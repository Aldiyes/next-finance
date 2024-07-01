import { useOpenAccount } from "@/features/accounts/hooks/use-open-account";

import { cn } from "@/lib/utils";

type Props = {
	account: string;
	accountId: string;
};

export const AccountColumn = ({ account, accountId }: Props) => {
	const { onOpen: onOpenAccount } = useOpenAccount();

	const onClick = () => {
		onOpenAccount(accountId);
	};
	return (
		<div
			role="button"
			onClick={onClick}
			className="flex cursor-pointer items-center hover:underline"
		>
			{account}
		</div>
	);
};
