import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import dotenv from "dotenv";
import {
  calculateCombinedCartPricing,
  DEFAULT_PRODUCT_PRICING_CONFIGS,
  ProductVariantPricingConfig,
  CartInputItem
} from "./src/pricingEngine.ts";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === "production";

// Middleware
app.use(express.json({ limit: "2mb" }));

// In-memory + persistent wholesale pricing configs
const CONFIG_FILE_PATH = path.resolve(process.cwd(), "data", "wholesale_pricing_configs.json");

function loadPricingConfigs(): ProductVariantPricingConfig[] {
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const data = fs.readFileSync(CONFIG_FILE_PATH, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Could not read persistent wholesale configs, using defaults:", err);
  }
  return [...DEFAULT_PRODUCT_PRICING_CONFIGS];
}

let activePricingConfigs: ProductVariantPricingConfig[] = loadPricingConfigs();

function savePricingConfigs(configs: ProductVariantPricingConfig[]) {
  try {
    const dataDir = path.dirname(CONFIG_FILE_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(configs, null, 2), "utf-8");
    activePricingConfigs = configs;
  } catch (err) {
    console.error("Failed to persist wholesale pricing configs:", err);
  }
}

// ─── WHOLESALE PRICING API ENDPOINTS ──────────────────────────────────────────

/**
 * Authoritative combined cart calculation and revalidation endpoint
 * Client sends raw items, server calculates and returns verified pricing
 */
app.post("/api/pricing/calculate", (req: Request, res: Response) => {
  try {
    const rawItems: CartInputItem[] = Array.isArray(req.body.items) ? req.body.items : [];
    const result = calculateCombinedCartPricing(rawItems, activePricingConfigs);
    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error("Pricing calculation error:", error);
    res.status(400).json({
      success: false,
      error: error?.message || "Failed to calculate pricing"
    });
  }
});

// Alias for cart revalidation
app.post("/api/cart/revalidate", (req: Request, res: Response) => {
  try {
    const rawItems: CartInputItem[] = Array.isArray(req.body.items) ? req.body.items : [];
    const result = calculateCombinedCartPricing(rawItems, activePricingConfigs);
    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error("Cart revalidation error:", error);
    res.status(400).json({
      success: false,
      error: error?.message || "Failed to revalidate cart"
    });
  }
});

/**
 * Retrieve active wholesale tiers for all products
 */
app.get("/api/products/tiers", (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: activePricingConfigs
  });
});

/**
 * Admin endpoint to update wholesale tiers for a product variant
 */
app.put("/api/products/:productId/tiers", (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization || "";
    const adminToken = process.env.ADMIN_TOKEN || process.env.ADMIN_PASSWORD;

    // Optional admin token check if configured in environment
    if (adminToken && (!authHeader || !authHeader.includes(adminToken))) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { productId } = req.params;
    const { sizeLabel, regularPrice, tiers, eligibleForCombinedQty } = req.body;

    if (!sizeLabel || !Array.isArray(tiers)) {
      return res.status(400).json({ success: false, error: "Invalid tier data" });
    }

    const existingIdx = activePricingConfigs.findIndex(
      (c) => c.productId === productId && c.sizeLabel === sizeLabel
    );

    const updatedConfig: ProductVariantPricingConfig = {
      productId,
      sizeLabel,
      regularPrice: Number(regularPrice) || 0,
      eligibleForCombinedQty: eligibleForCombinedQty !== false,
      tiers: tiers.map((t: any) => ({
        minQty: Math.max(0, Number(t.minQty) || 0),
        price: Math.max(0, Number(t.price) || 0),
        label: t.label || `${t.minQty}+ pcs`
      })).sort((a: any, b: any) => a.minQty - b.minQty)
    };

    const newConfigs = [...activePricingConfigs];
    if (existingIdx >= 0) {
      newConfigs[existingIdx] = updatedConfig;
    } else {
      newConfigs.push(updatedConfig);
    }

    savePricingConfigs(newConfigs);

    res.json({
      success: true,
      message: `Updated pricing tiers for ${productId} (${sizeLabel})`,
      data: updatedConfig
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || "Update failed" });
  }
});

// ─── STATIC & SEO ROUTES ──────────────────────────────────────────────────────

app.get("/robots.txt", (_req, res) => {
  res.type("text/plain");
  res.send(`User-agent: *\nAllow: /\nSitemap: https://kriatech.in/sitemap.xml`);
});

app.get("/sitemap.xml", (_req, res) => {
  const today = new Date().toISOString().split("T")[0];
  res.type("application/xml");
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://kriatech.in/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`);
});

// ─── SERVER BOOTSTRAP ────────────────────────────────────────────────────────

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath, { maxAge: "7d" }));
      app.get("*", (_req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`KRIA Tech storefront server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
