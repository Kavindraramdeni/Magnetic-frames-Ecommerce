// api/index.ts
// Robust Vercel Serverless Function entrypoint

process.env.VERCEL = "1";

let cachedApp: any = null;

async function getApp() {
  if (cachedApp) return cachedApp;
  try {
    // 1. Prefer bundled production artifact with all dependencies resolved by esbuild
    // @ts-ignore
    const serverModule = await import('../dist/server.cjs');
    cachedApp = serverModule.app || serverModule.default || serverModule;
    return cachedApp;
  } catch (err) {
    // 2. Fallback to direct server module
    // @ts-ignore
    const serverModule = await import('../server.js');
    cachedApp = serverModule.app || serverModule.default || serverModule;
    return cachedApp;
  }
}

export default async function handler(req: any, res: any) {
  try {
    const app = await getApp();
    return app(req, res);
  } catch (handlerErr: any) {
    console.error("Vercel Serverless Handler Error:", handlerErr);
    return res.status(500).json({ 
      error: "Server initialization error", 
      message: handlerErr?.message || String(handlerErr) 
    });
  }
}
