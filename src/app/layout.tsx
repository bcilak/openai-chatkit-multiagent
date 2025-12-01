import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ChatKit Dashboard - AI Chat Bot Manager",
  description: "Manage and deploy AI chat bots for your websites with OpenAI ChatKit",
  keywords: ["chatbot", "AI", "OpenAI", "ChatKit", "customer support"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Polyfill for crypto.randomUUID - MUST run before any other scripts */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof crypto === 'undefined') {
                  window.crypto = {};
                }
                if (!crypto.randomUUID) {
                  crypto.randomUUID = function() {
                    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                      return v.toString(16);
                    });
                  };
                }
                if (!crypto.getRandomValues) {
                  crypto.getRandomValues = function(array) {
                    for (var i = 0; i < array.length; i++) {
                      array[i] = Math.floor(Math.random() * 256);
                    }
                    return array;
                  };
                }
              })();
            `,
          }}
        />
        <script
          src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js"
          async
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
