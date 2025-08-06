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

        {/* Load Font Awesome CSS (brands + solid) early in head */}
        <link
          rel="preconnect"
          href="https://cdnjs.cloudflare.com"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/fontawesome.min.css"
          integrity="sha512-+aHh2tQvT8E7n2k8L8CwYw7S8m8k7xjK5d7Qb2fXk6BvFh1m8xN2Yt4t9b9vV9yQ1Ih3n2v6kQYQq8a8QJ4QHg=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/brands.min.css"
          integrity="sha512-WF8nQ6oY0G6k9IuQmYwq8mJw3o8TjK2oQeHj6rK8wz8n8Y2xP7g+Qe1zvL9jvJb6C5kqC6q3+Jm4r1iD8lixxw=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/solid.min.css"
          integrity="sha512-gQx0n0Cq7X5mJ4y4D6FvY0H1l6uM6sJ6l8WqkXl1N8m6wN2zK9qVn4Kz8lJqJk3L2jYh3rQv2x9m8xQyq1wz7g=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />

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
