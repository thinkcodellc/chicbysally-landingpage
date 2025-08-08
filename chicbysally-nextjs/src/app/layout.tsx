import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
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
  title: "ChicBySally | UGC Content Creator for Fashion Brands",
  description: "Discover your perfect style with virtual try-on technologyElevate your brand with ChicBySally. Specializing in high-quality UGC, brand collaborations, and content creation for fashion, beauty, and lifestyle brands on Instagram, TikTok, and YouTube.",
  keywords: ["ChicBySally","UGC creator", "fashion content","brand collaboration", "TikTok creator", "Instagram reels", "UGC for beauty brands", "YouTube content creator", "virtual try-on", "fashion influencer", "lifestyle content", "high-quality UGC", "fashion marketing", "brand partnerships", "content creation", "social media marketing" ]
  };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: { colorPrimary: '#f59e0b' },
        elements: {
          formButtonPrimary: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5'
        }
      }}
    >
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
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
