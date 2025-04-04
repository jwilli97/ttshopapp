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
        // TODO: Add Admin Protected Route
            <div className="min-h-screen bg-zinc-900">
                {/* Navigation */}
                <nav className="bg-zinc-800 border-b border-zinc-700 shadow-lg">
                <div className="container mx-auto px-4">
                    <div className="flex items-center h-16">
                        <Image src="/tinytreelogo.png" alt="Tiny Trees Logo" width={40} height={40} />
                        <div className="ml-2 font-semibold text-3xl text-primary">Tiny Trees HQ</div>
                    </div>
                </div>
            </nav>

            {/* Department Selector */}
            <div className="bg-zinc-800/50 border-b border-zinc-700">
                <div className="container mx-auto px-4">
                    <div className="flex space-x-4 py-2">
                        {departments.map((dept) => (
                            <button
                                key={dept.id}
                                onClick={() => setCurrentDepartment(dept.id as Department)}
                                className={`px-4 py-2 rounded-md transition-all duration-200 ${
                                    currentDepartment === dept.id
                                        ? "bg-green-600 text-white shadow-lg shadow-green-500/20"
                                        : "bg-zinc-700 text-zinc-200 hover:bg-green-500 hover:text-white"
                                }`}
                            >
                                {dept.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            
            <main className="container mx-auto p-4 text-zinc-100">
                {currentDepartment === "overview" && <Overview />}
                {currentDepartment === "fulfillment" && <FulfillmentView />}
                {currentDepartment === "dispatch" && <DispatchView />}
                {currentDepartment === "support" && <SupportView />}
                {currentDepartment === "menu" && <MenuView />}
            </main>
        </div>
    );
}