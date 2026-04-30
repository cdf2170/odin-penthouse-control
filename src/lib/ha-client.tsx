// ODIN Home Assistant client
// - Live state via WebSocket (token fetched from edge function on connect)
// - Service calls + camera snapshots via the ha-proxy edge function
import { createContext, useContext, useEffect, useRef, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface HaState {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
  last_changed?: string;
  last_updated?: string;
}

type StateMap = Record<string, HaState>;

interface HaCtx {
  states: StateMap;
  connected: boolean;
  error: string | null;
  callService: (
    domain: string,
    service: string,
    service_data?: Record<string, unknown>,
  ) => Promise<void>;
  cameraSnapshot: (entity_id: string) => Promise<string | null>;
}

const Ctx = createContext<HaCtx>({
  states: {},
  connected: false,
  error: null,
  callService: async () => {},
  cameraSnapshot: async () => null,
});

async function invokeProxy(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("ha-proxy", { body });
  if (error) throw error;
  return data;
}

export const HaProvider = ({ children }: { children: ReactNode }) => {
  const [states, setStates] = useState<StateMap>({});
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const idRef = useRef(1);
  const reconnectTimer = useRef<number | null>(null);

  const connect = useCallback(async () => {
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke("ha-token", { body: {} });
      if (error) throw error;
      const { ws_url, access_token } = data as { ws_url: string; access_token: string };

      const ws = new WebSocket(ws_url);
      wsRef.current = ws;

      ws.onopen = () => {};
      ws.onerror = () => setError("WebSocket error");
      ws.onclose = () => {
        setConnected(false);
        wsRef.current = null;
        // Auto-reconnect after 3s
        if (reconnectTimer.current) window.clearTimeout(reconnectTimer.current);
        reconnectTimer.current = window.setTimeout(connect, 3000);
      };

      ws.onmessage = (evt) => {
        const msg = JSON.parse(evt.data);
        if (msg.type === "auth_required") {
          ws.send(JSON.stringify({ type: "auth", access_token }));
        } else if (msg.type === "auth_ok") {
          setConnected(true);
          // Fetch current states snapshot
          const id = idRef.current++;
          ws.send(JSON.stringify({ id, type: "get_states" }));
          // Subscribe to state changes
          const id2 = idRef.current++;
          ws.send(
            JSON.stringify({
              id: id2,
              type: "subscribe_events",
              event_type: "state_changed",
            }),
          );
        } else if (msg.type === "auth_invalid") {
          setError("HA auth failed");
          ws.close();
        } else if (msg.type === "result" && Array.isArray(msg.result)) {
          // Initial states snapshot
          const m: StateMap = {};
          for (const s of msg.result as HaState[]) m[s.entity_id] = s;
          setStates(m);
        } else if (msg.type === "event" && msg.event?.event_type === "state_changed") {
          const ns = msg.event.data?.new_state as HaState | null;
          if (ns) {
            setStates((prev) => ({ ...prev, [ns.entity_id]: ns }));
          }
        }
      };
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      // Retry connect
      if (reconnectTimer.current) window.clearTimeout(reconnectTimer.current);
      reconnectTimer.current = window.setTimeout(connect, 5000);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) window.clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const callService = useCallback(
    async (domain: string, service: string, service_data?: Record<string, unknown>) => {
      await invokeProxy({ op: "service", domain, service, service_data });
    },
    [],
  );

  const cameraSnapshot = useCallback(async (entity_id: string) => {
    try {
      const r = await invokeProxy({ op: "camera_snapshot", entity_id });
      return (r as { data_url?: string }).data_url ?? null;
    } catch {
      return null;
    }
  }, []);

  return (
    <Ctx.Provider value={{ states, connected, error, callService, cameraSnapshot }}>
      {children}
    </Ctx.Provider>
  );
};

export const useHa = () => useContext(Ctx);
export const useEntity = (entity_id: string | undefined) => {
  const { states } = useHa();
  return entity_id ? states[entity_id] : undefined;
};
