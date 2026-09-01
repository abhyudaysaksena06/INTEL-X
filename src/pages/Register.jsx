import { useState } from "react";
import { Link } from "react-router-dom";
import paperDoc from "@/assets/paper-doc.jpg";
import { registerTeam } from "@/lib/supabase";
import "./Register.css";

/*
 * Event registration.
 *
 * Dressed in the contact page's language: a pinned, aged enlistment form on the
 * corkboard, typewriter labels, gold accents on the dark board.
 *
 * The leader is member 01, so a team of N asks for N-1 additional operatives —
 * a solo entry asks for none.
 *
 * Submitting calls the `register_team` Postgres function on Supabase, which
 * writes the team and its members in one transaction.
 */

const BLANK_MEMBER = { name: "", roll: "", email: "" };

const EMPTY = {
  leaderName: "",
  leaderRoll: "",
  leaderEmail: "",
  teamName: "",
  teamSize: 1,
  members: [{ ...BLANK_MEMBER }, { ...BLANK_MEMBER }, { ...BLANK_MEMBER }],
};

const LEADER_FIELDS = [
  { name: "leaderName", label: "Team leader name", placeholder: "Full name", autoComplete: "name" },
  { name: "leaderRoll", label: "Team leader roll no.", placeholder: "e.g. 102203456", autoComplete: "off" },
  { name: "leaderEmail", label: "Team leader email", placeholder: "name@thapar.edu", type: "email", autoComplete: "email" },
  { name: "teamName", label: "Team name", placeholder: "Call sign", autoComplete: "off" },
];

const MEMBER_FIELDS = [
  { key: "name", label: "Name", placeholder: "Full name" },
  { key: "roll", label: "Roll no.", placeholder: "e.g. 102203457" },
  { key: "email", label: "Email", placeholder: "name@thapar.edu", type: "email" },
];

const ROLL_RE = /^[A-Za-z0-9/-]{4,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(form) {
  const errors = {};

  if (!form.leaderName.trim()) errors.leaderName = "Required.";

  if (!form.leaderRoll.trim()) errors.leaderRoll = "Required.";
  else if (!ROLL_RE.test(form.leaderRoll.trim())) errors.leaderRoll = "Enter a valid roll number.";

  if (!form.leaderEmail.trim()) errors.leaderEmail = "Required.";
  else if (!EMAIL_RE.test(form.leaderEmail.trim())) errors.leaderEmail = "Enter a valid email address.";

  if (!form.teamName.trim()) errors.teamName = "Required.";

  // only the member blocks actually on screen are checked
  for (let i = 0; i < form.teamSize - 1; i += 1) {
    const m = form.members[i];

    if (!m.name.trim()) errors[`member-${i}-name`] = "Required.";

    if (!m.roll.trim()) errors[`member-${i}-roll`] = "Required.";
    else if (!ROLL_RE.test(m.roll.trim())) errors[`member-${i}-roll`] = "Enter a valid roll number.";

    if (!m.email.trim()) errors[`member-${i}-email`] = "Required.";
    else if (!EMAIL_RE.test(m.email.trim())) errors[`member-${i}-email`] = "Enter a valid email address.";
  }

  return errors;
}

/** The red pin that tacks a sheet to the board, borrowed from the contact page. */
function Pin({ className }) {
  return (
    <span
      aria-hidden
      className={`absolute z-20 h-3 w-3 rounded-full bg-[oklch(0.5_0.19_27)] shadow-[0_2px_4px_rgba(0,0,0,0.6)] ${className}`}
    />
  );
}

function Field({ id, label, error, children }) {
  return (
    <div className="reg-field">
      <label
        htmlFor={id}
        className="block font-typewriter text-[10px] tracking-[0.12em] text-ink/70"
      >
        {label.toUpperCase()}
      </label>
      {children}
      <div className="mt-0.5 min-h-[12px]">
        {error && (
          <p className="font-typewriter text-[9px] text-red-800">{error}</p>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [filed, setFiled] = useState(false);

  const clearError = (key) =>
    setErrors((e) => {
      if (!e[key]) return e;
      const next = { ...e };
      delete next[key];
      return next;
    });

  const set = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    clearError(name);
  };

  const setMember = (index, key, value) => {
    setForm((f) => ({
      ...f,
      members: f.members.map((m, i) => (i === index ? { ...m, [key]: value } : m)),
    }));
    clearError(`member-${index}-${key}`);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const found = validate(form);
    setErrors(found);

    const problems = Object.keys(found);
    if (problems.length > 0) {
      // wait for the render that marks the fields, then move focus to the first
      requestAnimationFrame(() => {
        const first = document.getElementById(problems[0]);
        if (first) first.focus();
      });
      return;
    }

    setSubmitting(true);
    const { error } = await registerTeam(form);
    setSubmitting(false);

    if (error) {
      setErrors({ form: error });
      return;
    }
    setFiled(true);
  };

  const inputClass = (name) =>
    `paper-field w-full px-3 py-2 font-typewriter text-[11px] tracking-wide transition-all ${
      errors[name] ? "is-invalid" : ""
    }`;

  const extraMembers = form.teamSize - 1;

  return (
    <main className="register-page min-h-screen bg-[oklch(0.09_0.005_60)] p-1.5 sm:p-3 md:p-6">
      <div className="mx-auto max-w-[1100px] border border-[oklch(0.3_0.02_70)]/70 bg-board px-4 py-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] sm:px-8 md:px-12 md:py-10">
        {/* ------------------------------- header ------------------------------ */}
        <p className="font-typewriter text-[10px] tracking-[0.3em] text-[oklch(0.62_0.02_70)]">
          ENLISTMENT FORM // INTEL X 2026
        </p>
        {/* the one element carrying the home page's palette: cyan accent and
            glow on the site's foreground white */}
        <h1 className="font-condensed mt-2 text-4xl tracking-[0.14em] text-foreground sm:text-5xl">
          REGISTER YOUR <span className="text-glow text-cyan">TEAM</span>
        </h1>
        <p className="mt-3 max-w-xl font-typewriter text-xs leading-relaxed text-[oklch(0.75_0.01_80)]">
          One entry per team. The leader is member 01 and the point of contact
          for every briefing that follows.
        </p>

        {/* ------------------------------ the sheet ---------------------------- */}
        <div className="relative mt-8">
          <span
            className="paper-aged pointer-events-none absolute inset-0"
            style={{
              backgroundImage: `url(${paperDoc})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <Pin className="left-[4%] top-[-6px]" />
          <Pin className="right-[4%] top-[-6px]" />

          <div className="relative z-10 px-5 py-7 sm:px-8 md:px-10">
            {filed ? (
              <div className="mx-auto max-w-lg text-center">
                <p className="font-typewriter text-xs font-bold tracking-[0.2em] text-[oklch(0.42_0.16_27)]">
                  ✔ REGISTRATION FILED
                </p>
                <h2 className="font-condensed mt-3 text-4xl tracking-[0.12em] text-ink">
                  CLEARED
                </h2>
                <p className="mt-4 font-typewriter text-[11px] leading-6 text-ink/85">
                  Team <span className="font-bold">{form.teamName}</span> is on
                  the board with{" "}
                  <span className="font-bold">
                    {form.teamSize} operative{form.teamSize > 1 ? "s" : ""}
                  </span>
                  , led by <span className="font-bold">{form.leaderName}</span>.
                  Confirmation goes to{" "}
                  <span className="font-bold">{form.leaderEmail}</span>.
                </p>

                <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link
                    to="/events"
                    className="border border-ink/40 bg-[oklch(0.22_0.01_60)] px-6 py-2 font-typewriter text-[10px] tracking-[0.18em] text-[oklch(0.92_0.02_85)] transition-colors hover:bg-[oklch(0.28_0.01_60)]"
                  >
                    BACK TO THE MAP
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setForm(EMPTY);
                      setFiled(false);
                    }}
                    className="border border-ink/40 px-6 py-2 font-typewriter text-[10px] tracking-[0.18em] text-ink transition-colors hover:bg-ink/10"
                  >
                    REGISTER ANOTHER TEAM
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                {/* ---------------------------- leader ---------------------- */}
                <fieldset className="border-0 p-0">
                  <legend className="border-b border-ink/30 pb-1 font-typewriter text-sm tracking-wide text-ink">
                    01 — TEAM LEADER
                  </legend>

                  <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
                    {LEADER_FIELDS.map((f) => (
                      <Field key={f.name} id={f.name} label={f.label} error={errors[f.name]}>
                        <input
                          id={f.name}
                          name={f.name}
                          type={f.type || "text"}
                          value={form[f.name]}
                          onChange={(e) => set(f.name, e.target.value)}
                          placeholder={f.placeholder}
                          autoComplete={f.autoComplete}
                          aria-invalid={errors[f.name] ? "true" : undefined}
                          className={inputClass(f.name)}
                        />
                      </Field>
                    ))}
                  </div>
                </fieldset>

                {/* ----------------------------- squad ---------------------- */}
                <fieldset className="mt-7 border-0 p-0">
                  <legend className="border-b border-ink/30 pb-1 font-typewriter text-sm tracking-wide text-ink">
                    02 — SQUAD SIZE
                  </legend>

                  <p className="mt-4 font-typewriter text-[10px] tracking-[0.12em] text-ink/70">
                    NUMBER OF TEAM MEMBERS
                  </p>
                  <div
                    className="mt-2 flex flex-wrap gap-2"
                    role="radiogroup"
                    aria-label="Number of team members"
                  >
                    {[1, 2, 3, 4].map((n) => {
                      const chosen = form.teamSize === n;
                      return (
                        <button
                          key={n}
                          type="button"
                          role="radio"
                          aria-checked={chosen}
                          onClick={() => set("teamSize", n)}
                          className={`reg-count font-condensed ${chosen ? "is-active" : ""}`}
                        >
                          {n}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-2 font-typewriter text-[9px] leading-5 text-ink/60">
                    Counting the leader.{" "}
                    {extraMembers === 0
                      ? "A solo entry — no other operatives to add."
                      : `Add details for ${extraMembers} more operative${extraMembers > 1 ? "s" : ""}.`}
                  </p>
                </fieldset>

                {/* -------------------------- other members ----------------- */}
                {extraMembers > 0 && (
                  <fieldset className="mt-7 border-0 p-0">
                    <legend className="border-b border-ink/30 pb-1 font-typewriter text-sm tracking-wide text-ink">
                      03 — OTHER OPERATIVES
                    </legend>

                    <div className="mt-4 space-y-6">
                      {Array.from({ length: extraMembers }).map((_, i) => (
                        <div key={i} className="reg-member border-l-2 border-ink/25 pl-4">
                          <p className="font-typewriter text-[10px] font-bold tracking-[0.18em] text-ink/80">
                            MEMBER {String(i + 2).padStart(2, "0")}
                          </p>

                          <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-3">
                            {MEMBER_FIELDS.map((f) => {
                              const id = `member-${i}-${f.key}`;
                              return (
                                <Field key={f.key} id={id} label={f.label} error={errors[id]}>
                                  <input
                                    id={id}
                                    type={f.type || "text"}
                                    value={form.members[i][f.key]}
                                    onChange={(e) => setMember(i, f.key, e.target.value)}
                                    placeholder={f.placeholder}
                                    autoComplete="off"
                                    aria-invalid={errors[id] ? "true" : undefined}
                                    className={inputClass(id)}
                                  />
                                </Field>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </fieldset>
                )}

                {errors.form && (
                  <p
                    role="alert"
                    className="mt-6 border border-red-900/40 bg-red-900/10 px-3 py-2 font-typewriter text-[10px] leading-5 text-red-800"
                  >
                    {errors.form}
                  </p>
                )}

                <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex cursor-pointer items-center gap-2 bg-[oklch(0.22_0.01_60)] px-9 py-2 font-typewriter text-[11px] tracking-[0.18em] text-[oklch(0.92_0.02_85)] shadow-[0_4px_10px_rgba(0,0,0,0.5)] transition-all hover:bg-[oklch(0.28_0.01_60)] active:scale-[0.98] disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <span className="inline-block h-2 w-2 animate-ping rounded-full bg-gold" />
                        <span>FILING...</span>
                      </>
                    ) : (
                      <span>FILE REGISTRATION</span>
                    )}
                  </button>

                  <p className="font-typewriter text-[9px] tracking-[0.14em] text-ink/60">
                    ENTRIES CLOSE 05 / 17:00
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
