"use client";

import { useState } from "react";
import Image from "next/image";
import { Overview } from "@/components/DepartmentViews/Overview";
import { DispatchView } from "@/components/DepartmentViews/Dispatch";
import { FulfillmentView } from "@/components/DepartmentViews/Fulfillment";
import { SupportView } from "@/components/DepartmentViews/Support";
import { MenuView } from "@/components/DepartmentViews/MenuView";

type Department = "overview" | "fulfillment" | "dispatch" | "support" | "menu";

export default function AdminDashboard() {
    const [currentDepartment, setCurrentDepartment] = useState<Department>("overview");

    const departments = [
        { id: "overview", label: "Overview" },
        { id: "fulfillment", label: "Fulfillment" },
        { id: "dispatch", label: "Dispatch" },
        { id: "support", label: "Support" },
        { id: "menu", label: "Menu" },
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Navigation */}
            <nav className="bg-white shadow-md">
                <div className="container mx-auto px-4">
                    <div className="flex items-center h-16">
                        <Image src="/tinytreelogo.png" alt="Tiny Trees Logo" width={40} height={40} />
                        <div className="font-semibold ml-2 text-xl">Tiny Trees</div>
                    </div>
                </div>
            </nav>

            {/* Department Selector */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4">
                    <div className="flex space-x-4 py-2">
                        {departments.map((dept) => (
                            <button
                                key={dept.id}
                                onClick={() => setCurrentDepartment(dept.id as Department)}
                                className={`px-4 py-2 rounded-md transition-colors ${
                                    currentDepartment === dept.id
                                        ? "bg-primary text-white"
                                        : "bg-gray-100 hover:bg-gray-200"
                                }`}
                            >
                                {dept.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            
            <main className="container mx-auto p-4">
                {currentDepartment === "overview" && <Overview />}
                {currentDepartment === "fulfillment" && <FulfillmentView />}
                {currentDepartment === "dispatch" && <DispatchView />}
                {currentDepartment === "support" && <SupportView />}
                {currentDepartment === "menu" && <MenuView />}
            </main>
        </div>
    );
}