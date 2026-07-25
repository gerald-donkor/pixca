import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

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
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <body
        className="min-h-full flex flex-col font-sans bg-[#F6F6F6] text-[#0D0D0F] selection:bg-[var(--bias-right)]/10 selection:text-[var(--bias-right)]"
        suppressHydrationWarning
      >
        <ClerkProvider dynamic appearance={{ theme: shadcn }}>
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
        </ClerkProvider>
      </body>
    </html>
  );
}
