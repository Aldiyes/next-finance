import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { QueryProvider } from "@/providers/query-provider";
import { SheetProvider } from "@/providers/sheet-provider";
import { ClerkProvider } from "@clerk/nextjs";

import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Next Finance",
	description:
		"Next Finance is your comprehensive solution for managing personal and business finances. Track expenses, create budgets, analyze financial trends, and make informed decisions with our intuitive platform. Achieve your financial goals with ease and confidence using Next Finance.",
	icons: [
		{
			url: "/logo.svg",
			href: "/logo.svg",
		},
	],
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<ClerkProvider>
			<html lang="en">
				<body className={inter.className}>
					<QueryProvider>
						<SheetProvider />
						<Toaster />
						{children}
					</QueryProvider>
				</body>
			</html>
		</ClerkProvider>
	);
}
