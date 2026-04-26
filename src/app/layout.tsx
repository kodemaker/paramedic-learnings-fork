import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Paramedic Learnings",
  description:
    "A knowledge platform for ambulance personnel: capture and improve operational guidance with AI-assisted analysis and human approval.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sourceSerif.variable} ${inter.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-background text-ink">
        <header className="border-b border-rule">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
            <a href="/" className="group inline-flex items-baseline gap-2">
              <span className="font-serif text-xl font-semibold tracking-tight text-ink">
                Paramedic Learnings
              </span>
              <span className="font-mono text-xs uppercase tracking-[0.18em] text-ink-subtle">
                ref.
              </span>
            </a>
            <nav className="font-sans text-sm text-ink-muted">
              <a
                href="/topics"
                className="border-b border-transparent pb-0.5 transition-colors hover:border-ink hover:text-ink"
              >
                Topics
              </a>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-rule">
          <div className="mx-auto max-w-4xl px-6 py-6 font-mono text-xs text-ink-subtle">
            Paramedic Learnings · operational guidance for ambulance personnel
          </div>
        </footer>
      </body>
    </html>
  );
}
