import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

import { db } from "@/db/drizzle";
import { accounts, insertAccountSchema } from "@/db/schema";
import { eq } from "drizzle-orm";

import { createId } from "@paralleldrive/cuid2";

const app = new Hono()
	.get("/", clerkMiddleware(), async (c) => {
		const start = Date.now();
		const auth = getAuth(c);

		if (!auth?.userId) {
			const responseTimeMs = Date.now() - start;

			return c.json(
				{
					error: {
						code: 401,
						message:
							"Unauthorized: Access is denied due to invalid credentials.",
						details:
							"You must provide valid authentication credentials to access this resource. Ensure that your API key or access token is included and correct.",
						suggestions: [
							"Verify that your API key or access token is correctly included in the request headers.",
							"Refer to the authentication section in our API documentation for more details.",
							"If you continue to experience issues, please contact support at support@example.com.",
						],
						error_id: "unauthorized-401",
						timestamp: new Date().toISOString(),
					},
					status: "error",
					success: false,
					metadata: {
						request_id: createId(),
						response_time_ms: responseTimeMs,
						api_version: "1.0.0",
					},
				},
				401,
			);
		}

		const data_accounts = await db
			.select({
				id: accounts.id,
				name: accounts.name,
			})
			.from(accounts)
			.where(eq(accounts.userId, auth.userId));

		const responseTimeMs = Date.now() - start;

		return c.json({
			data: {
				data_accounts,
				metadata: {
					request_id: createId(),
					response_time_ms: responseTimeMs,
					api_version: "1.0.0",
				},
			},
			status: "success",
			success: true,
		});
	})
	.post(
		"/",
		clerkMiddleware(),
		zValidator(
			"json",
			insertAccountSchema.pick({
				name: true,
			}),
		),
		async (c) => {
			const start = Date.now();
			const auth = getAuth(c);

			const values = c.req.valid("json");

			if (!auth?.userId) {
				const responseTimeMs = Date.now() - start;

				return c.json(
					{
						error: {
							code: 401,
							message:
								"Unauthorized: Access is denied due to invalid credentials.",
							details:
								"You must provide valid authentication credentials to access this resource. Ensure that your API key or access token is included and correct.",
							suggestions: [
								"Verify that your API key or access token is correctly included in the request headers.",
								"Refer to the authentication section in our API documentation for more details.",
								"If you continue to experience issues, please contact support at support@example.com.",
							],
							error_id: "unauthorized-401",
							timestamp: new Date().toISOString(),
						},
						status: "error",
						success: false,
						metadata: {
							request_id: createId(),
							response_time_ms: responseTimeMs,
							api_version: "1.0.0",
						},
					},
					401,
				);
			}

			const [createAccount] = await db
				.insert(accounts)
				.values({
					id: createId(),
					userId: auth.userId,
					...values,
				})
				.returning();

			return c.json(
				{
					data: createAccount,
					status: "success",
					success: true,
				},
				200,
			);
		},
	);

export default app;
