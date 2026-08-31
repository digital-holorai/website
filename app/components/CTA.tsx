export default function CTA() {
  return (
    <section id="demo" className="container-px mx-auto max-w-[1400px] py-24">
      <div className="relative overflow-hidden rounded-2xl bg-[var(--ink)] px-8 py-16 sm:px-16">
        <div
          className="spectrum-seam absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-20 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative max-w-[36ch]">
          <h2 className="text-[clamp(1.9rem,3.2vw,2.6rem)] font-semibold leading-tight text-white">
            Send us a document, we&apos;ll show you the extraction
          </h2>
          <p className="mt-4 text-[1rem] leading-relaxed text-white/70">
            No integration required to try it. Fifteen minutes, one real
            document from your own pile.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="mailto:hello@holor.ai"
              className="rounded-md bg-white px-6 py-3.5 text-[0.95rem] font-medium text-[var(--ink)] transition-transform hover:scale-[1.02]"
            >
              Book a demo
            </a>
            <a
              href="mailto:hello@holor.ai"
              className="rounded-md border border-white/25 px-6 py-3.5 text-[0.95rem] font-medium text-white transition-colors hover:border-white/60"
            >
              hello@holor.ai
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
