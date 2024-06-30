import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { parse, subDays } from "date-fns";
import { and, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { Hono } from "hono";
import * as z from "zod";

import { db } from "@/db/drizzle";
import {
	accounts,
	categories,
	insertTransactionSchema,
	transactions,
} from "@/db/schema";

import { createId } from "@paralleldrive/cuid2";

const app = new Hono()
	.get(
		"/",
		clerkMiddleware(),
		zValidator(
			"query",
			z.object({
				from: z.string().optional(),
				to: z.string().optional(),
				accountId: z.string().optional(),
			}),
		),
		async (c) => {
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
								"If you continue to experience issues, please contact support at aldiyes17032002@gmail.com.",
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

			const { from, to, accountId } = c.req.valid("query");

			const defaultTo = new Date();
			const defaultFrom = subDays(defaultTo, 30);

			const startDate = from
				? parse(from, "yyyy-MM-dd", new Date())
				: defaultFrom;

			const endDate = to ? parse(to, "yyyy-MM-dd", new Date()) : defaultTo;

			const data = await db
				.select({
					id: transactions.id,
					category: categories.name,
					categoryId: transactions.categoryId,
					payee: transactions.payee,
					amount: transactions.amount,
					notes: transactions.notes,
					account: accounts.name,
					accountId: transactions.accountId,
					date: transactions.date,
				})
				.from(transactions)
				.innerJoin(accounts, eq(transactions.accountId, accounts.id))
				.leftJoin(categories, eq(transactions.categoryId, categories.id))
				.where(
					and(
						accountId ? eq(transactions.accountId, accounts.id) : undefined,
						eq(accounts.userId, auth.userId),
						gte(transactions.date, startDate),
						lte(transactions.date, endDate),
					),
				)
				.orderBy(desc(transactions.date));

			return c.json({
				data,
				status: "success",
				success: true,
			});
		},
	)
	.get(
		"/:id",
		clerkMiddleware(),
		zValidator(
			"param",
			z.object({
				id: z.string().optional(),
			}),
		),
		async (c) => {
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
								"If you continue to experience issues, please contact support at aldiyes17032002@gmail.com.",
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

			const { id } = c.req.valid("param");

			if (!id) {
				const responseTimeMs = Date.now() - start;
				return c.json(
					{
						error: {
							code: 400,
							message: "Bad Request: Missing required parameter 'id'.",
							details:
								"You must provide a valid 'id' parameter to access this resource.",
							suggestions: [
								"Ensure that the 'id' parameter is included in your request.",
								"Refer to the parameters section in our API documentation for more details.",
								"If you continue to experience issues, please contact support at aldiyes17032002@gmail.com.",
							],
							error_id: "missing-id-400",
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
					400,
				);
			}

			const [data] = await db
				.select({
					id: transactions.id,
					categoryId: transactions.categoryId,
					payee: transactions.payee,
					amount: transactions.amount,
					notes: transactions.notes,
					accountId: transactions.accountId,
					date: transactions.date,
				})
				.from(transactions)
				.innerJoin(accounts, eq(transactions.accountId, accounts.id))
				.where(and(eq(accounts.userId, auth.userId), eq(transactions.id, id)));

			if (!data) {
				const responseTimeMs = Date.now() - start;
				return c.json(
					{
						error: {
							code: 404,
							message: "Not Found: The requested resource could not be found.",
							details:
								"The transaction with the specified 'id' does not exist or you do not have access to it.",
							suggestions: [
								"Verify that the 'id' parameter is correct.",
								"Ensure that you have the necessary permissions to access this transaction.",
								"Refer to the resource section in our API documentation for more details.",
								"If you continue to experience issues, please contact support at aldiyes17032002@gmail.com.",
							],
							error_id: "not-found-404",
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
					404,
				);
			}

			return c.json({ data, status: "success", success: true });
		},
	)
	.post(
		"/",
		clerkMiddleware(),
		zValidator(
			"json",
			insertTransactionSchema.omit({
				id: true,
			}),
		),
		async (c) => {
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
								"If you continue to experience issues, please contact support at aldiyes17032002@gmail.com.",
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

			const values = c.req.valid("json");

			const [data] = await db
				.insert(transactions)
				.values({
					id: createId(),
					...values,
				})
				.returning();

			return c.json(
				{
					data,
					status: "success",
					success: true,
				},
				200,
			);
		},
	)
	.post(
		"/bulk-create",
		clerkMiddleware(),
		zValidator(
			"json",
			z.array(
				insertTransactionSchema.omit({
					id: true,
				}),
			),
		),
		async (c) => {
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
								"If you continue to experience issues, please contact support at aldiyes17032002@gmail.com.",
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

			const values = c.req.valid("json");

			const data = await db
				.insert(transactions)
				.values(
					values.map((value) => ({
						id: createId(),
						...value,
					})),
				)
				.returning();

			return c.json({ data, status: "success", success: true });
		},
	)
	.post(
		"/bulk-delete",
		clerkMiddleware(),
		zValidator(
			"json",
			z.object({
				ids: z.array(z.string()),
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
								"If you continue to experience issues, please contact support at aldiyes17032002@gmail.com.",
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

			const transactionsToDelete = db.$with("transactions_to_delete").as(
				db
					.select({ id: transactions.id })
					.from(transactions)
					.innerJoin(accounts, eq(transactions.accountId, accounts.id))
					.where(
						and(
							inArray(transactions.id, values.ids),
							eq(accounts.userId, auth.userId),
						),
					),
			);

			const data = await db
				.with(transactionsToDelete)
				.delete(transactions)
				.where(
					inArray(
						transactions.id,
						sql`(SELECT id FROM ${transactionsToDelete})`,
					),
				)
				.returning({
					id: transactions.id,
				});

			return c.json({ data, status: "success", success: true });
		},
	)
	.patch(
		"/:id",
		clerkMiddleware(),
		zValidator(
			"param",
			z.object({
				id: z.string().optional(),
			}),
		),
		zValidator(
			"json",
			insertTransactionSchema.omit({
				id: true,
			}),
		),
		async (c) => {
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
								"If you continue to experience issues, please contact support at aldiyes17032002@gmail.com.",
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

			const { id } = c.req.valid("param");

			if (!id) {
				const responseTimeMs = Date.now() - start;
				return c.json(
					{
						error: {
							code: 400,
							message: "Bad Request: Missing required parameter 'id'.",
							details:
								"You must provide a valid 'id' parameter to access this resource.",
							suggestions: [
								"Ensure that the 'id' parameter is included in your request.",
								"Refer to the parameters section in our API documentation for more details.",
								"If you continue to experience issues, please contact support at aldiyes17032002@gmail.com.",
							],
							error_id: "missing-id-400",
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
					400,
				);
			}

			const values = c.req.valid("json");

			const transactionsToUpdate = db.$with("transactions_to_update").as(
				db
					.select({ id: transactions.id })
					.from(transactions)
					.innerJoin(accounts, eq(transactions.accountId, accounts.id))
					.where(
						and(eq(transactions.id, id), eq(accounts.userId, auth.userId)),
					),
			);

			const [data] = await db
				.with(transactionsToUpdate)
				.update(transactions)
				.set(values)
				.where(
					inArray(
						transactions.id,
						sql`(SELECT id FROM ${transactionsToUpdate})`,
					),
				)
				.returning();

			if (!data) {
				const responseTimeMs = Date.now() - start;
				return c.json(
					{
						error: {
							code: 404,
							message: "Not Found: The requested resource could not be found.",
							details:
								"The transaction with the specified 'id' does not exist or you do not have access to it.",
							suggestions: [
								"Verify that the 'id' parameter is correct.",
								"Ensure that you have the necessary permissions to access this transaction.",
								"Refer to the resource section in our API documentation for more details.",
								"If you continue to experience issues, please contact support at aldiyes17032002@gmail.com.",
							],
							error_id: "not-found-404",
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
					404,
				);
			}

			return c.json({ data, status: "success", success: true });
		},
	)
	.delete(
		"/:id",
		clerkMiddleware(),
		zValidator(
			"param",
			z.object({
				id: z.string().optional(),
			}),
		),
		async (c) => {
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
								"If you continue to experience issues, please contact support at aldiyes17032002@gmail.com.",
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

			const { id } = c.req.valid("param");

			if (!id) {
				const responseTimeMs = Date.now() - start;
				return c.json(
					{
						error: {
							code: 400,
							message: "Bad Request: Missing required parameter 'id'.",
							details:
								"You must provide a valid 'id' parameter to access this resource.",
							suggestions: [
								"Ensure that the 'id' parameter is included in your request.",
								"Refer to the parameters section in our API documentation for more details.",
								"If you continue to experience issues, please contact support at aldiyes17032002@gmail.com.",
							],
							error_id: "missing-id-400",
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
					400,
				);
			}

			const transactionsToDelete = db.$with("transactions_to_delete").as(
				db
					.select({ id: transactions.id })
					.from(transactions)
					.innerJoin(accounts, eq(transactions.accountId, accounts.id))
					.where(
						and(eq(transactions.id, id), eq(accounts.userId, auth.userId)),
					),
			);

			const [data] = await db
				.with(transactionsToDelete)
				.delete(transactions)
				.where(
					inArray(
						transactions.id,
						sql`(SELECT id FROM ${transactionsToDelete})`,
					),
				)
				.returning({
					id: transactions.id,
				});

			if (!data) {
				const responseTimeMs = Date.now() - start;
				return c.json(
					{
						error: {
							code: 404,
							message: "Not Found: The requested resource could not be found.",
							details:
								"The transaction with the specified 'id' does not exist or you do not have access to it.",
							suggestions: [
								"Verify that the 'id' parameter is correct.",
								"Ensure that you have the necessary permissions to access this transaction.",
								"Refer to the resource section in our API documentation for more details.",
								"If you continue to experience issues, please contact support at aldiyes17032002@gmail.com.",
							],
							error_id: "not-found-404",
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
					404,
				);
			}

			return c.json({ data, status: "success", success: true });
		},
	);

export default app;
