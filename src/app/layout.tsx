import type { Metadata, Viewport } from "next";
import "./globals.css";

// Use system font stacks instead of Google Fonts to avoid network timeouts
// The CSS variables are consumed by globals.css (@theme) for --font-display and --font-body
const fontVariables = "h-full antialiased";

export const viewport: Viewport = {
  themeColor: "#171717",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Human Unity — Streetwear",
  description: "Human Unity. Contemporary streetwear brand focused on human connection beyond borders.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Human Unity",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={fontVariables}
    >
      <body className="min-h-full flex flex-col font-body bg-surface-100 text-text-primary">
        {children}
      </body>
    </html>
  );
}
