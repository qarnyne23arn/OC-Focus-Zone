import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "10mb" }));

// In-memory cloud sync store keyed by syncCode (persists across devices during server lifetime)
interface CloudWorkspace {
  syncCode: string;
  updatedAt: string;
  data: any;
}

const cloudWorkspaces = new Map<string, CloudWorkspace>();

// Default workspace for guest/anonymous synchronization
const DEFAULT_SYNC_CODE = "STUDY-8429";

// API routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Cloud Sync: Pull workspace data
app.get("/api/sync/:syncCode", (req, res) => {
  const syncCode = (req.params.syncCode || DEFAULT_SYNC_CODE).toUpperCase();
  const workspace = cloudWorkspaces.get(syncCode);

  if (!workspace) {
    return res.json({
      success: true,
      exists: false,
      syncCode,
      message: "No remote data found for this sync code yet. Using local state.",
      data: null,
    });
  }

  res.json({
    success: true,
    exists: true,
    syncCode: workspace.syncCode,
    updatedAt: workspace.updatedAt,
    data: workspace.data,
  });
});

// Cloud Sync: Push workspace data
app.post("/api/sync/:syncCode", (req, res) => {
  const syncCode = (req.params.syncCode || DEFAULT_SYNC_CODE).toUpperCase();
  const { data } = req.body;

  if (!data) {
    return res.status(400).json({ success: false, error: "Missing data payload" });
  }

  const workspace: CloudWorkspace = {
    syncCode,
    updatedAt: new Date().toISOString(),
    data,
  };

  cloudWorkspaces.set(syncCode, workspace);

  res.json({
    success: true,
    syncCode,
    updatedAt: workspace.updatedAt,
    message: "Cloud storage synchronized across devices successfully",
  });
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Focus Time server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
