const scraps = [
  { top: "6%", left: "4%", rot: -9, w: 92, h: 34, lines: 2 },
  { top: "2%", left: "42%", rot: 6, w: 78, h: 46, lines: 3 },
  { top: "34%", left: "10%", rot: 4, w: 104, h: 30, lines: 2 },
  { top: "58%", left: "0%", rot: -5, w: 86, h: 52, lines: 3 },
  { top: "70%", left: "38%", rot: 8, w: 96, h: 30, lines: 2 },
  { top: "20%", left: "62%", rot: -7, w: 64, h: 40, lines: 2 },
  { top: "82%", left: "8%", rot: 3, w: 70, h: 28, lines: 1 },
];

const rows = [
  ["Vendor", "Acme Rivet Co."],
  ["Invoice #", "INV-40218"],
  ["Amount", "$12,480.00"],
  ["Due date", "Sep 14, 2026"],
  ["Terms", "Net 30"],
];

export default function Hero() {
  return (
    <section id="top" className="container-px mx-auto max-w-[1400px] pt-14 pb-20 sm:pt-20 sm:pb-28">
      <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        {/* Copy */}
        <div>
          <p className="mb-5 text-[0.95rem] text-[var(--ink-soft)]">
            Document intelligence for finance and ops teams
          </p>
          <h1
            className="max-w-[15ch] text-[clamp(2.5rem,5.2vw,4.1rem)] font-semibold leading-[1.04] text-[var(--ink)]"
          >
            Every messy document, turned into data you can query
          </h1>
          <p className="mt-6 max-w-[46ch] text-[1.125rem] leading-relaxed text-[var(--ink-soft)]">
            Holor reads contracts, invoices, and forms the way a careful
            analyst would — then hands your systems clean, structured
            records instead of another folder of PDFs.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#demo"
              className="rounded-md bg-[var(--indigo)] px-6 py-3.5 text-[0.95rem] font-medium text-white transition-transform hover:scale-[1.02]"
            >
              Book a demo
            </a>
            <a
              href="#how-it-works"
              className="rounded-md border border-[var(--line)] px-6 py-3.5 text-[0.95rem] font-medium text-[var(--ink)] transition-colors hover:border-[var(--ink)]"
            >
              See how it works
            </a>
          </div>

          <p className="mt-8 text-[0.85rem] text-[var(--ink-soft)]">
            No credit card. Sample dataset included, results in minutes.
          </p>
        </div>

        {/* Signature visual: chaos -> structure, one seam */}
        <div
          aria-hidden="true"
          className="relative h-[420px] w-full overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--paper-alt)] sm:h-[460px]"
        >
          {/* raw scraps */}
          {scraps.map((s, i) => (
            <div
              key={i}
              className="absolute rounded-[3px] border border-[var(--line)] bg-white shadow-[0_1px_2px_rgba(20,22,27,0.06)]"
              style={{
                top: s.top,
                left: s.left,
                width: s.w,
                height: s.h,
                transform: `rotate(${s.rot}deg)`,
                padding: "6px 8px",
              }}
            >
              {Array.from({ length: s.lines }).map((_, li) => (
                <div
                  key={li}
                  className="mb-1 h-[3px] rounded-full bg-[var(--line)] last:mb-0"
                  style={{ width: `${70 - li * 15}%` }}
                />
              ))}
            </div>
          ))}

          {/* diagonal spectrum seam */}
          <div
            className="spectrum-seam absolute -left-10 top-0 h-[140%] w-[6px] origin-top-left"
            style={{ transform: "rotate(24deg)" }}
          />

          {/* structured panel */}
          <div className="absolute right-0 top-0 h-full w-[58%] border-l border-[var(--line)] bg-white px-5 py-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[0.75rem] font-medium text-[var(--ink-soft)]">
                Extracted fields
              </span>
              <span className="h-2 w-2 rounded-full" style={{ background: "var(--amber)" }} />
            </div>
            <div className="flex flex-col gap-2.5">
              {rows.map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between border-b border-[var(--line)] pb-2.5 last:border-0"
                >
                  <span className="text-[0.8rem] text-[var(--ink-soft)]">{label}</span>
                  <span className="text-[0.85rem] font-medium text-[var(--ink)]">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
