const tiers = [
  {
    name: "Starter",
    price: "$0",
    cadence: "up to 200 documents/mo",
    description: "For testing Holor against your own documents.",
    features: [
      "200 documents / month",
      "3 document types",
      "CSV and Sheets export",
      "Community support",
    ],
    cta: "Start free",
    highlighted: false,
  },
  {
    name: "Team",
    price: "$390",
    cadence: "per month",
    description: "For a finance or ops team automating a real workflow.",
    features: [
      "5,000 documents / month",
      "Unlimited document types",
      "Postgres, Snowflake, NetSuite",
      "Review queue with roles",
      "Priority support",
    ],
    cta: "Start free trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "volume pricing",
    description: "For teams processing high volumes or sensitive data.",
    features: [
      "Unlimited documents",
      "Private deployment option",
      "SSO and audit logs",
      "Dedicated onboarding",
    ],
    cta: "Talk to sales",
    highlighted: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="bg-[var(--paper-alt)] py-24">
      <div className="container-px mx-auto max-w-[1400px]">
        <div className="mb-14 max-w-[42ch]">
          <h2 className="text-[clamp(1.9rem,3vw,2.6rem)] font-semibold leading-tight text-[var(--ink)]">
            Straightforward pricing, by volume
          </h2>
          <p className="mt-3 text-[1rem] text-[var(--ink-soft)]">
            Every plan includes the same extraction quality. You&apos;re paying
            for volume and support, not features held back.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`flex flex-col rounded-xl border p-8 ${
                tier.highlighted
                  ? "border-[var(--ink)] bg-white"
                  : "border-[var(--line)] bg-white"
              }`}
            >
              {tier.highlighted && (
                <span
                  className="mb-4 w-fit rounded-full px-3 py-1 text-[0.75rem] font-medium text-white"
                  style={{ background: "var(--indigo)" }}
                >
                  Most teams start here
                </span>
              )}
              <h3 className="text-[1.15rem] font-semibold text-[var(--ink)]">
                {tier.name}
              </h3>
              <p className="mt-1 text-[0.9rem] text-[var(--ink-soft)]">
                {tier.description}
              </p>

              <div className="mt-6 flex items-baseline gap-2">
                <span
                  className="text-[2.2rem] font-semibold text-[var(--ink)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {tier.price}
                </span>
                <span className="text-[0.85rem] text-[var(--ink-soft)]">
                  {tier.cadence}
                </span>
              </div>

              <ul className="mt-7 flex flex-1 flex-col gap-3">
                {tier.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2.5 text-[0.9rem] text-[var(--ink)]"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="mt-0.5 shrink-0"
                      aria-hidden="true"
                    >
                      <path
                        d="M3 8.5L6.2 11.5L13 4.5"
                        stroke="var(--indigo)"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href="#demo"
                className={`mt-8 rounded-md px-5 py-3 text-center text-[0.9rem] font-medium transition-transform hover:scale-[1.02] ${
                  tier.highlighted
                    ? "bg-[var(--ink)] text-white"
                    : "border border-[var(--line)] text-[var(--ink)]"
                }`}
              >
                {tier.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
