import "./globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import clsx from "clsx";
import { Inter } from "next/font/google";
import Script from "next/script";

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
      <body className={clsx(inter.className, "bg-light-secondary")}>
        <ClerkProvider>{props.children}</ClerkProvider>
      </body>
    </html>
  );
}

// Might break because no context
