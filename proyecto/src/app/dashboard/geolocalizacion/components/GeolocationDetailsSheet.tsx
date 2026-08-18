"use client";

import React, { useState } from "react";
import { Geolocation } from "./Columns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Globe,
  Hash,
  Mountain,
  Navigation,
  Droplets,
  Edit3,
  Trash2,
  Map,
} from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { CanWrite } from "@/components/CanWrite";

interface GeolocationDetailsSheetProps {
  open: boolean;
  onClose: () => void;
  geolocation: Geolocation | null;
  onEdit?: (g: Geolocation) => void;
  onDelete?: (id: number) => void;
}

export function GeolocationDetailsSheet({
  open,
  onClose,
  geolocation,
  onEdit,
  onDelete,
}: GeolocationDetailsSheetProps) {
  const g = geolocation;

  const formatCoordinate = (value: number, isLatitude: boolean) => {
    const direction = isLatitude
      ? value >= 0
        ? "N"
        : "S"
      : value >= 0
      ? "E"
      : "O";
    return `${Math.abs(value).toFixed(6)}° ${direction}`;
  };

  return (
    <Sheet open={open} onOpenChange={(v) => (!v ? onClose() : null)}>
      <SheetContent
        side="right"
        className="w-full max-w-[100vw] sm:w-[420px] md:w-[500px] lg:w-[560px] p-0 overflow-y-auto max-h-screen"
      >
        <SheetHeader>
          <VisuallyHidden>
            <SheetTitle>Detalles de Geolocalización</SheetTitle>
          </VisuallyHidden>
        </SheetHeader>

        {g && (
          <div className="p-2 xs:p-3 sm:p-4 space-y-2 xs:space-y-3 sm:space-y-4 bg-slate-50/30 min-h-0 max-h-[calc(100vh-2rem)] overflow-y-auto">
            {/* Información Principal */}
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-2 xs:p-3 sm:p-4 -mt-4">
                <div className="flex items-center gap-2 mb-4">
                  <Hash className="h-4 w-4 text-slate-500" />
                  <h3 className="font-medium text-slate-900">
                    Detalles de Geolocalización
                  </h3>
                </div>

                <div className="space-y-2 xs:space-y-3 sm:space-y-4">
                  {/* ID */}
                  <div className="p-2 xs:p-3 sm:p-4 bg-gradient-to-r from-blue-50/20 to-indigo-50 rounded-lg border">
                    <label className="text-xs font-medium text-blue-800 uppercase tracking-wider mb-1 block">
                      ID Geolocalización
                    </label>
                    <div className="text-base sm:text-lg font-semibold text-slate-900">
                      #{g.id_geolocation}
                    </div>
                  </div>

                  {/* Coordenadas */}
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 xs:gap-3 sm:gap-4">
                    <div className="flex items-start gap-2 xs:gap-3 p-2 xs:p-3 sm:p-4 bg-slate-50 rounded-lg border">
                      <Navigation className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <label className="text-xs font-medium text-slate-600 block mb-1">
                          Latitud
                        </label>
                        <div className="text-sm font-medium text-slate-900 break-words">
                          {formatCoordinate(g.latitude, true)}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {g.latitude.toFixed(6)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 xs:gap-3 p-2 xs:p-3 sm:p-4 bg-slate-50 rounded-lg border">
                      <Navigation className="h-4 w-4 text-green-600 mt-0.5 rotate-90" />
                      <div className="flex-1 min-w-0">
                        <label className="text-xs font-medium text-slate-600 block mb-1">
                          Longitud
                        </label>
                        <div className="text-sm font-medium text-slate-900 break-words">
                          {formatCoordinate(g.longitude, false)}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {g.longitude.toFixed(6)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tag */}
                  {g.tag && (
                    <div className="flex items-start gap-2 xs:gap-3 p-2 xs:p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <Hash className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <label className="text-xs font-medium text-blue-700 block mb-1">
                          Tag
                        </label>
                        <div className="text-sm font-medium text-slate-900">
                          {g.tag}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Altitud */}
                  {g.altitude !== null && (
                    <div className="flex items-start gap-2 xs:gap-3 p-2 xs:p-3 sm:p-4 bg-slate-50 rounded-lg border">
                      <Mountain className="h-4 w-4 text-purple-600 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <label className="text-xs font-medium text-slate-600 block mb-1">
                          Altitud
                        </label>
                        <div className="text-sm font-medium text-slate-900">
                          {g.altitude} m.s.n.m.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* IHH */}
                  {g.ihh !== null && g.ihh !== undefined && (
                    <div className="flex items-start gap-2 xs:gap-3 p-2 xs:p-3 sm:p-4 bg-slate-50 rounded-lg border">
                      <Map className="h-4 w-4 text-orange-600 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <label className="text-xs font-medium text-slate-600 block mb-1">
                          IHH (Índice de Huella Humana)
                        </label>
                        <div className="text-sm font-medium text-slate-900">
                          {g.ihh}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Distancia al río */}
                  {g.distance_to_river !== null && g.distance_to_river !== undefined && (
                    <div className="flex items-start gap-2 xs:gap-3 p-2 xs:p-3 sm:p-4 bg-slate-50 rounded-lg border">
                      <Droplets className="h-4 w-4 text-cyan-600 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <label className="text-xs font-medium text-slate-600 block mb-1">
                          Distancia al Río
                        </label>
                        <div className="text-sm font-medium text-slate-900">
                          {g.distance_to_river} m
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tipo de fuente */}
                  <div className="flex items-start gap-2 xs:gap-3 p-2 xs:p-3 sm:p-4 bg-slate-50 rounded-lg border">
                    <Globe className="h-4 w-4 text-indigo-600 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <label className="text-xs font-medium text-slate-600 block mb-1">
                        Tipo de Fuente
                      </label>
                      <div className="text-sm font-medium text-slate-900">
                        {g.source_type}
                      </div>
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>

            {/* Localidad */}
            {g.locality && (
              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-2 xs:p-3 sm:p-4 -mt-4">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    <h3 className="font-medium text-slate-900">Ubicación</h3>
                  </div>

                  <div className="space-y-2 xs:space-y-3">
                    <div className="flex items-start gap-2 xs:gap-3 p-2 xs:p-3 sm:p-4 bg-slate-50 rounded-lg border">
                      <div className="flex-1 min-w-0">
                        <label className="text-xs font-medium text-slate-600 block mb-1">
                          Localidad
                        </label>
                        <div className="text-sm font-medium text-slate-900">
                          {g.locality.locality_name}
                        </div>
                      </div>
                    </div>

                    {g.locality.department && (
                      <div className="flex items-start gap-2 xs:gap-3 p-2 xs:p-3 sm:p-4 bg-slate-50 rounded-lg border">
                        <div className="flex-1 min-w-0">
                          <label className="text-xs font-medium text-slate-600 block mb-1">
                            Departamento
                          </label>
                          <div className="text-sm font-medium text-slate-900">
                            {g.locality.department.department_name}
                          </div>
                        </div>
                      </div>
                    )}

                    {g.locality.department?.province && (
                      <div className="flex items-start gap-2 xs:gap-3 p-2 xs:p-3 sm:p-4 bg-slate-50 rounded-lg border">
                        <div className="flex-1 min-w-0">
                          <label className="text-xs font-medium text-slate-600 block mb-1">
                            Provincia
                          </label>
                          <div className="text-sm font-medium text-slate-900">
                            {g.locality.department.province.province_name}
                          </div>
                        </div>
                      </div>
                    )}

                    {g.locality.department?.province?.country && (
                      <div className="flex items-start gap-2 xs:gap-3 p-2 xs:p-3 sm:p-4 bg-slate-50 rounded-lg border">
                        <div className="flex-1 min-w-0">
                          <label className="text-xs font-medium text-slate-600 block mb-1">
                            País
                          </label>
                          <div className="text-sm font-medium text-slate-900">
                            {g.locality.department.province.country.country_name}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <CanWrite>
              {/* Acciones */}
              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-2 xs:p-3 sm:p-4 -mt-4">
                  <div className="flex flex-col xs:flex-row gap-2">
                    {onEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2"
                        onClick={() => onEdit(g)}
                      >
                        <Edit3 className="h-4 w-4" />
                        Editar
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          if (
                            confirm(
                              "¿Estás seguro de que deseas eliminar esta geolocalización?"
                            )
                          ) {
                            onDelete(g.id_geolocation);
                            onClose();
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </CanWrite>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
