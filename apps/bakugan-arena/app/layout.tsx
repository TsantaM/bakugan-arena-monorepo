import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import TanstackProvider from "../src/providers/queryClientProvider";
import { TouchProvider } from "@/components/ui/hybrid-tooltip";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import LocaleStorageSync from "@/components/elements/language-switcher/locale-storage-sync";
import TextDirectionScope from "@/components/elements/language-switcher/text-direction-scope";
import { parseLocale } from "@/src/i18n/config";
import type { Metadata } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('common')
  return {
    title: t('brand'),
    description: t('metadata.description'),
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = parseLocale(await getLocale())
  const messages = await getMessages()

  return (
    <html lang={locale} dir="ltr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden flex flex-col`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
            <TanstackProvider>
              <TouchProvider>
                <LocaleStorageSync />
                <TextDirectionScope />
                {children}
              </TouchProvider>
            </TanstackProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
