import type { Metadata } from "next";
import { Epilogue, Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

const epilogue = Epilogue({
  variable: "--font-headline",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Northstar Studio | Redefining Digital Horizons",
  description:
    "Northstar Studio bridges imagination and execution through premium UI/UX, web development, branding, and digital growth strategy.",
  keywords: [
    "design agency",
    "UI UX design",
    "web development",
    "branding",
    "digital marketing",
    "Next.js portfolio",
  ],
  openGraph: {
    title: "Northstar Studio | Redefining Digital Horizons",
    description:
      "A modern, responsive agency homepage inspired by Stich AI direction and built with Next.js App Router.",
    type: "website",
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
      className={`scroll-smooth ${manrope.variable} ${epilogue.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
