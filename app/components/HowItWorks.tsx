const steps = [
  {
    n: "01",
    title: "Point Holor at a document",
    body: "Drop in a PDF, scan, or email attachment. Holor reads it as-is — no template, no pre-built schema required for common document types.",
  },
  {
    n: "02",
    title: "It extracts the fields that matter",
    body: "Vendor names, line items, dates, totals, clauses — pulled out with a confidence score attached to each one, so you know what to trust.",
  },
  {
    n: "03",
    title: "Clean data lands where you work",
    body: "Structured records post straight to your database, spreadsheet, or ERP. Anything below your confidence threshold routes to a review queue instead.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="container-px mx-auto max-w-[1400px] py-24">
      <div className="mb-14 max-w-[42ch]">
        <h2 className="text-[clamp(1.9rem,3vw,2.6rem)] font-semibold leading-tight text-[var(--ink)]">
          From inbox to database in three steps
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-3">
        {steps.map((step, i) => (
          <div key={step.n} className="relative">
            <div className="flex items-baseline gap-3">
              <span
                className="text-[0.95rem] font-semibold text-[var(--indigo)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {step.n}
              </span>
              <div className="h-px flex-1 bg-[var(--line)]" />
            </div>
            <h3 className="mt-4 text-[1.2rem] font-semibold text-[var(--ink)]">
              {step.title}
            </h3>
            <p className="mt-2.5 max-w-[36ch] text-[0.975rem] leading-relaxed text-[var(--ink-soft)]">
              {step.body}
            </p>
            {i < steps.length - 1 && (
              <div
                className="pointer-events-none absolute -right-4 top-2 hidden text-[var(--line)] md:block"
                aria-hidden="true"
              >
                <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                  <path d="M0 7H18M18 7L12 1M18 7L12 13" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
