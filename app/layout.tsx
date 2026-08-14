import type { Metadata } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-inter-tight",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lookify — AI Fashion Photo Editor SaaS",
  description:
    "Full-stack AI fashion photo editor SaaS powered by YouCam API. Virtual try-on, makeup transfer, and beauty tools.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${interTight.variable} h-full antialiased`}
    >
      <head>
        <link
          href="https://db.onlinewebfonts.com/c/d08bafd725a4cfc309efb5a88e0b63a5?family=basis33"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-white font-[family-name:var(--font-inter-tight)] font-medium">
        {children}
      </body>
    </html>
  );
}
