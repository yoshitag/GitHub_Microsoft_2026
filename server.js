const http = require("http");
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const { URL } = require("url");

const HOST = "0.0.0.0";
const PORT = Number(process.env.PORT || 8000);
const ROOT = process.cwd();
const GUIDES_DIR = path.join(ROOT, "guides");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".pdf": "application/pdf"
};

const sendJson = (res, statusCode, data) => {
  const body = JSON.stringify(data);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
};

const sanitizeName = (name) => {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
};

const fetchJson = async (url) => {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
      Accept: "application/json,text/plain,*/*"
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`);
  }
  return response.json();
};

const collectPdfLinks = (value, results = []) => {
  if (typeof value === "string") {
    if (/\.pdf($|\?)/i.test(value) || /downloadcenter\.samsung\.com/i.test(value)) {
      results.push(value);
    }
    return results;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectPdfLinks(item, results));
    return results;
  }

  if (value && typeof value === "object") {
    Object.values(value).forEach((item) => collectPdfLinks(item, results));
  }

  return results;
};

const pickBestPdf = async (model) => {
  const trimmedModel = model.trim();
  const detailUrl = `https://www.samsung.com/us/api/support/product/detail/${encodeURIComponent(trimmedModel)}.json`;
  const detailData = await fetchJson(detailUrl);

  const product = Array.isArray(detailData) ? detailData[0] : detailData;
  if (!product || typeof product !== "object") {
    throw new Error("No product details found for that model.");
  }

  const allPdfLinks = [...new Set(collectPdfLinks(product))];
  if (allPdfLinks.length === 0) {
    throw new Error("No downloadable PDF user guide found for that model.");
  }

  const scored = allPdfLinks
    .map((pdf) => {
      const lower = pdf.toLowerCase();
      let score = 0;
      if (lower.includes("cdctttype=um")) score += 6;
      if (lower.includes("/um/") || lower.includes("_um_")) score += 4;
      if (lower.includes("us") || lower.includes("_en_")) score += 2;
      if (lower.includes(trimmedModel.toLowerCase().replace(/\//g, ""))) score += 1;
      return { pdf, score };
    })
    .sort((a, b) => b.score - a.score);

  return {
    detailUrl,
    productModelCode: product.modelCode || trimmedModel,
    pdfUrl: scored[0].pdf
  };
};

const downloadPdfToGuides = async (model, pdfUrl) => {
  await fsp.mkdir(GUIDES_DIR, { recursive: true });

  const response = await fetch(pdfUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to download PDF: HTTP ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const safeModel = sanitizeName(model || "manual");
  const filename = `${safeModel}_UserGuide_${timestamp}.pdf`;
  const fullPath = path.join(GUIDES_DIR, filename);
  await fsp.writeFile(fullPath, buffer);

  return {
    filename,
    fullPath,
    relativePath: path.relative(ROOT, fullPath).replace(/\\/g, "/"),
    sizeBytes: buffer.length
  };
};

const readBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
};

const serveStatic = async (req, res, requestUrl) => {
  const requestedPath = decodeURIComponent(requestUrl.pathname);
  const relativePath = requestedPath === "/"
    ? "index.html"
    : requestedPath.replace(/^\/+/, "");
  const normalizedPath = path.normalize(relativePath);

  if (normalizedPath.startsWith("..") || path.isAbsolute(normalizedPath)) {
    sendJson(res, 403, { error: "Forbidden" });
    return;
  }

  let filePath = path.join(ROOT, normalizedPath);

  try {
    const stat = await fsp.stat(filePath);
    if (stat.isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }

    const ext = path.extname(filePath).toLowerCase();
    const type = MIME_TYPES[ext] || "application/octet-stream";

    res.writeHead(200, { "Content-Type": type });
    fs.createReadStream(filePath).pipe(res);
  } catch {
    sendJson(res, 404, { error: "Not found" });
  }
};

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "POST" && requestUrl.pathname === "/api/manuals/search") {
    try {
      const body = await readBody(req);
      const model = (body.model || "").trim();

      if (!model) {
        sendJson(res, 400, { error: "Model is required." });
        return;
      }

      const picked = await pickBestPdf(model);
      const saved = await downloadPdfToGuides(model, picked.pdfUrl);

      sendJson(res, 200, {
        ok: true,
        model,
        source: {
          detailUrl: picked.detailUrl,
          productModelCode: picked.productModelCode,
          pdfUrl: picked.pdfUrl
        },
        file: saved
      });
    } catch (error) {
      sendJson(res, 500, {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
    return;
  }

  if (req.method === "GET" && requestUrl.pathname === "/api/health") {
    sendJson(res, 200, { ok: true });
    return;
  }

  await serveStatic(req, res, requestUrl);
});

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
  console.log(`Serving files from: ${ROOT}`);
});
