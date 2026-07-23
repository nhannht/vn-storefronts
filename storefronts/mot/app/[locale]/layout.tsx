import "../globals.css";
import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { getRegion } from "@/lib/region";
import { ThemeProvider } from "@/components/theme-provider";
import { CartProvider } from "@/components/cart-provider";
import { MobileMenuProvider } from "@/components/ui-state";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

// Sans (Inter) for UI, serif (Lora) for the bookish wordmark and display type.
// Both carry the vietnamese subset so diacritics render without a fallback face.
const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin", "vietnamese"],
  variable: "--font-lora",
  display: "swap",
});

// Pre-paint theme stamp. mot is a light-first paper store, so the default is a
// hard "light" and the OS setting is NOT consulted (the one intentional
// deviation from tiem-tao, which falls back to matchMedia). Night is an explicit
// opt-in stored in localStorage. Runs in <head> before body content paints, so
// there is never a wrong-theme flash.
const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark")t="light";document.documentElement.dataset.theme=t;}catch(e){}})();`;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "Mọt",
  description: "Portfolio demo bookstore. Public-domain works.",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const region = await getRegion(locale as Locale);

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${lora.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-screen flex-col">
        <NextIntlClientProvider>
          <ThemeProvider>
            <CartProvider regionId={region?.id}>
              <MobileMenuProvider>
                <Nav />
                <main className="flex-1">{children}</main>
                <Footer />
              </MobileMenuProvider>
            </CartProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
