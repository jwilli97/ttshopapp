"use client";

import { useState } from "react";
import Image from "next/image";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarSeparator,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Home, Package, Headset, Menu as MenuIcon } from "lucide-react";
import { Overview } from "@/components/DepartmentViews/Overview";
import { DispatchView } from "@/components/DepartmentViews/Dispatch";
import { FulfillmentView } from "@/components/DepartmentViews/Fulfillment";
import { SupportView } from "@/components/DepartmentViews/Support";
import { MenuView } from "@/components/DepartmentViews/MenuView";
import EmployeeProtectedRoute from "@/components/AdminProtectedRoute";

type Department = "overview" | "fulfillment" | "support" | "menu";

export default function AdminDashboard() {
    const [currentDepartment, setCurrentDepartment] = useState<Department>("overview");

    const departments = [
        { id: "overview", label: "Overview" },
        { id: "fulfillment", label: "Orders" },
        { id: "support", label: "Support" },
        { id: "menu", label: "Menu" },
    ];

    return (
        <EmployeeProtectedRoute>
        <SidebarProvider>
            <Sidebar>
                <SidebarHeader className="flex items-center gap-2 px-4 py-4">
                    <Image src="/tinytreelogo.png" alt="Tiny Trees Logo" width={28} height={28} />
                    <span className="text-lg font-semibold text-sidebar-foreground">Tiny Trees HQ</span>
                </SidebarHeader>
                <SidebarSeparator />
                <SidebarContent className="px-2 py-4">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                onClick={() => setCurrentDepartment("overview")}
                                isActive={currentDepartment === "overview"}
                            >
                                <Home className="h-5 w-5" />
                                <span>Overview</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                onClick={() => setCurrentDepartment("fulfillment")}
                                isActive={currentDepartment === "fulfillment"}
                            >
                                <Package className="h-5 w-5" />
                                <span>Orders</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                onClick={() => setCurrentDepartment("support")}
                                isActive={currentDepartment === "support"}
                            >
                                <Headset className="h-5 w-5" />
                                <span>Support</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                onClick={() => setCurrentDepartment("menu")}
                                isActive={currentDepartment === "menu"}
                            >
                                <MenuIcon className="h-5 w-5" />
                                <span>Menu</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarContent>
                <SidebarFooter className="px-4 py-4">
                </SidebarFooter>
            </Sidebar>
            <SidebarInset className="flex flex-col min-h-screen bg-zinc-900">
                <header className="bg-zinc-800 text-white text-xl font-semibold px-6 py-4 flex items-center gap-4">
                    <SidebarTrigger className="text-white hover:text-gray-300" />
                    {departments.find(dept => dept.id === currentDepartment)?.label}
                </header>
                <section className="flex-1 p-6">
                    {currentDepartment === "overview" && <Overview />}
                    {currentDepartment === "fulfillment" && <FulfillmentView />}
                    {currentDepartment === "support" && <SupportView />}
                    {currentDepartment === "menu" && <MenuView />}
                </section>
            </SidebarInset>
        </SidebarProvider>
        </EmployeeProtectedRoute>
    );
}