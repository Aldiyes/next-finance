import { cn } from "@/lib/utils";
import { Poppins } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

const poppins = Poppins({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700", "800", "900"],
});

export const HeaderLogo = () => {
	return (
		<Link href="/">
			<div className="hidden items-center lg:flex">
				<Image
					src="/logo.svg"
					alt="logo"
					height={28}
					width={28}
					className="h-auto w-7"
					priority
				/>
				<p
					className={cn(
						"ml-2 text-2xl font-semibold text-white",
						poppins.className,
					)}
				>
					Next Finance
				</p>
			</div>
		</Link>
	);
};
