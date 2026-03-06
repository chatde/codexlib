import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://codexlib.io"),
  title: "CodexLib — The Library of Alexandria for AI",
  description:
    "10,000+ AI-optimized knowledge packs in compressed format. Deep knowledge bases any AI can ingest instantly.",
  openGraph: {
    title: "CodexLib — The Library of Alexandria for AI",
    description:
      "10,000+ AI-optimized knowledge packs in compressed format.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CodexLib — The Library of Alexandria for AI",
    description:
      "10,000+ AI-optimized knowledge packs in compressed format.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${cormorant.variable} ${dmSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
