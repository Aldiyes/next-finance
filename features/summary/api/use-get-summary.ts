import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

import { client } from "@/lib/hono";

export const useGetSummary = () => {
	const params = useSearchParams();

	const from = params.get("from") || "";
	const to = params.get("to") || "";
	const accountId = params.get("accountId") || "";

	const query = useQuery({
		// TODO: Check if params neded in the key
		queryKey: ["summary", { from, to, accountId }],
		queryFn: async () => {
			const res = await client.api.summary.$get({
				query: {
					from,
					to,
					accountId,
				},
			});

			if (!res.ok) {
				throw new Error("Failed to fetch summary");
			}
			const { data } = await res.json();
			return data;
		},
	});

	return query;
};
