import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/navigation/navbar";
import { SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/navigation/app-sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Pogled",
  description: "Aplikacija za praćenje gledanja i preporuku filmova",
  icons: {
    icon: "/pogled_logo.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="hr" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/opendyslexic@1.0.3/opendyslexic.css"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-blue-500 text-white p-2 z-50"
        >
          Preskoči na glavni sadržaj
        </a>
        <Providers>
          <AppSidebar />

          <SidebarInset>
            <Navbar />

            <main
              id="main-content"
              className="mx-auto max-w-7xl p-2 sm:p-6 w-full"
            >
              {children}
            </main>
          </SidebarInset>

          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
