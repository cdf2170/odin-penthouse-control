import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";

export default function Auth() {
  const nav = useNavigate();
  const { session, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [stayLoggedIn, setStayLoggedIn] = useState(
    () => localStorage.getItem("odin.stay_logged_in") !== "false",
  );

  useEffect(() => {
    if (!loading && session) nav("/", { replace: true });
  }, [session, loading, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      // Persist preference so the auth client can pick the right storage on next boot
      localStorage.setItem("odin.stay_logged_in", String(stayLoggedIn));
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { display_name: displayName || email.split("@")[0] },
          },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (e: any) {
      setErr(e.message ?? String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground grid place-items-center px-6">
      <div className="w-full max-w-[420px]">
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-7 h-7 grid place-items-center border border-hairline-strong relative">
            <div
              className="w-1.5 h-1.5 bg-odin-accent"
              style={{ boxShadow: "0 0 10px hsl(var(--accent))" }}
            />
          </div>
          <div>
            <div className="text-[15px] font-semibold tracking-[0.2em] leading-none">ODIN</div>
            <div className="label mt-1.5">Authorized access</div>
          </div>
        </div>

        <div className="border border-hairline bg-surface-inset/60 p-7">
          <h1 className="text-[18px] tracking-wide mb-1">
            {mode === "signin" ? "Sign in" : "Create account"}
          </h1>
          <p className="label mb-6">
            {mode === "signin" ? "Residence credentials required" : "First account becomes Owner"}
          </p>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="label block mb-1.5">Display name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-surface-raised border border-hairline px-3 py-2.5 text-[13px] focus:outline-none focus:border-odin-accent"
                  autoComplete="name"
                />
              </div>
            )}
            <div>
              <label className="label block mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-raised border border-hairline px-3 py-2.5 text-[13px] focus:outline-none focus:border-odin-accent"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label block mb-1.5">Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-raised border border-hairline px-3 py-2.5 text-[13px] focus:outline-none focus:border-odin-accent"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
              />
            </div>

            {err && (
              <div className="text-[12px] text-odin-accent border border-odin-accent/30 px-3 py-2 bg-odin-accent/5">
                {err}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full btn-tactile py-3 text-[13px] tracking-wider uppercase disabled:opacity-50"
            >
              {busy ? "…" : mode === "signin" ? "Authenticate" : "Provision account"}
            </button>
          </form>

          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="label mt-6 hover:text-foreground transition-colors"
          >
            {mode === "signin" ? "Need an account? Create one" : "Already have access? Sign in"}
          </button>
        </div>
      </div>
    </main>
  );
}
