import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/navbar";
import { SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Filmovi app",
  description: "Aplikacija za praćenje gledanja i preporuku filmova",
};

export default function RootLayout({ children }) {
  return (
    <html lang="hr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <AppSidebar />

          <SidebarInset>
            <Navbar />

            <main className="mx-auto max-w-7xl p-2 sm:p-6 w-full">
              {children}
            </main>
          </SidebarInset>

          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
