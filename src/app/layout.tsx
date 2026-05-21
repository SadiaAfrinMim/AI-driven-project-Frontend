import type { Metadata } from "next";
import { Toaster } from "sonner";
import { ClientLayout } from "@/components/ClientLayout";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Product Suggester",
  description: "AI-powered product recommendation platform with smart discovery, polished marketplace browsing, and reviews.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ThemeProvider defaultTheme="light" storageKey="ai-product-theme">
          <ClientLayout>{children}</ClientLayout>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
