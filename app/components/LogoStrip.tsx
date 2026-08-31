const companies = [
  "Northwind Logistics",
  "Ferro Materials",
  "Ashgrove Capital",
  "Wren & Colt",
  "Basin Freight",
  "Corta Health",
];

export default function LogoStrip() {
  return (
    <section className="border-y border-[var(--line)] bg-[var(--paper-alt)] py-9">
      <div className="container-px mx-auto max-w-[1400px]">
        <p className="mb-6 text-[0.85rem] text-[var(--ink-soft)]">
          Processing documents for finance teams at
        </p>
        <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
          {companies.map((name) => (
            <span
              key={name}
              className="text-[1.05rem] font-medium text-[var(--ink)]/50"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
