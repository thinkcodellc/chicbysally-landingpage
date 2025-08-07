import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";
import AuthError from "@/components/AuthError";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ChicBySally - Virtual Try-On",
  description: "Discover your perfect style with virtual try-on technology",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <head>
        {/* Load local CSS via Next-safe link tags */}
        <link rel="stylesheet" href="/css/style.css" />
        <link rel="stylesheet" href="/css/page.min.css" />

        {/* Removed external Font Awesome CDN links to avoid SRI/integrity issues.
            We use react-icons for icons, so external CSS is unnecessary. */}

        {/* Load Tailwind CDN first */}
        <Script
          id="tailwind-cdn"
          src="https://cdn.tailwindcss.com?plugins=forms,typography,aspect-ratio,line-clamp"
          strategy="afterInteractive"
        />
        {/* Configure tailwind in a separate inline script without passing event handlers as props */}
        <Script id="tailwind-config" strategy="afterInteractive">
          {`
            try {
              if (typeof tailwind !== 'undefined') {
                tailwind.config = {
                  theme: {
                    extend: {
                      colors: {
                        primary: '#1e293b',
                        secondary: '#475569',
                        accent: '#f59e0b',
                        background: '#ffffff',
                        surface: '#f8fafc',
                      },
                      fontFamily: {
                        sans: ['Inter', 'system-ui', 'sans-serif'],
                      },
                    },
                  },
                };
              }
            } catch (e) {
              console.error('Tailwind config init error', e);
            }
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider session={session}>
          <AuthError />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
