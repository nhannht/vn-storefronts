// Root passthrough. The real <html> / <body> live in app/[locale]/layout.tsx
// so the lang attribute follows the active locale (next-intl App Router).
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
