#!/usr/bin/env node
// Serves the benchmark dashboard locally (the published artifact needs a
// claude.ai sign-in). Review notes are only saved in the published artifact.
import { createServer } from "node:http"
import { readFile } from "node:fs/promises"
import { dirname, extname, join, normalize, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "dashboard")
const port = Number(process.env.PORT ?? 4321)
const types = { ".html": "text/html; charset=utf-8", ".json": "application/json", ".js": "text/javascript" }

createServer(async (request, response) => {
  const path = normalize(decodeURIComponent(new URL(request.url, "http://x").pathname)).replace(/^([/\\])+/, "")
  const file = join(root, path || "index.html")
  if (!file.startsWith(root)) {
    response.writeHead(403).end()
    return
  }
  try {
    const body = await readFile(file)
    response.writeHead(200, { "Content-Type": types[extname(file)] ?? "application/octet-stream", "Cache-Control": "no-store" })
    response.end(body)
  } catch {
    response.writeHead(404).end("Not found")
  }
}).listen(port, () => console.log(`Dashboard on http://localhost:${port}`))
