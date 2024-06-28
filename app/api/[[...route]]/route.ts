import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { Hono } from "hono";
import { handle } from "hono/vercel";

export const runtime = "edge";

const app = new Hono().basePath("/api");

app.get("/hello", clerkMiddleware(), (c) => {
	const auth = getAuth(c);

	if (!auth?.userId) {
		return c.json({
			error: {
				code: 401,
				message: "Unauthorized",
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
		});
	}
	return c.json({
		data: auth,
		status: "success",
		success: true,
	});
});

export const GET = handle(app);
export const POST = handle(app);
