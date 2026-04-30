import { corsHeaders } from "@supabase/supabase-js/cors";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_calendar/calendar/v3";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const GOOGLE_CALENDAR_API_KEY = Deno.env.get("GOOGLE_CALENDAR_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    if (!GOOGLE_CALENDAR_API_KEY) throw new Error("GOOGLE_CALENDAR_API_KEY not configured");

    const url = new URL(req.url);
    const range = url.searchParams.get("range") ?? "today"; // "today" | "week"

    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    if (range === "week") {
      end.setDate(end.getDate() + 7);
    } else {
      end.setDate(end.getDate() + 1);
    }

    const headers = {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": GOOGLE_CALENDAR_API_KEY,
    };

    // Get list of calendars
    const calsRes = await fetch(`${GATEWAY_URL}/users/me/calendarList`, { headers });
    if (!calsRes.ok) {
      const txt = await calsRes.text();
      throw new Error(`calendarList failed [${calsRes.status}]: ${txt}`);
    }
    const calsData = await calsRes.json();
    const calendars = (calsData.items ?? []).filter((c: any) => c.selected !== false);

    // Fetch events from each calendar in parallel
    const params = new URLSearchParams({
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      singleEvents: "true",
      orderBy: "startTime",
      maxResults: "50",
    });

    const eventLists = await Promise.all(
      calendars.map(async (cal: any) => {
        const r = await fetch(
          `${GATEWAY_URL}/calendars/${encodeURIComponent(cal.id)}/events?${params}`,
          { headers },
        );
        if (!r.ok) return [];
        const d = await r.json();
        return (d.items ?? []).map((ev: any) => ({
          id: ev.id,
          summary: ev.summary ?? "(no title)",
          start: ev.start?.dateTime ?? ev.start?.date,
          end: ev.end?.dateTime ?? ev.end?.date,
          allDay: !!ev.start?.date && !ev.start?.dateTime,
          location: ev.location,
          calendar: cal.summary,
          color: cal.backgroundColor,
        }));
      }),
    );

    const events = eventLists
      .flat()
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    return new Response(JSON.stringify({ events, range }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("google-calendar-events error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
