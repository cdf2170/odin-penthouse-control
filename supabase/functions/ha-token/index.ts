// ODIN: returns the HA WebSocket URL + access token to authenticated users.
// Token is held in memory client-side (never localStorage) and used to open a
// direct WebSocket from the browser to Home Assistant for live state.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const HA_BASE_URL = Deno.env.get("HA_BASE_URL");
    const HA_TOKEN = Deno.env.get("HA_TOKEN");
    if (!HA_BASE_URL || !HA_TOKEN) {
      return json({ error: "HA credentials not configured" }, 500);
    }

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
    const { data, error } = await supabase.auth.getClaims(token);
    if (error || !data?.claims) {
      return json({ error: "Unauthorized" }, 401);
    }

    const base = HA_BASE_URL.replace(/\/$/, "");
    const wsUrl = base.replace(/^http/, "ws") + "/api/websocket";

    return json({
      ws_url: wsUrl,
      access_token: HA_TOKEN,
      // expose base for snapshots if needed (sans token)
      base_url: base,
    });
  } catch (e) {
    console.error("ha-token error", e);
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
