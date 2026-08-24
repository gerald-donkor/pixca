import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saved Articles",
  description: "Your personal library of bookmarked stories and intelligence analyses.",
  openGraph: {
    title: "Saved Articles — Pixca News",
    description: "Your personal library of bookmarked stories and intelligence analyses.",
    url: "/saved",
    type: "website",
    siteName: "Pixca News",
  },
  twitter: {
    card: "summary_large_image",
    title: "Saved Articles — Pixca News",
    description: "Your personal library of bookmarked stories and intelligence analyses.",
  },
};

export default function SavedArticlesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
