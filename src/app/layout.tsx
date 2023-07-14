import "./globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import Script from "next/script";
import { ChatProvider } from "~/components/providers/ChatProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "System GPT",
  description: "AI powered habit builder",
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <Script
        defer
        data-domain="sapar.xyz"
        src="https://plausible.io/js/script.js"
      />
      <body className={inter.className}>
        <ClerkProvider>
          <ChatProvider>{props.children}</ChatProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
