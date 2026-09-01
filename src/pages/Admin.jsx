import { useCallback, useEffect, useState } from "react";
import {
  supabase,
  isSupabaseConfigured,
  signIn,
  signOut,
  isAdmin,
  fetchRegistrations,
  toCsv,
} from "@/lib/supabase";
import "./Admin.css";

/*
 * Admin console.
 *
 * Authentication is Supabase Auth; authorisation is the database's job. Both
 * data tables have RLS policies that only return rows to a signed-in user
 * listed in `admins`, so a signed-in non-admin sees an empty set no matter what
 * this page does. Nothing here is a security boundary — it is just the UI.
 */

function Login({ onDone }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: err } = await signIn(email.trim(), password);
    setBusy(false);
    if (err) return setError(err);
    onDone();
  };

  return (
    <div className="admin-page relative flex min-h-screen items-center justify-center bg-black px-5 py-20">
      <div aria-hidden className="grid-lines pointer-events-none absolute inset-0" />

      <form
        onSubmit={submit}
        className="glow-cyan relative z-10 w-full max-w-sm border border-line/50 bg-surface/40 p-7 backdrop-blur-[2px]"
      >
        <div className="flex items-center gap-3">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan shadow-[0_0_8px_var(--cyan)]" />
          <p className="eyebrow">Restricted</p>
        </div>

        <h1 className="font-display mt-4 text-3xl font-bold tracking-[-0.01em] text-foreground">
          ADMIN <span className="text-glow text-cyan">CONSOLE</span>
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Task-force credentials required.
        </p>

        <label htmlFor="admin-email" className="hud mt-7 block text-cyan/70">
          Email
        </label>
        <input
          id="admin-email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="admin-input"
        />

        <label htmlFor="admin-password" className="hud mt-4 block text-cyan/70">
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="admin-input"
        />

        {error && (
          <p role="alert" className="hud mt-4 !text-[10px] text-destructive">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="hud glow-cyan mt-7 w-full border border-cyan/60 bg-cyan/5 px-6 py-3.5 !text-soft-cyan transition-colors hover:bg-cyan/15 disabled:opacity-60"
        >
          {busy ? "Authenticating…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

function Row({ team }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <tr
        className="admin-row cursor-pointer border-b border-line/25"
        onClick={() => setOpen((o) => !o)}
      >
        <td className="px-3 py-3 font-display text-sm font-bold text-foreground">
          {team.team_name}
        </td>
        <td className="px-3 py-3 text-muted-foreground">{team.leader_name}</td>
        <td className="px-3 py-3 font-mono text-xs text-muted-foreground">
          {team.leader_roll}
        </td>
        <td className="px-3 py-3 font-mono text-xs text-muted-foreground">
          {team.leader_email}
        </td>
        <td className="px-3 py-3 text-center tabular-nums text-cyan">{team.team_size}</td>
        <td className="hidden px-3 py-3 font-mono text-xs text-muted-foreground md:table-cell">
          {new Date(team.created_at).toLocaleString()}
        </td>
        <td className="px-3 py-3 text-right text-cyan/70">{open ? "−" : "+"}</td>
      </tr>

      {open && team.team_members.length > 0 && (
        <tr className="border-b border-line/25 bg-black/40">
          <td colSpan={7} className="px-3 py-3">
            <ul className="space-y-1.5">
              {team.team_members.map((m) => (
                <li key={m.member_no} className="flex flex-wrap gap-x-6 gap-y-1 text-xs">
                  <span className="hud text-cyan/60">
                    Member {String(m.member_no).padStart(2, "0")}
                  </span>
                  <span className="text-foreground">{m.name}</span>
                  <span className="font-mono text-muted-foreground">{m.roll}</span>
                  <span className="font-mono text-muted-foreground">{m.email}</span>
                </li>
              ))}
            </ul>
          </td>
        </tr>
      )}
    </>
  );
}

function Console({ onSignOut }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const { rows: data, error: err } = await fetchRegistrations();
    setRows(data);
    setError(err);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const q = query.trim().toLowerCase();
  const visible = q
    ? rows.filter((t) =>
        [t.team_name, t.leader_name, t.leader_roll, t.leader_email]
          .concat(t.team_members.flatMap((m) => [m.name, m.roll, m.email]))
          .some((v) => String(v).toLowerCase().includes(q)),
      )
    : rows;

  const people = rows.reduce((n, t) => n + t.team_size, 0);

  const download = () => {
    const blob = new Blob([toCsv(visible)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `intel-x-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="admin-page relative min-h-screen bg-black px-5 py-12 md:px-10">
      <div aria-hidden className="grid-lines pointer-events-none absolute inset-0" />

      <div className="relative z-10 mx-auto w-full max-w-[1500px]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan shadow-[0_0_8px_var(--cyan)]" />
              <p className="eyebrow">Task force only</p>
            </div>
            <h1 className="font-display mt-3 text-4xl font-bold tracking-[-0.02em] text-foreground md:text-5xl">
              ADMIN <span className="text-glow text-cyan">CONSOLE</span>
            </h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={load} className="admin-btn">
              Refresh
            </button>
            <button type="button" onClick={download} className="admin-btn" disabled={!visible.length}>
              Export CSV
            </button>
            <button type="button" onClick={onSignOut} className="admin-btn">
              Sign out
            </button>
          </div>
        </div>

        {/* ------------------------------ counters ------------------------- */}
        <div className="mt-8 grid grid-cols-2 gap-px border border-line/40 bg-line/30 sm:grid-cols-3">
          {[
            { label: "Teams", value: rows.length },
            { label: "Operatives", value: people },
            { label: "Showing", value: visible.length },
          ].map((s) => (
            <div key={s.label} className="bg-black px-5 py-4">
              <p className="hud text-cyan/70">{s.label}</p>
              <p className="font-display mt-1 text-3xl font-bold tabular-nums text-foreground">
                {s.value}
              </p>
            </div>
          ))}
        </div>

        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search team, name, roll or email…"
          className="admin-input mt-6"
        />

        {/* -------------------------------- table -------------------------- */}
        <div className="mt-6 overflow-x-auto border border-line/40">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-line/40 bg-surface/40">
                {["Team", "Leader", "Roll", "Email", "Size", "Registered", ""].map((h, i) => (
                  <th
                    key={h || i}
                    className={`hud px-3 py-3 text-cyan/70 ${i === 5 ? "hidden md:table-cell" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((t) => (
                <Row key={t.id} team={t} />
              ))}
            </tbody>
          </table>

          {!loading && !visible.length && (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              {error
                ? error
                : rows.length
                  ? "No match for that search."
                  : "No registrations yet."}
            </p>
          )}
          {loading && (
            <p className="hud px-4 py-10 text-center text-cyan/70">Loading…</p>
          )}
        </div>

        <p className="hud mt-4 !text-[9px] text-muted-foreground/70">
          Click a row to see its other operatives.
        </p>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [state, setState] = useState("checking"); // checking | out | denied | in

  const check = useCallback(async () => {
    if (!isSupabaseConfigured) return setState("out");
    const { data } = await supabase.auth.getSession();
    if (!data.session) return setState("out");
    setState((await isAdmin()) ? "in" : "denied");
  }, []);

  useEffect(() => {
    check();
    const { data: sub } = supabase?.auth.onAuthStateChange(() => check()) ?? {};
    return () => sub?.subscription?.unsubscribe();
  }, [check]);

  if (state === "checking") {
    return (
      <div className="admin-page flex min-h-screen items-center justify-center bg-black">
        <p className="hud text-cyan/70">Verifying clearance…</p>
      </div>
    );
  }

  if (state === "out") return <Login onDone={check} />;

  if (state === "denied") {
    return (
      <div className="admin-page relative flex min-h-screen items-center justify-center bg-black px-5 text-center">
        <div aria-hidden className="grid-lines pointer-events-none absolute inset-0" />
        <div className="relative z-10">
          <p className="eyebrow">Clearance denied</p>
          <h1 className="font-display mt-4 text-3xl font-bold text-foreground">
            NOT ON THE LIST
          </h1>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            This account is signed in but is not an administrator.
          </p>
          <button
            type="button"
            onClick={async () => {
              await signOut();
              setState("out");
            }}
            className="admin-btn mt-7"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <Console
      onSignOut={async () => {
        await signOut();
        setState("out");
      }}
    />
  );
}
