"use client";

import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CommonSpecies } from "@/lib/api/dashboard.api";

interface CommonSpeciesChartProps {
  data: CommonSpecies[];
}

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

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

export function CommonSpeciesChart({ data }: CommonSpeciesChartProps) {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");

  // Limitar a las top 10 especies y crear chartConfig dinámico con useMemo para estabilidad
  const { topSpecies, chartConfig } = React.useMemo(() => {
    const top = data.slice(0, 10);
    const config = top.reduce(
      (cfg, item, index) => {
        const key = `species${index}`;
        cfg[key] = {
          label: item.species,
          color: COLORS[index % COLORS.length],
        };
        return cfg;
      },
      {
        value: {
          label: "Observaciones",
        },
      } as any
    );
    return { topSpecies: top, chartConfig: config };
  }, [data]);

  const chartData = topSpecies.map((item, index) => ({
    species: `species${index}`,
    value: item.count,
    fill: COLORS[index % COLORS.length],
    originalLabel: item.species,
  }));

  const truncateLabel = (label: string) => {
    if (isMobile) {
      return label.length > 12 ? `${label.substring(0, 12)}...` : label;
    }
    if (isTablet) {
      return label.length > 18 ? `${label.substring(0, 18)}...` : label;
    }
    return label.length > 25 ? `${label.substring(0, 25)}...` : label;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg lg:text-xl">
          Especies Más Comunes
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <ChartContainer
          id="common-species-chart"
          config={chartConfig}
          className="h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              left: isMobile ? 60 : isTablet ? 80 : 100,
              right: isMobile ? 5 : 10,
              top: 5,
              bottom: 5,
            }}
          >
            <YAxis
              dataKey="species"
              type="category"
              tickLine={false}
              tickMargin={isMobile ? 5 : 10}
              axisLine={false}
              width={isMobile ? 60 : isTablet ? 80 : 100}
              tick={{
                fontSize: isMobile ? 10 : isTablet ? 11 : 12,
                fill: "var(--foreground)",
              }}
              tickFormatter={(value) => {
                const item = chartData.find((d) => d.species === value);
                const label = item?.originalLabel || "";
                return truncateLabel(label);
              }}
            />
            <XAxis
              dataKey="value"
              type="number"
              hide={isMobile}
              tick={{ fontSize: isMobile ? 10 : 12 }}
            />
            <ChartTooltip
              cursor={false}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const item = payload[0].payload;
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-medium">
                          {item.originalLabel}
                        </span>
                        <span className="text-sm font-bold">{item.value}</span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="value"
              layout="vertical"
              radius={[0, isMobile ? 3 : 5, isMobile ? 3 : 5, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
