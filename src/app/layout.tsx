import type { Metadata } from "next";
import { Playfair_Display, Cinzel } from "next/font/google";
import "./globals.css";
import Snowflakes from "@/components/Snowflakes";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
});

export const metadata: Metadata = {
  title: "First Frost Countdown",
  description: "Birthday Countdown to Oct 1, 2026",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${cinzel.variable} antialiased`}
    >
      <body className="min-h-screen font-serif relative">
        <Snowflakes />
        {children}
      </body>
    </html>
  );
}
