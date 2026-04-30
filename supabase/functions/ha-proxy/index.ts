// ODIN Home Assistant REST proxy
// Authenticated users only. Proxies a small whitelist of HA REST endpoints.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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

    // Verify caller is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: authErr } = await supabase.auth.getClaims(token);
    if (authErr || !claims?.claims) {
      return json({ error: "Unauthorized" }, 401);
    }

    const body = (await req.json()) as ProxyRequest;
    const base = HA_BASE_URL.replace(/\/$/, "");
    const haHeaders = {
      Authorization: `Bearer ${HA_TOKEN}`,
      "Content-Type": "application/json",
    };

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
      default:
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
