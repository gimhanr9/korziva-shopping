import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShopFlow | Modern E-commerce Platform",
  description: "A production-minded, full-stack e-commerce web platform for small businesses.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
