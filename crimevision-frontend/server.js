import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.X_CATALYST_PORT || process.env.PORT || "9000", 10);

const distPath = path.join(__dirname, "dist");

// Serve static assets from Vite build directory
app.use(express.static(distPath));

// Health check endpoint for Catalyst AppSail load balancer
app.get("/healthz", (req, res) => {
  res.status(200).json({ status: "ok", service: "sentinel-ai-frontend" });
});

// Catch-all SPA route handler returning index.html for React Router
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, "0.0.0.0", () => {
  console.log(`[AppSail Frontend] Server running on http://0.0.0.0:${port}`);
});
