import type { Metadata } from "next";

import { Providers } from "@/components/providers";

import "./globals.css";

export const metadata: Metadata = {
  title: "Productive - Calendar + Tasks",
  description: "Modern productivity dashboard"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
