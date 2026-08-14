import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RentalFinder AI",
  description: "Find your next rental and book viewings automatically.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-bg text-ink">
        {children}
      </body>
    </html>
  );
}
