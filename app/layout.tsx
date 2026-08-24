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

export const metadata: Metadata = {
  title: "Pixca News — Balanced news coverage, powered by AI",
  description: "Get multiple viewpoints on top stories. Pixca is an AI-powered news aggregator.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${poppins.variable} h-full antialiased`}>
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

