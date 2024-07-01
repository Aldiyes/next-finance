import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { and, eq, inArray } from "drizzle-orm";
import { Hono } from "hono";
import * as z from "zod";

import { db } from "@/db/drizzle";
import { categories, insertCategorySchema } from "@/db/schema";

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

		const data = await db
			.select({
				id: categories.id,
				name: categories.name,
			})
			.from(categories)
			.where(eq(categories.userId, auth.userId));

		return c.json({
			data,
			status: "success",
			success: true,
		});
	})
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
					id: categories.id,
					name: categories.name,
				})
				.from(categories)
				.where(and(eq(categories.userId, auth.userId), eq(categories.id, id)));

			if (!data) {
				const responseTimeMs = Date.now() - start;
				return c.json(
					{
						error: {
							code: 404,
							message: "Not Found: The requested resource could not be found.",
							details:
								"The category with the specified 'id' does not exist or you do not have access to it.",
							suggestions: [
								"Verify that the 'id' parameter is correct.",
								"Ensure that you have the necessary permissions to access this category.",
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
			insertCategorySchema.pick({
				name: true,
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
				.insert(categories)
				.values({
					id: createId(),
					userId: auth.userId,
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

			const data = await db
				.delete(categories)
				.where(
					and(
						eq(categories.userId, auth.userId),
						inArray(categories.id, values.ids),
					),
				)
				.returning({ id: categories.id });

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
			insertCategorySchema.pick({
				name: true,
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

			const [data] = await db
				.update(categories)
				.set(values)
				.where(and(eq(categories.userId, auth.userId), eq(categories.id, id)))
				.returning();

			if (!data) {
				const responseTimeMs = Date.now() - start;
				return c.json(
					{
						error: {
							code: 404,
							message: "Not Found: The requested resource could not be found.",
							details:
								"The category with the specified 'id' does not exist or you do not have access to it.",
							suggestions: [
								"Verify that the 'id' parameter is correct.",
								"Ensure that you have the necessary permissions to access this category.",
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

			const [data] = await db
				.delete(categories)
				.where(and(eq(categories.userId, auth.userId), eq(categories.id, id)))
				.returning({
					id: categories.id,
				});

			if (!data) {
				const responseTimeMs = Date.now() - start;
				return c.json(
					{
						error: {
							code: 404,
							message: "Not Found: The requested resource could not be found.",
							details:
								"The category with the specified 'id' does not exist or you do not have access to it.",
							suggestions: [
								"Verify that the 'id' parameter is correct.",
								"Ensure that you have the necessary permissions to access this category.",
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
