import { ClerkLoaded, ClerkLoading, UserButton } from "@clerk/nextjs";
import { Loader } from "lucide-react";

import { HeaderLogo } from "@/components/header-logo";
import { Navigation } from "@/components/navigation";
import { WelcomeMessage } from "@/components/welcome-message";

export const Header = () => {
	return (
		<header className="bg-gradient-to-b from-blue-700 to-blue-500 px-4 py-8 pb-36 lg:px-14">
			<div className="mx-auto max-w-screen-2xl">
				<div className="mb-14 flex w-full items-center justify-between">
					<div className="flex items-center lg:gap-x-16">
						<HeaderLogo />
						<Navigation />
					</div>
					<ClerkLoaded>
						<UserButton afterSignOutUrl="/" />
					</ClerkLoaded>
					<ClerkLoading>
						<Loader className="size-8 animate-spin text-slate-400" />
					</ClerkLoading>
				</div>
				<WelcomeMessage />
			</div>
		</header>
	);
};
