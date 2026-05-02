// ODIN Home Assistant REST proxy
// Authenticated users only. Proxies a small whitelist of HA REST endpoints.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, range",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Expose-Headers": "content-length, content-range, accept-ranges",
};

const HA_BASE_URL = Deno.env.get("HA_BASE_URL");
const HA_TOKEN = Deno.env.get("HA_TOKEN");

interface ProxyRequest {
  // "states" | "state" | "service" | "camera_snapshot"
  op: string;
  entity_id?: string;
  domain?: string;
  service?: string;
  service_data?: Record<string, unknown>;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!HA_BASE_URL || !HA_TOKEN) {
      return json({ error: "HA credentials not configured" }, 500);
    }

    const base = HA_BASE_URL.replace(/\/$/, "");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey =
      Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;

    // GET MJPEG stream proxy: ?entity_id=camera.x&token=<supabase_jwt>
    // Token must be in URL because <img> tags can't send Authorization headers.
    if (req.method === "GET") {
      const url = new URL(req.url);
      const entityId = url.searchParams.get("entity_id");
      const token = url.searchParams.get("token");
      if (!entityId || !token) {
        return json({ error: "entity_id and token required" }, 400);
      }
      if (!/^[a-z_]+\.[a-z0-9_]+$/i.test(entityId)) {
        return json({ error: "invalid entity_id" }, 400);
      }
      const sb = createClient(supabaseUrl, supabaseAnonKey);
      const { data: claims, error: authErr } = await sb.auth.getClaims(token);
      if (authErr || !claims?.claims) {
        return json({ error: "Unauthorized" }, 401);
      }
      const r = await fetch(
        `${base}/api/camera_proxy_stream/${encodeURIComponent(entityId)}`,
        { headers: { Authorization: `Bearer ${HA_TOKEN}` } },
      );
      const headers = new Headers(corsHeaders);
      const ct = r.headers.get("content-type");
      if (ct) headers.set("Content-Type", ct);
      headers.set("Cache-Control", "no-store");
      return new Response(r.body, { status: r.status, headers });
    }

    // Verify caller is authenticated for POST ops
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const postToken = authHeader.replace("Bearer ", "");
    const { data: postClaims, error: postAuthErr } = await supabase.auth.getClaims(postToken);
    if (postAuthErr || !postClaims?.claims) {
      return json({ error: "Unauthorized" }, 401);
    }

    const haHeaders = {
      Authorization: `Bearer ${HA_TOKEN}`,
      "Content-Type": "application/json",
    };

    const body = (await req.json()) as ProxyRequest;

    switch (body.op) {
      case "states": {
        const r = await fetch(`${base}/api/states`, { headers: haHeaders });
        return passthrough(r);
      }
      case "state": {
        if (!body.entity_id) return json({ error: "entity_id required" }, 400);
        const r = await fetch(
          `${base}/api/states/${encodeURIComponent(body.entity_id)}`,
          { headers: haHeaders },
        );
        return passthrough(r);
      }
      case "service": {
        if (!body.domain || !body.service) {
          return json({ error: "domain and service required" }, 400);
        }
        // Basic safety: only allow alnum + underscore in domain/service
        if (!/^[a-z0-9_]+$/i.test(body.domain) || !/^[a-z0-9_]+$/i.test(body.service)) {
          return json({ error: "invalid domain or service" }, 400);
        }
        const r = await fetch(
          `${base}/api/services/${body.domain}/${body.service}`,
          {
            method: "POST",
            headers: haHeaders,
            body: JSON.stringify(body.service_data ?? {}),
          },
        );
        return passthrough(r);
      }
      case "camera_snapshot": {
        if (!body.entity_id) return json({ error: "entity_id required" }, 400);
        const r = await fetch(
          `${base}/api/camera_proxy/${encodeURIComponent(body.entity_id)}`,
          { headers: { Authorization: `Bearer ${HA_TOKEN}` } },
        );
        if (!r.ok) return json({ error: `HA ${r.status}` }, r.status);
        const buf = await r.arrayBuffer();
        const b64 = btoa(
          new Uint8Array(buf).reduce((s, b) => s + String.fromCharCode(b), ""),
        );
        return json({
          content_type: r.headers.get("content-type") ?? "image/jpeg",
          data_url: `data:${r.headers.get("content-type") ?? "image/jpeg"};base64,${b64}`,
        });
      }
      case "camera_stream": {
        if (!body.entity_id) return json({ error: "entity_id required" }, 400);
        // HA returns { url: "/api/hls/<token>/master_playlist.m3u8" }
        const r = await fetch(
          `${base}/api/camera/stream/${encodeURIComponent(body.entity_id)}`,
          { method: "POST", headers: haHeaders, body: JSON.stringify({ format: "hls" }) },
        );
        if (!r.ok) {
          const txt = await r.text();
          return json({ error: `HA ${r.status}: ${txt}` }, r.status);
        }
        const data = await r.json();
        // Return only the relative path; client will request via stream_path proxy
        return json({ stream_path: data.url });
      }
        return json({ error: `unknown op: ${body.op}` }, 400);
    }
  } catch (e) {
    console.error("ha-proxy error", e);
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});

async function passthrough(r: Response) {
  const text = await r.text();
  return new Response(text, {
    status: r.status,
    headers: {
      ...corsHeaders,
      "Content-Type": r.headers.get("content-type") ?? "application/json",
    },
  });
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
