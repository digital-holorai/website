export default function Features() {
  return (
    <section id="product" className="bg-[var(--paper-alt)] py-24">
      <div className="container-px mx-auto max-w-[1400px]">
        <div className="mb-14 max-w-[42ch]">
          <h2 className="text-[clamp(1.9rem,3vw,2.6rem)] font-semibold leading-tight text-[var(--ink)]">
            Built for documents that don&apos;t follow a template
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-6 md:grid-rows-2">
          {/* Large: confidence scoring */}
          <div className="rounded-xl border border-[var(--line)] bg-white p-8 md:col-span-4 md:row-span-2">
            <h3 className="text-[1.3rem] font-semibold text-[var(--ink)]">
              A confidence score on every field
            </h3>
            <p className="mt-3 max-w-[46ch] text-[0.975rem] leading-relaxed text-[var(--ink-soft)]">
              Holor doesn&apos;t just guess and move on. Every extracted value
              carries a score, so you can automate the fields it&apos;s certain
              about and route the rest for a quick human check.
            </p>
            <div className="mt-8 flex flex-col gap-2.5">
              {[
                { label: "Invoice total", pct: 99 },
                { label: "PO number", pct: 94 },
                { label: "Payment terms", pct: 61 },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-4">
                  <span className="w-32 shrink-0 text-[0.85rem] text-[var(--ink-soft)]">
                    {row.label}
                  </span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--paper-alt)]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${row.pct}%`,
                        background: row.pct > 85 ? "var(--indigo)" : "var(--amber)",
                      }}
                    />
                  </div>
                  <span className="w-10 text-right text-[0.8rem] text-[var(--ink-soft)]">
                    {row.pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Schema-free */}
          <div className="rounded-xl border border-[var(--line)] bg-white p-7 md:col-span-2">
            <h3 className="text-[1.05rem] font-semibold text-[var(--ink)]">
              No schema to maintain
            </h3>
            <p className="mt-2.5 text-[0.925rem] leading-relaxed text-[var(--ink-soft)]">
              New vendor, new layout, same result — Holor adapts instead of
              breaking.
            </p>
          </div>

          {/* Review queue */}
          <div className="rounded-xl border border-[var(--line)] bg-white p-7 md:col-span-2">
            <h3 className="text-[1.05rem] font-semibold text-[var(--ink)]">
              A review queue, not a black box
            </h3>
            <p className="mt-2.5 text-[0.925rem] leading-relaxed text-[var(--ink-soft)]">
              Low-confidence fields wait for a person before anything posts
              downstream.
            </p>
          </div>

          {/* Integrations - wide */}
          <div className="rounded-xl border border-[var(--line)] bg-white p-7 md:col-span-6">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div>
                <h3 className="text-[1.05rem] font-semibold text-[var(--ink)]">
                  Ships to where your team already works
                </h3>
                <p className="mt-2 max-w-[44ch] text-[0.925rem] leading-relaxed text-[var(--ink-soft)]">
                  Postgres, Snowflake, NetSuite, and Google Sheets out of the
                  box, or push structured JSON to your own endpoint.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {["Postgres", "Snowflake", "NetSuite", "Sheets", "Webhook"].map(
                  (item) => (
                    <span
                      key={item}
                      className="rounded-md border border-[var(--line)] px-3 py-1.5 text-[0.825rem] text-[var(--ink-soft)]"
                    >
                      {item}
                    </span>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
