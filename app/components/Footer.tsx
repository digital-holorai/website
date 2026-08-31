const columns = [
  {
    title: "Product",
    links: ["How it works", "Integrations", "Pricing", "Changelog"],
  },
  {
    title: "Company",
    links: ["About", "Careers", "Blog"],
  },
  {
    title: "Resources",
    links: ["Documentation", "API reference", "Status"],
  },
  {
    title: "Legal",
    links: ["Privacy", "Terms", "Security"],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-[var(--line)] py-16">
      <div className="container-px mx-auto max-w-[1400px]">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="relative block h-5 w-5 overflow-hidden rounded-[3px]">
                <span className="absolute inset-0 bg-[var(--ink)]" />
                <span
                  className="spectrum-seam absolute inset-0"
                  style={{ clipPath: "polygon(100% 0, 100% 100%, 30% 100%)" }}
                />
              </span>
              <span
                className="text-[1rem] font-semibold text-[var(--ink)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Holor
              </span>
            </div>
            <p className="mt-4 max-w-[26ch] text-[0.875rem] leading-relaxed text-[var(--ink-soft)]">
              Structured data from the documents your team already has.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-[0.85rem] font-medium text-[var(--ink)]">
                {col.title}
              </p>
              <ul className="mt-4 flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-[0.875rem] text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)]"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-[var(--line)] pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.825rem] text-[var(--ink-soft)]">
            © {new Date().getFullYear()} Holor AI, Inc.
          </p>
          <p className="text-[0.825rem] text-[var(--ink-soft)]">
            San Francisco, CA
          </p>
        </div>
      </div>
    </footer>
  );
}
