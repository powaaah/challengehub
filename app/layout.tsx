import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://challengehub.de"),
  title: "ChallengeHub - Reach. Your. Goals.",
  description: "ChallengeHub motiviert Menschen, Ziele gemeinsam als Challenges zu erreichen.",
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "ChallengeHub",
    url: "https://challengehub.de",
    title: "ChallengeHub - Reach. Your. Goals.",
    description: "Finde Challenges, starte neue Gewohnheiten und erreiche Ziele gemeinsam."
  },
  twitter: {
    card: "summary",
    title: "ChallengeHub - Reach. Your. Goals.",
    description: "Finde Challenges, starte neue Gewohnheiten und erreiche Ziele gemeinsam."
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
