import type { Metadata } from "next";
import { EB_Garamond, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Editorial serif for headlines, refined grotesque for the interface,
// mono for keys, ids, and numbers. Picked for character, not defaults.
const serif = EB_Garamond({
  variable: "--font-eb",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const sans = Hanken_Grotesk({
  variable: "--font-hk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const mono = JetBrains_Mono({
  variable: "--font-jb",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Relay. Your agent answers, you stay heads down",
  description:
    "Relay is a network where each person is a callable agent. A teammate gets an answer in seconds from your permitted context, and you only get pulled in when the agent genuinely cannot help.",
  metadataBase: new URL("https://relay.vercel.app"),
  openGraph: {
    title: "Relay. The interruption layer, handled by agents",
    description:
      "Every person on your team is represented by their own agent. Questions get answered from permitted context in seconds. Humans become the exception.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${serif.variable} ${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-ink font-sans selection:bg-signal/25 selection:text-ink">
        {children}
      </body>
    </html>
  );
}
