import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import { BRAND } from "@/lib/site";
import "./globals.css";

// The opsz axis gives the tight "Display" cut at headline sizes and the wider "Text" cut for body copy,
// which is how the reference pairs its headings and paragraphs.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  axes: ["opsz"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["500"],
});

export const metadata: Metadata = {
  title: `${BRAND} | A Robot Arm That Brings You What You Need`,
  description: "A voice-controlled assistive robot arm for people with arthritis: ask for an item on its tray and it brings it to you.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${newsreader.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
