import { createClient } from "@supabase/supabase-js";

/*
 * Supabase client.
 *
 * The anon key is meant to ship in the browser — row-level security is what
 * actually protects the data. Both tables have RLS on, so this key can neither
 * read nor write them while signed out; the only way in is the `register_team`
 * function, which anon is granted execute on. Reading requires a signed-in user
 * listed in the `admins` table.
 *
 * Keys come from .env.local (gitignored). See .env.example.
 */

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** False when the env vars are missing, so the UI can say so instead of failing opaquely. */
export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;

/* ----------------------------- registration ----------------------------- */

/**
 * Files one team and its members in a single transaction.
 * Returns { error } — null on success, a human-readable message otherwise.
 */
export async function registerTeam(form) {
  if (!supabase) {
    return { error: "Registration is not connected yet. Try again later." };
  }

  const { error } = await supabase.rpc("register_team", {
    p_team_name: form.teamName,
    p_leader_name: form.leaderName,
    p_leader_roll: form.leaderRoll,
    p_leader_email: form.leaderEmail,
    p_team_size: form.teamSize,
    p_members: form.members.slice(0, form.teamSize - 1),
  });

  if (!error) return { error: null };

  const detail = `${error.message} ${error.details ?? ""}`;

  if (detail.includes("teams_name_key")) {
    return { error: "That team name is already registered. Pick another." };
  }
  if (detail.includes("teams_roll_key")) {
    return { error: "That roll number has already registered a team." };
  }
  if (detail.includes("team_members_roll_check") || detail.includes("_email_check")) {
    return { error: "One of the roll numbers or emails was rejected. Check and retry." };
  }

  console.error("[register] ", error);
  return { error: "Could not file the registration. Check your connection and retry." };
}

/* -------------------------------- admin --------------------------------- */

export async function signIn(email, password) {
  if (!supabase) return { error: "Not connected." };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (!error) return { error: null };
  return {
    error:
      error.message === "Invalid login credentials"
        ? "Wrong email or password."
        : error.message,
  };
}

export async function signOut() {
  if (supabase) await supabase.auth.signOut();
}

/** True when the signed-in user is listed in the admins table. */
export async function isAdmin() {
  if (!supabase) return false;
  const { data, error } = await supabase.from("admins").select("user_id").limit(1);
  return !error && (data?.length ?? 0) > 0;
}

/**
 * Every team with its members, newest first. RLS returns nothing unless the
 * caller is an admin, so this is safe to call from the browser.
 */
export async function fetchRegistrations() {
  if (!supabase) return { rows: [], error: "Not connected." };

  const { data, error } = await supabase
    .from("teams")
    .select("id, team_name, leader_name, leader_roll, leader_email, team_size, created_at, team_members (member_no, name, roll, email)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[admin] ", error);
    return { rows: [], error: "Could not load registrations." };
  }

  const rows = (data ?? []).map((t) => ({
    ...t,
    team_members: [...(t.team_members ?? [])].sort((a, b) => a.member_no - b.member_no),
  }));

  return { rows, error: null };
}

/** Flattens registrations to one CSV row per person. */
export function toCsv(rows) {
  const head = [
    "team_name", "team_size", "registered_at",
    "member_no", "name", "roll", "email", "is_leader",
  ];
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [head.join(",")];

  for (const t of rows) {
    const when = new Date(t.created_at).toISOString();
    lines.push([t.team_name, t.team_size, when, 1, t.leader_name, t.leader_roll, t.leader_email, "yes"].map(esc).join(","));
    for (const m of t.team_members) {
      lines.push([t.team_name, t.team_size, when, m.member_no, m.name, m.roll, m.email, "no"].map(esc).join(","));
    }
  }

  return lines.join("\n");
}
