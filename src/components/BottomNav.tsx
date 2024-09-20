"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Home, Image, ShoppingBag, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ReactNode
  label: string
  href: string
};

const navItems: NavItem[] = [
  { icon: <Home className="h-6 w-6" />, label: "Home", href: "/dashboard" },
  { icon: <Image className="h-6 w-6" />, label: "Gallery", href: "/Gallery" },
  { icon: <ShoppingBag className="h-6 w-6" />, label: "Orders", href: "/Order" },
  { icon: <HelpCircle className="h-6 w-6" />, label: "Support", href: "/Support" },
];

export default function BottomNav() {
  const [active, setActive] = useState("/")
  const router = useRouter();

  return (
    <footer className="fixed bottom-0 left-0 z-50 w-full h-16 bg-gray-500 border-t border-gray-500">
      <nav className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium">
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex flex-col items-center justify-center px-5 hover:bg-background group",
              active === item.href
                ? "text-accent dark:text-accent"
                : "text-gray-200 dark:text-gray-200"
            )}
            onClick={(e) => {
              e.preventDefault()
              setActive(item.href)
              router.push(item.href)
            }}
          >
            {item.icon}
            <span className="text-sm">{item.label}</span>
          </a>
        ))}
      </nav>
    </footer>
  );
};