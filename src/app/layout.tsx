import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tiny Trees Shop",
  description: "Tiny Trees for Happy Friends",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={jakartaSans.className}>
        {children}
      </body>
    </html>
  );
}
