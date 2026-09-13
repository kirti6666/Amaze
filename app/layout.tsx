import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";
import { getSiteSettings } from "@/lib/site-settings";
import { storefrontAppearance } from "@/components/storefront/appearance";

// Three type roles: Archivo for headlines (industrial, tightens well at scale),
// Instrument Sans for body, IBM Plex Mono for every dose figure and batch
// number — measured data should never be set in the same face as marketing prose.
//
// Self-hosted rather than next/font/google. The Google loader fetches over the
// network at build time, which fails behind proxies, VPNs and antivirus TLS
// inspection, and silently drops the whole site to system fonts. These files
// live in app/fonts, so the build is deterministic and works offline. It's also
// the better production setup: no third-party request on page load, one less
// origin to connect to, and no visitor IPs sent to Google (which is what got
// Google Fonts ruled a GDPR problem in the EU).
//
// Archivo and Instrument Sans are variable fonts — one file covers the whole
// weight range, so 600/700/800 all render from a single 35KB download.
const display = localFont({
  src: "./fonts/archivo-variable.woff2",
  weight: "100 900",
  style: "normal",
  variable: "--font-display",
  display: "swap",
  // Metrics from the real face, so the fallback occupies near-identical space
  // and the swap doesn't shift the layout.
  fallback: ["system-ui", "-apple-system", "Segoe UI", "Arial", "sans-serif"],
  adjustFontFallback: "Arial",
});
const body = localFont({
  src: "./fonts/instrument-sans-variable.woff2",
  weight: "400 700",
  style: "normal",
  variable: "--font-body",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "Arial", "sans-serif"],
  adjustFontFallback: "Arial",
});
const mono = localFont({
  // Plex Mono has no variable release, so the three weights in use ship as
  // separate static files.
  src: [
    { path: "./fonts/ibm-plex-mono-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ibm-plex-mono-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/ibm-plex-mono-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-mono",
  display: "swap",
  fallback: ["ui-monospace", "SFMono-Regular", "Consolas", "monospace"],
});

// Metadata is now generated from the admin-editable Site Settings (SEO tab +
// branding favicon) instead of being hardcoded.
export async function generateMetadata(): Promise<Metadata> {
  const settings = storefrontAppearance(await getSiteSettings());
  
  return {
    title: settings.seo.metaTitle || settings.brand.storeName,
    description: settings.seo.metaDescription,
    icons: settings.brand.faviconUrl ? { icon: settings.brand.faviconUrl } : undefined,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = storefrontAppearance(await getSiteSettings());

  // Inject the admin-chosen theme colours as CSS variables. Every Tailwind
  // colour token resolves to one of these (see tailwind.config.ts), so the
  // whole palette is editable from Site Settings without a deploy.
  const t = settings.theme;
  const themeVars = `:root{--primary:${t.primaryColor};--primary-foreground:${t.primaryForeground};--background:${t.backgroundColor};--surface:${t.surfaceColor};--foreground:${t.foregroundColor};--muted:${t.mutedColor};--border:${t.borderColor};--accent:${t.accentColor};}`;

  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeVars }} />
      </head>
      <body className="min-h-screen font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
