/** A consistent gradient hero band for inner pages. */
export function PageHero({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-slate-100">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50 to-white" />
      <div className="absolute -right-10 top-0 -z-10 h-64 w-64 rounded-full bg-brand-100/60 blur-3xl" />
      <div className="absolute left-0 top-10 -z-10 h-56 w-56 rounded-full bg-violet-100/50 blur-3xl" />
      <div className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-slate-600">{subtitle}</p>
      </div>
    </section>
  );
}
