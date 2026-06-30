"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient, isSupabaseAuthConfigured } from "@/lib/supabase/browser";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const configured = isSupabaseAuthConfigured();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setNotice(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    const name = String(form.get("name") ?? "");

    const supabase = createSupabaseBrowserClient();
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (error) throw error;
        if (data.session) {
          router.push("/account");
          router.refresh();
        } else {
          setNotice("Check your email to confirm your account, then log in.");
          setMode("login");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/account");
        router.refresh();
      }
    } catch (err) {
      setError((err as Error).message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-6 py-20">
      <h1 className="text-3xl font-bold tracking-tight">
        {mode === "login" ? "Welcome back" : "Create your account"}
      </h1>
      <p className="mt-2 text-slate-600">
        {mode === "login"
          ? "Log in to manage your domains, services and orders."
          : "Sign up to buy and manage domains, hosting, SSL and email."}
      </p>

      {!configured && (
        <p className="mt-6 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Accounts aren&apos;t connected yet.
        </p>
      )}

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        {mode === "signup" && (
          <Field name="name" label="Full name" type="text" required />
        )}
        <Field name="email" label="Email" type="email" required />
        <Field name="password" label="Password" type="password" required />

        {error && <p className="text-sm text-red-600">{error}</p>}
        {notice && (
          <p className="rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-700">{notice}</p>
        )}

        <button
          type="submit"
          disabled={submitting || !configured}
          className="w-full rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {submitting
            ? "Please wait…"
            : mode === "login"
              ? "Log in"
              : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        {mode === "login" ? (
          <>
            New here?{" "}
            <button onClick={() => setMode("signup")} className="font-semibold text-brand-600">
              Create an account
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button onClick={() => setMode("login")} className="font-semibold text-brand-600">
              Log in
            </button>
          </>
        )}
      </p>

      <p className="mt-4 text-center text-sm">
        <Link href="/" className="text-slate-500 hover:text-brand-600">
          ← Back to home
        </Link>
      </p>
    </main>
  );
}

function Field({
  name,
  label,
  type,
  required,
}: {
  name: string;
  label: string;
  type: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={type === "password" ? "current-password" : type}
        className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
    </label>
  );
}
