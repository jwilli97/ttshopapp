import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "@/components/ui/toaster";
// import { PostHogProvider } from "../components/PostHogProvider";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tiny Trees Farm",
  description: "Tiny Trees Farm",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={jakartaSans.className}>
        {/* <PostHogProvider> */}
          {children}
          <Toaster />
          <Analytics />
        {/* </PostHogProvider> */}
      </body>
    </html>
  );
}
