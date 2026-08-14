"use client";

import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaxonomyStats } from "@/lib/api/dashboard.api";

interface TaxonomyChartProps {
  data: TaxonomyStats;
}

const chartConfig = {
  subfamilies: { label: "Subfamilias", color: "var(--chart-1)" },
  genera: { label: "Géneros", color: "var(--chart-2)" },
  species: { label: "Especies", color: "var(--chart-3)" },
};

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const media = window.matchMedia(query);
    setMatches(media.matches);
    
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

export function TaxonomyChart({ data }: TaxonomyChartProps) {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");

  const chartData = [
    {
      name: chartConfig.subfamilies.label,
      value: data.subfamilies,
      fill: chartConfig.subfamilies.color,
    },
    {
      name: chartConfig.genera.label,
      value: data.genera,
      fill: chartConfig.genera.color,
    },
    {
      name: chartConfig.species.label,
      value: data.species,
      fill: chartConfig.species.color,
    },
  ];

  // Ajustar márgenes según tamaño de pantalla
  const margin = isMobile
    ? { top: 5, right: 5, left: 5, bottom: 5 }
    : isTablet
    ? { top: 10, right: 15, left: 10, bottom: 5 }
    : { top: 10, right: 20, left: 15, bottom: 5 };

  // Truncar nombres en móvil
  const formatXAxisLabel = (label: string) => {
    if (isMobile) {
      // En móvil, usar abreviaciones o texto más corto
      const abbreviations: Record<string, string> = {
        Subfamilias: "Subfam.",
        Géneros: "Géneros",
        Especies: "Especies",
      };
      return abbreviations[label] || label;
    }
    return label;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm sm:text-base">
          Clasificación Taxonómica
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:px-4 pb-4">
        <ChartContainer
          id="taxonomy-chart"
          config={chartConfig}
          className="h-[200px] sm:h-[220px] md:h-[240px] w-full"
        >
          <BarChart data={chartData} margin={margin}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="var(--border)"
              opacity={0.3}
            />
            <XAxis 
              dataKey="name" 
              tick={{ 
                fontSize: isMobile ? 10 : isTablet ? 11 : 12,
                fill: "var(--foreground)"
              }}
              tickFormatter={formatXAxisLabel}
            />
            <YAxis 
              tick={{ 
                fontSize: isMobile ? 10 : isTablet ? 11 : 12,
                fill: "var(--foreground)"
              }}
              width={isMobile ? 40 : isTablet ? 50 : 60}
            />
            <ChartTooltip 
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-medium">
                        {payload[0].payload.name}
                      </span>
                      <span className="text-sm font-bold">
                        {payload[0].value}
                      </span>
                    </div>
                  </div>
                );
              }}
            />
            <Bar 
              dataKey="value" 
              radius={isMobile ? [2, 2, 0, 0] : [4, 4, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
