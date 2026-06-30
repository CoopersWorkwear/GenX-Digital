import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "GenX Digital terms of service.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
      <p className="mt-3 text-sm text-slate-500">
        Placeholder — to be reviewed and finalised before go-live.
      </p>
      <div className="mt-6 space-y-4 text-slate-600">
        <p>
          These terms govern your use of GenX Digital services, including domain
          registration, hosting, SSL certificates and email. By placing an order
          you agree to these terms and to the relevant registry and supplier
          policies.
        </p>
        <p>
          Domain registrations are subject to the policies of the relevant
          registry (for example, auDA for .au domains). Renewals, transfers and
          cancellations follow registry rules and our supplier&apos;s terms.
        </p>
        <p>
          Full terms will be published here prior to launch. For questions,
          please contact us.
        </p>
      </div>
    </main>
  );
}
