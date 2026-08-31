export default function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--paper)]/90 backdrop-blur">
      <div className="container-px mx-auto flex h-16 max-w-[1400px] items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="relative block h-6 w-6 overflow-hidden rounded-[3px]">
            <span className="absolute inset-0 bg-[var(--ink)]" />
            <span
              className="spectrum-seam absolute inset-0"
              style={{ clipPath: "polygon(100% 0, 100% 100%, 30% 100%)" }}
            />
          </span>
          <span
            className="text-[1.05rem] font-semibold text-[var(--ink)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Holor
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {["Product", "How it works", "Customers", "Pricing"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-[0.925rem] text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)]"
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="#"
            className="hidden text-[0.925rem] text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)] sm:block"
          >
            Sign in
          </a>
          <a
            href="#demo"
            className="rounded-md bg-[var(--ink)] px-4 py-2 text-[0.9rem] font-medium text-white transition-transform hover:scale-[1.03]"
          >
            Book a demo
          </a>
        </div>
      </div>
    </header>
  );
}
