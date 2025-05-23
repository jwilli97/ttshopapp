"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Home, Image, ShoppingBag, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ReactNode
  label: string
  href: string
};

const navItems: NavItem[] = [
  { icon: <Home className="h-6 w-6" />, label: "Home", href: "/dashboard" },
  { icon: <Image className="h-6 w-6" />, label: "Gallery", href: "/gallery" },
  { icon: <ShoppingBag className="h-6 w-6" />, label: "Orders", href: "/Order/Confirmation" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <footer className="fixed bottom-0 left-0 z-50 w-full h-16 bg-[#FFFDD0]">
      <div className="container bg-[#cbd5e1]/25 h-0.5 w-full md:w-11/12 rounded-full"></div>
      <nav className="grid h-full max-w-lg grid-cols-3 mx-auto font-medium">
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex flex-col items-center justify-center px-5 group rounded-lg text-background",
              pathname === item.href
                ? "font-bold"
                : "font-normal hover:bg-background/10"
            )}
            onClick={(e) => {
              e.preventDefault()
              router.push(item.href)
            }}
          >
            {item.icon}
            <span className={cn(
              "text-sm text-background",
              pathname === item.href ? "font-bold" : "font-normal"
            )}>{item.label}</span>
          </a>
        ))}
      </nav>
    </footer>
  );
}