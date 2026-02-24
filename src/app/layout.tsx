import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Playfair_Display } from "next/font/google";
import { cookies } from "next/headers";
import { SiteShell } from "@/components/layout/SiteShell";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { LangProvider } from "@/i18n/LangContext";
import type { Locale } from "@/i18n/translations";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "MK Shots",
  description: "Photography portfolio",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const store = await cookies();
  const locale = (store.get("locale")?.value === "pl" ? "pl" : "en") as Locale;

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${playfair.variable} antialiased`}>
        <ThemeProvider>
          <LangProvider initialLocale={locale}>
            <SiteShell>{children}</SiteShell>
          </LangProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
