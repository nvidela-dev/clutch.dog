import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "clutch.dog",
  description: "Interactive coding exercises for Express and React",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
