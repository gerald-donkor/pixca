import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PostHogIdentify } from "@/components/posthog/identify";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Toaster } from "@/components/ui/toaster";

const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pixca.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Pixca News — Balanced news coverage, powered by AI",
    template: "%s — Pixca News",
  },
  description:
    "Get multiple viewpoints on top stories. Pixca is an AI-powered news aggregator analyzing framing, sentiment, and bias in real time.",
  openGraph: {
    title: "Pixca News — Balanced news coverage, powered by AI",
    description:
      "Get multiple viewpoints on top stories. Pixca is an AI-powered news aggregator analyzing framing, sentiment, and bias in real time.",
    url: "/",
    siteName: "Pixca News",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pixca News — Balanced news coverage, powered by AI",
    description:
      "Get multiple viewpoints on top stories. Pixca is an AI-powered news aggregator analyzing framing, sentiment, and bias in real time.",
  },
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "/rss.xml",
      "application/atom+xml": "/feed.xml",
    },
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.ico",
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Pixca News",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${poppins.variable} h-full antialiased`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('pixca-theme') || 'system';
                  var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (stored === 'dark' || (stored === 'system' && systemDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className="min-h-full flex flex-col font-sans bg-[var(--surface)] text-[var(--text-primary)] selection:bg-[var(--bias-right)]/10 selection:text-[var(--bias-right)]"
        suppressHydrationWarning
      >
        <ThemeProvider>
          <ClerkProvider dynamic appearance={{ theme: shadcn }}>
            <PostHogIdentify />
            <Header />
            <div className="flex-1">{children}</div>
            <Footer />
            <Toaster />
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

