import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ANA — A different kind of intelligence",
    template: "%s | ANA",
  },
  description:
    "A thoughtful AI companion for the questions you carry, the ideas you explore and the things you want to make happen.",
  applicationName: "ANA",
  metadataBase: new URL("https://ana-ai.pages.dev"),
  openGraph: {
    title: "ANA — A different kind of intelligence",
    description: "A thoughtful AI companion, made for the way your mind moves.",
    type: "website",
    siteName: "ANA",
  },
  twitter: {
    card: "summary_large_image",
    title: "ANA — A different kind of intelligence",
    description: "A thoughtful AI companion, made for the way your mind moves.",
  },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#080811",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
