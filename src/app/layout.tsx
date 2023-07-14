import "./globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import PlausibleProvider from "next-plausible";
import { Inter } from "next/font/google";
import { ChatProvider } from "~/components/providers/ChatProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "System GPT",
  description: "AI powered habit builder",
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <PlausibleProvider domain="sapar.xyz" />
      </head>
      <body className={inter.className}>
        <ClerkProvider>
          <ChatProvider>{props.children}</ChatProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
