import "dotenv/config";
import express, { type Request, type Response } from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { setupRealtimeEndpoints } from "../realtime";
import { initializeWebSocketServer } from "../websocket-integration";
import { sdk } from "./sdk";
import { generateWeeklyPhotoJournalForTask } from "../photo-journal-scheduler";
import { releaseFamilyTimeCapsuleForTask } from "../time-capsule-scheduler";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  setupRealtimeEndpoints(app);
  initializeWebSocketServer(server);

  app.post("/api/scheduled/generateWeeklyPhotoJournal", async (req: Request, res: Response) => {
    try {
      const user = await sdk.authenticateRequest(req);
      if (!user.isCron || !user.taskUid) {
        return res.status(403).json({ error: "cron-only" });
      }
      const result = await generateWeeklyPhotoJournalForTask(user.taskUid);
      return res.json(result);
    } catch (error) {
      console.error("[Heartbeat] Weekly photo journal failed", error);
      return res.status(500).json({
        error: String(error),
        stack: error instanceof Error ? error.stack : undefined,
        context: { url: req.originalUrl, taskUid: req.headers["x-manus-task-uid"] ?? null },
        timestamp: new Date().toISOString(),
      });
    }
  });

  app.post("/api/scheduled/releaseTimeCapsule", async (req: Request, res: Response) => {
    try {
      const user = await sdk.authenticateRequest(req);
      if (!user.isCron || !user.taskUid) return res.status(403).json({ error: "cron-only" });
      return res.json(await releaseFamilyTimeCapsuleForTask(user.taskUid));
    } catch (error) {
      console.error("[Heartbeat] Time capsule release failed", error);
      return res.status(500).json({
        error: String(error),
        stack: error instanceof Error ? error.stack : undefined,
        context: { url: req.originalUrl, taskUid: req.headers["x-manus-task-uid"] ?? null },
        timestamp: new Date().toISOString(),
      });
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
