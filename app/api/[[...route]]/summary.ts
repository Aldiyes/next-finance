import { createId } from "@paralleldrive/cuid2";
import { differenceInDays, parse, subDays } from "date-fns";
import { z } from "zod";

import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

import { and, desc, eq, gte, lt, lte, sql, sum } from "drizzle-orm";

import { calculatePercentageChange, fillMissingDays } from "@/lib/utils";

import { db } from "@/db/drizzle";
import { accounts, categories, transactions } from "@/db/schema";

const app = new Hono().get(
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

		const periodLength = differenceInDays(endDate, startDate) + 1;
		const lastPeriodStart = subDays(startDate, periodLength);
		const lastPeriodEnd = subDays(endDate, periodLength);

		async function fetchFinancialData(
			userId: string,
			startDate: Date,
			endDate: Date,
		) {
			return await db
				.select({
					income:
						sql`SUM(CASE WHEN ${transactions.amount} >= 0 THEN ${transactions.amount} ELSE 0 END)`.mapWith(
							Number,
						),
					expenses:
						sql`SUM(CASE WHEN ${transactions.amount} < 0 THEN ${transactions.amount} ELSE 0 END)`.mapWith(
							Number,
						),
					remaining: sum(transactions.amount).mapWith(Number),
				})
				.from(transactions)
				.innerJoin(accounts, eq(transactions.accountId, accounts.id))
				.where(
					and(
						accountId ? eq(transactions.accountId, accounts.id) : undefined,
						eq(accounts.userId, userId),
						gte(transactions.date, startDate),
						lte(transactions.date, endDate),
					),
				);
		}

		const [currentPeriod] = await fetchFinancialData(
			auth.userId,
			startDate,
			endDate,
		);
		const [lastPeriod] = await fetchFinancialData(
			auth.userId,
			lastPeriodStart,
			lastPeriodEnd,
		);

		const incomeChange = calculatePercentageChange(
			currentPeriod.income,
			lastPeriod.income,
		);
		const expensesChange = calculatePercentageChange(
			currentPeriod.expenses,
			lastPeriod.expenses,
		);
		const remainingChange = calculatePercentageChange(
			currentPeriod.remaining,
			lastPeriod.remaining,
		);

		const category = await db
			.select({
				name: categories.name,
				value: sql`SUM(ABS(${transactions.amount}))`.mapWith(Number),
			})
			.from(transactions)
			.innerJoin(accounts, eq(transactions.accountId, accounts.id))
			.innerJoin(categories, eq(transactions.categoryId, categories.id))
			.where(
				and(
					accountId ? eq(transactions.accountId, accounts.id) : undefined,
					eq(accounts.userId, auth.userId),
					lt(transactions.amount, 0),
					gte(transactions.date, startDate),
					lte(transactions.date, endDate),
				),
			)
			.groupBy(categories.name)
			.orderBy(desc(sql`SUM(ABS(${transactions.amount}))`));

		const topCategories = category.slice(0, 3);
		const otherCategories = category.slice(3);
		const otherSum = otherCategories.reduce(
			(sum, current) => sum + current.value,
			0,
		);
		const finalCategories = topCategories;
		if (otherCategories.length > 0) {
			finalCategories.push({
				name: "Other",
				value: otherSum,
			});
		}

		const activeDays = await db
			.select({
				date: transactions.date,
				income:
					sql`SUM(CASE WHEN ${transactions.amount} >= 0 THEN ${transactions.amount} ELSE 0 END)`.mapWith(
						Number,
					),
				expenses:
					sql`SUM(CASE WHEN ${transactions.amount} < 0 THEN ${transactions.amount} ELSE 0 END)`.mapWith(
						Number,
					),
			})
			.from(transactions)
			.innerJoin(accounts, eq(transactions.accountId, accounts.id))
			.where(
				and(
					accountId ? eq(transactions.accountId, accounts.id) : undefined,
					eq(accounts.userId, auth.userId),
					gte(transactions.date, startDate),
					lte(transactions.date, endDate),
				),
			)
			.groupBy(transactions.date)
			.orderBy(transactions.date);

		const days = fillMissingDays(activeDays, startDate, endDate);

		return c.json({
			data: {
				remainingAmount: currentPeriod.remaining,
				remainingChange,
				incomeAmount: currentPeriod.income,
				incomeChange,
				exprensesAmount: currentPeriod.expenses,
				expensesChange,
				categories: finalCategories,
				days,
			},
			status: "success",
			sucess: true,
		});
	},
);

export default app;
