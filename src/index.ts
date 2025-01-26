import { Hono } from "hono";
import { basicAuth } from "hono/basic-auth";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { env } from "@/env";
import { logger } from "hono/dist/types/middleware/logger";

const app = new Hono();

const schema = z.object({
  "Target-URL": z.string().url(),
});

app.get("/ping", (c) => c.text("pong"));

app.all(
  "/proxy",
  logger(),
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

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(targetUrl, {
        method: c.req.method,
        body: c.req.method !== "GET" ? body : undefined,
        signal: controller.signal,
      });

      const bodyResponse = response.body;
      if (!bodyResponse) {
        return c.json(
          { error: "No se pudo leer el cuerpo de la respuesta" },
          500,
        );
      }
      const reader = bodyResponse.getReader();

      const chunks = [];
      let totalBytes = 0;
      const maxBytes = 1024 * 1024;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        totalBytes += value.length;

        if (totalBytes >= maxBytes) {
          break;
        }
      }

      const combined = new Uint8Array(totalBytes);
      let offset = 0;
      for (const chunk of chunks) {
        combined.set(chunk, offset);
        offset += chunk.length;
      }

      const contentType =
        response.headers.get("content-type") || "application/octet-stream";

      return new Response(combined, {
        headers: {
          "Content-Type": contentType,
        },
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return c.json({ error: "Tiempo de espera agotado" }, 504);
      }
      return c.json({ error: "Proxy error", details: error }, 500);
    } finally {
      clearTimeout(timeout);
    }
  },
);

export default app;
