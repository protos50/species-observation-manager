"use client";

import type React from "react";
import { AuthProvider } from "@/contexts/AuthContext";

import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";
import DashboardBreadcrumbs from "./components/DashboardBreadcrumbs";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <SidebarInset className="bg-muted">
          <header className="flex h-16 items-center px-4 gap-2">
            <SidebarTrigger className="md:hidden mr-2" />
            <div className="hidden md:block">
              <DashboardBreadcrumbs />
            </div>
          </header>

          <main>
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AuthProvider>
  );
}
