import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "GenX Digital privacy policy.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-3 text-sm text-slate-500">
        Placeholder — to be reviewed and finalised before go-live.
      </p>
      <div className="mt-6 space-y-4 text-slate-600">
        <p>
          We collect the information needed to provide your services — such as
          your name, contact details and the products you order — and share it
          with our suppliers and the relevant registries only as required to
          register and manage those services.
        </p>
        <p>
          We handle personal information in line with the Australian Privacy
          Principles. You can request access to or correction of your
          information at any time.
        </p>
        <p>The full policy will be published here prior to launch.</p>
      </div>
    </main>
  );
}
