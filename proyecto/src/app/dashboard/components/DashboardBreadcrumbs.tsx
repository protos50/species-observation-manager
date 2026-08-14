"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

// Convierte "mis-observaciones" => "Mis Observaciones"
const toTitleCase = (segment: string) =>
  segment
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

export default function DashboardBreadcrumbs() {
  const pathname = usePathname();

  // Dividir la ruta en segmentos filtrando vacío y solo rutas del dashboard
  const segments = React.useMemo(() => {
    if (!pathname) return [];
    return pathname
      .split("/")
      .filter(Boolean)
      .filter((_, idx, arr) => arr[0] === "dashboard");
  }, [pathname]);

  // Si no estamos en dashboard, no mostrar nada
  if (segments.length === 0) return null;

  // Construir los items con href acumulado
  const items = segments.map((seg, index) => ({
    href: "/" + segments.slice(0, index + 1).join("/"),
    label: toTitleCase(seg),
    isLast: index === segments.length - 1,
  }));

  return (
    <Breadcrumb>
      <BreadcrumbList className="flex items-center text-xs sm:text-sm text-gray-400 font-normal">
        {items.map((item, idx) => (
          <React.Fragment key={item.href}>
            <BreadcrumbItem>
              {item.isLast ? (
                <BreadcrumbPage
                  aria-current="page"
                  className="text-gray-500 font-medium bg-transparent"
                  style={{
                    background: "none",
                    boxShadow: "none",
                  }}
                >
                  {item.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "hover:text-gray-600 transition-colors duration-150",
                      "text-gray-400 font-normal bg-transparent"
                    )}
                    style={{
                      background: "none",
                      boxShadow: "none",
                    }}
                  >
                    {item.label}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {!item.isLast && idx < items.length - 1 && (
              <BreadcrumbSeparator className="mx-1 sm:mx-2 text-gray-300" />
            )}
          </React.Fragment>
        ))}

        {/* Mostrar puntos suspensivos si hay demasiados niveles */}
        {items.length > 4 && <BreadcrumbEllipsis className="text-gray-300" />}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
