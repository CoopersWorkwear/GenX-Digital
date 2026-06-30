"use client";

import { useState } from "react";
import Link from "next/link";
import { PRESET_SCHEMES } from "@/lib/builder/schemes";
import { extractSchemeFromFile } from "@/lib/builder/extractColors";
import type { ColorScheme } from "@/lib/builder/types";

type LogoOption = "none" | "upload" | "create";
type ImageOption = "none" | "upload" | "create";

export default function WebsiteBuilderPage() {
  const [logoOption, setLogoOption] = useState<LogoOption>("none");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [derived, setDerived] = useState<ColorScheme | null>(null);
  const [useLogoColours, setUseLogoColours] = useState(true);
  const [presetId, setPresetId] = useState(PRESET_SCHEMES[0].id);
  const [wantsColourHelp, setWantsColourHelp] = useState(false);
  const [imageOption, setImageOption] = useState<ImageOption>("none");
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setLogoFile(file);
    setDerived(null);
    if (file) {
      const scheme = await extractSchemeFromFile(file);
      setDerived(scheme);
      setUseLogoColours(true);
    }
  }

  function effectiveScheme(): ColorScheme {
    if (logoOption === "upload" && derived && useLogoColours) return derived;
    return PRESET_SCHEMES.find((p) => p.id === presetId)!.scheme;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const formEl = e.currentTarget;
    const data = new FormData(formEl);
    const scheme = effectiveScheme();

    const body = new FormData();
    body.set("businessName", String(data.get("businessName") ?? ""));
    body.set("domain", String(data.get("domain") ?? ""));
    body.set("description", String(data.get("description") ?? ""));
    body.set("email", String(data.get("email") ?? ""));
    body.set("primary", scheme.primary);
    body.set("accent", scheme.accent);
    body.set("wantsLogo", String(logoOption === "create"));
    body.set("wantsImages", String(imageOption === "create"));
    body.set("wantsColourHelp", String(wantsColourHelp));
    if (logoOption === "upload" && logoFile) body.set("logo", logoFile);
    if (imageOption === "upload") imageFiles.forEach((f) => body.append("images", f));

    try {
      const res = await fetch("/api/website-builder", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setPreviewUrl(json.previewUrl);
    } catch (err) {
      setError((err as Error).message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (previewUrl) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <div className="rounded-2xl border border-brand-100 bg-brand-50 p-8">
          <h2 className="text-xl font-semibold text-brand-700">Your website is ready to preview! 🎉</h2>
          <p className="mt-2 text-slate-700">
            We&apos;ve built you a starter site from your details. Open the preview below — we&apos;ll
            also email you the link.
          </p>
          <Link
            href={previewUrl}
            target="_blank"
            className="mt-6 inline-block rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700"
          >
            Open my website preview →
          </Link>
        </div>
      </main>
    );
  }

  const showLogoColours = logoOption === "upload" && derived;

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
        AI Website Builder
      </span>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">Enter your details. Get a website.</h1>
      <p className="mt-3 text-slate-600">
        Tell us about your business and our AI builds you a fresh, ready-to-go website. No domain
        needed to start — we&apos;ll email you a preview link.
      </p>

      <form onSubmit={onSubmit} className="mt-10 space-y-8">
        {/* Business basics */}
        <Field name="businessName" label="Business name" placeholder="Your Business Pty Ltd" required />

        <div>
          <Field name="domain" label="Your domain (optional)" placeholder="yourbusiness.com.au" />
          <p className="mt-1 text-xs text-slate-500">
            Don&apos;t have one yet?{" "}
            <Link href="/domains" className="font-semibold text-brand-600">
              Find &amp; register a domain →
            </Link>
          </p>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            What does your business do? <span className="text-brand-600">*</span>
          </span>
          <textarea
            name="description"
            required
            rows={5}
            placeholder="Tell us about your business, your customers, and the style you like…"
            className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </label>

        {/* Logo */}
        <fieldset>
          <legend className="text-sm font-medium text-slate-700">Logo</legend>
          <div className="mt-2 space-y-2">
            <Radio name="logo" checked={logoOption === "upload"} onChange={() => setLogoOption("upload")}
              label="I'll upload my logo" hint="We'll match your website colours to it automatically." />
            {logoOption === "upload" && (
              <div className="ml-6">
                <input type="file" accept="image/*" onChange={onLogoChange}
                  className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand-600 file:px-4 file:py-2 file:text-white" />
                {derived && (
                  <div className="mt-3 flex items-center gap-3 text-sm text-slate-600">
                    <span>Colours from your logo:</span>
                    <Swatch scheme={derived} />
                  </div>
                )}
              </div>
            )}
            <Radio name="logo" checked={logoOption === "create"} onChange={() => setLogoOption("create")}
              label="Create a logo for me" hint="Our team designs one to match your brand." />
            <Radio name="logo" checked={logoOption === "none"} onChange={() => setLogoOption("none")}
              label="No logo for now" />
          </div>
        </fieldset>

        {/* Colour scheme */}
        <fieldset>
          <legend className="text-sm font-medium text-slate-700">Colour scheme</legend>
          {showLogoColours && (
            <label className="mt-2 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={useLogoColours} onChange={(e) => setUseLogoColours(e.target.checked)} />
              Use my logo&apos;s colours
            </label>
          )}
          <div className="mt-3 flex flex-wrap gap-3" style={{ opacity: showLogoColours && useLogoColours ? 0.4 : 1 }}>
            {PRESET_SCHEMES.map((p) => (
              <button type="button" key={p.id} onClick={() => setPresetId(p.id)}
                className={`rounded-xl border-2 p-1 ${presetId === p.id ? "border-brand-600" : "border-transparent"}`}
                aria-label={p.name}>
                <Swatch scheme={p.scheme} />
                <span className="mt-1 block text-center text-xs text-slate-500">{p.name}</span>
              </button>
            ))}
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={wantsColourHelp} onChange={(e) => setWantsColourHelp(e.target.checked)} />
            Not sure — help me choose
          </label>
        </fieldset>

        {/* Images */}
        <fieldset>
          <legend className="text-sm font-medium text-slate-700">Images</legend>
          <div className="mt-2 space-y-2">
            <Radio name="images" checked={imageOption === "upload"} onChange={() => setImageOption("upload")}
              label="I'll upload my own images" hint="Up to 4 images." />
            {imageOption === "upload" && (
              <input type="file" accept="image/*" multiple
                onChange={(e) => setImageFiles(Array.from(e.target.files ?? []).slice(0, 4))}
                className="ml-6 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand-600 file:px-4 file:py-2 file:text-white" />
            )}
            <Radio name="images" checked={imageOption === "create"} onChange={() => setImageOption("create")}
              label="Create images for me" hint="We'll source or generate images that fit." />
            <Radio name="images" checked={imageOption === "none"} onChange={() => setImageOption("none")}
              label="No images for now" />
          </div>
        </fieldset>

        <Field name="email" label="Email" type="email" placeholder="you@example.com" required />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={submitting}
          className="rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
          {submitting ? "Building…" : "Build my website"}
        </button>
      </form>
    </main>
  );
}

function Field({ name, label, type = "text", placeholder, required }: {
  name: string; label: string; type?: string; placeholder?: string; required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-brand-600"> *</span>}
      </span>
      <input name={name} type={type} placeholder={placeholder} required={required}
        className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
    </label>
  );
}

function Radio({ name, checked, onChange, label, hint }: {
  name: string; checked: boolean; onChange: () => void; label: string; hint?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2">
      <input type="radio" name={name} checked={checked} onChange={onChange} className="mt-1" />
      <span>
        <span className="text-sm text-slate-800">{label}</span>
        {hint && <span className="block text-xs text-slate-500">{hint}</span>}
      </span>
    </label>
  );
}

function Swatch({ scheme }: { scheme: ColorScheme }) {
  return (
    <span className="flex h-8 w-16 overflow-hidden rounded-lg border border-slate-200">
      <span className="h-full w-1/2" style={{ background: scheme.primary }} />
      <span className="h-full w-1/2" style={{ background: scheme.accent }} />
    </span>
  );
}
