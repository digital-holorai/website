import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Holor AI — Structure from unstructured data",
  description:
    "Holor AI turns contracts, invoices, and forms into clean, structured data your systems can actually use — no templates, no manual review queues.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
