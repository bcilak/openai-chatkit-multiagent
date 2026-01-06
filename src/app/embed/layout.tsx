import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ChatKit Embed",
  description: "AI Chat Bot Widget",
};

export default function EmbedLayout({
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
      <body style={{ margin: 0, padding: 0, background: 'transparent' }}>
        {children}
      </body>
    </html>
  );
}
