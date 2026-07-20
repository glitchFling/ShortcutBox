import { zipSync } from "fflate";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

function json(data) {
  return new Response(JSON.stringify(data, null, 2), {
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const parts = decodeURIComponent(url.pathname.slice(1)).split("/").filter(Boolean);

    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method not allowed", { status: 405, headers: CORS });
    }

    // GET / -> list repos (top-level prefixes)
    if (parts.length === 0) {
      const listed = await env.SHORTCUTBOX.list({ delimiter: "/" });
      const repos = listed.delimitedPrefixes.map((p) => p.replace(/\/$/, ""));
      return json(repos);
    }

    const repo = parts[0];

    // GET /<repo> -> zip everything under that prefix
    if (parts.length === 1) {
      const prefix = `${repo}/`;
      let cursor;
      const objects = [];
      do {
        const listed = await env.SHORTCUTBOX.list({ prefix, cursor });
        objects.push(...listed.objects);
        cursor = listed.truncated ? listed.cursor : undefined;
      } while (cursor);

      if (objects.length === 0) {
        return new Response("Not found", { status: 404, headers: CORS });
      }

      const files = {};
      for (const obj of objects) {
        const stored = await env.SHORTCUTBOX.get(obj.key);
        if (!stored) continue;
        const relKey = obj.key.slice(prefix.length);
        files[relKey] = new Uint8Array(await stored.arrayBuffer());
      }

      const zipped = zipSync(files, { level: 6 });
      const headers = {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${repo}.zip"`,
        ...CORS,
      };

      if (request.method === "HEAD") return new Response(null, { headers });
      return new Response(zipped, { headers });
    }

    // GET /<repo>/<file...> -> return a single object
    const key = parts.join("/");
    const object = await env.SHORTCUTBOX.get(key);
    if (object === null) {
      return new Response("Not found", { status: 404, headers: CORS });
    }

    const headers = new Headers(CORS);
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    if (!headers.get("Content-Type")) headers.set("Content-Type", "application/octet-stream");

    if (request.method === "HEAD") return new Response(null, { headers });
    return new Response(object.body, { headers });
  },
};
