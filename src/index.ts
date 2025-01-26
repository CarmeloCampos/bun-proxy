import { Hono } from "hono";
import { basicAuth } from "hono/basic-auth";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { env } from "@/env";

const app = new Hono();

const schema = z.object({
  "Target-URL": z.string().url(),
});

app.get("/ping", (c) => c.text("pong"));

app.all(
  "/proxy",
  basicAuth({
    username: env.AUTH_USERNAME,
    password: env.AUTH_PASSWORD,
  }),
  zValidator("header", schema),
  async (c) => {
    const targetUrl = c.req.header("Target-URL");
    if (!targetUrl) {
      return c.json({ error: "Target-URL header is missing" }, 400);
    }
    const body = await c.req.text();

    try {
      const response = await fetch(targetUrl, {
        method: c.req.method,
        body: c.req.method !== "GET" ? body : undefined,
      });

      const data = await response.text();
      const contentType = response.headers.get("content-type");

      c.header("Content-Type", contentType ?? "text/plain");

      return c.body(data);
    } catch (error) {
      return c.json({ error: "Proxy error", details: error }, 500);
    }
  }
);

export default app;
