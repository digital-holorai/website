export default function Testimonial() {
  return (
    <section id="customers" className="container-px mx-auto max-w-[1400px] py-24">
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[auto_1fr]">
        <div className="spectrum-seam h-1 w-16 rounded-full lg:h-16 lg:w-1" />
        <div className="max-w-[62ch]">
          <p
            className="text-[clamp(1.4rem,2.4vw,1.9rem)] font-medium leading-snug text-[var(--ink)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            We used to have two people whose whole job was retyping invoice
            data into NetSuite. Now they check the queue Holor flags and spend
            the rest of the week on actual analysis.
          </p>
          <div className="mt-6">
            <p className="text-[0.95rem] font-medium text-[var(--ink)]">
              Priya Nair
            </p>
            <p className="text-[0.875rem] text-[var(--ink-soft)]">
              Head of Finance Operations, Basin Freight
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
