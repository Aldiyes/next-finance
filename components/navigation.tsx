"use client";

import { Menu } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useMedia } from "react-use";

import { NavButton } from "@/components/nav-button";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";

const routes = [
	{
		href: "/",
		label: "Overview",
	},
	{
		href: "/transactions",
		label: "Transactions",
	},
	{
		href: "/accounts",
		label: "Accounts",
	},
	{
		href: "/categories",
		label: "Categories",
	},
	{
		href: "/settings",
		label: "Settings",
	},
];

export const Navigation = () => {
	const router = useRouter();
	const pathname = usePathname();
	const [isOpen, setIsOpen] = useState(false);
	const isMobile = useMedia("(max-width: 1024px)", false);

	const onClick = (href: string) => {
		router.push(href);
		setIsOpen(false);
	};

	return (
		<>
			{isMobile ? (
				<Sheet open={isOpen} onOpenChange={setIsOpen}>
					<SheetTrigger asChild>
						<Button
							variant="outline"
							size="sm"
							className="border-none bg-white/10 font-normal text-white outline-none transition hover:bg-white/20 hover:text-white focus:bg-white/30 focus-visible:ring-transparent focus-visible:ring-offset-0"
						>
							<Menu className="size-4" />
						</Button>
					</SheetTrigger>
					<SheetContent side="left" className="px-2">
						<SheetTitle></SheetTitle>
						<SheetDescription></SheetDescription>
						<nav className="flex flex-col gap-y-2 pt-6">
							{routes.map((route) => (
								<Button
									key={route.href}
									onClick={() => onClick(route.href)}
									variant={route.href === pathname ? "secondary" : "ghost"}
									className="w-full justify-start"
								>
									{route.label}
								</Button>
							))}
						</nav>
					</SheetContent>
				</Sheet>
			) : (
				<nav className="hidden items-center gap-x-2 overflow-x-auto lg:flex">
					{routes.map((route) => (
						<NavButton
							key={route.href}
							href={route.href}
							label={route.label}
							isActive={pathname === route.href}
						/>
					))}
				</nav>
			)}
		</>
	);
};
