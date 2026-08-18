"use client";

import React, { useState } from "react";
import { Observation } from "./Columns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  RotateCcw,
  X,
  Hash,
  User,
  Beaker,
  Edit3,
  Trash2,
  FileText,
  Mountain,
  Navigation,
  Thermometer,
  CloudRain,
  Droplets,
  Bug,
  Users,
  BookOpen,
  Globe,
} from "lucide-react";
import { formatDateLocal } from "@/lib/utils/dateUtils";
import { Separator } from "@/components/ui/separator";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ObservationFullDetailsDialog } from "./ObservationFullDetailsDialog";
import { EditObservationDialog } from "./EditObservationDialog";
import { CanWrite } from "@/components/CanWrite";

interface ObservationDetailsSheetProps {
  open: boolean;
  onClose: () => void;
  observation: Observation | null;
  onDelete?: (id: number) => void;
  onRestore?: (id: number) => void;
}

export function ObservationDetailsSheet({
  open,
  onClose,
  observation,
  onDelete,
  onRestore,
}: ObservationDetailsSheetProps) {
  const o = observation;
  const [fullDetailsOpen, setFullDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={(v) => (!v ? onClose() : null)}>
      <SheetContent
        side="right"
        className="w-full max-w-[100vw] sm:w-[420px] md:w-[500px] lg:w-[560px] p-0 overflow-y-auto max-h-screen"
      >
        <SheetHeader>
          <VisuallyHidden>
            <SheetTitle>Detalles de la Observación</SheetTitle>
          </VisuallyHidden>
        </SheetHeader>

        {o && (
          <div className="p-2 xs:p-3 sm:p-4 space-y-2 xs:space-y-3 sm:space-y-4 bg-slate-50/30 min-h-0 max-h-[calc(100vh-2rem)] overflow-y-auto">
            {/* Información Principal */}
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-2 xs:p-3 sm:p-4 -mt-4">
                <div className="flex items-center gap-2 mb-4">
                  <Hash className="h-4 w-4 text-slate-500" />
                  <h3 className="font-medium text-slate-900">
                    Detalles de la Observación
                  </h3>
                </div>

                <div className="space-y-2 xs:space-y-3 sm:space-y-4">
                  <div className="p-2 xs:p-3 sm:p-4 bg-gradient-to-r from-blue-50/20 to-indigo-50 rounded-lg border">
                    <label className="text-xs font-medium text-blue-800 uppercase tracking-wider mb-1 block">
                      Taxón Observado
                    </label>
                    <div className="text-base sm:text-lg font-semibold text-slate-900">
                      {o.taxon.name}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-600 mt-1">
                      {o.taxon.taxonomic_level?.name || "Nivel no especificado"}
                    </div>
                    {(o.taxon.author || o.taxon.description_year) && (
                      <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-blue-100">
                        <BookOpen className="h-3 w-3 text-blue-600" />
                        <div className="text-xs text-slate-600">
                          {o.taxon.author?.author_name && (
                            <span className="font-medium">{o.taxon.author.author_name}</span>
                          )}
                          {o.taxon.description_year && (
                            <span className="ml-1">({o.taxon.description_year})</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 xs:gap-3">
                    <div className="p-1.5 xs:p-2 sm:p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <label className="text-xs font-medium text-slate-600 uppercase tracking-wider mb-1 block">
                        Identificador
                      </label>
                      <div className="text-xs sm:text-sm font-mono text-slate-700 bg-white px-2 py-1 rounded border">
                        #{o.id_observation}
                      </div>
                    </div>
                    <div className="p-1.5 xs:p-2 sm:p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <label className="text-xs font-medium text-slate-600 uppercase tracking-wider mb-1 block">
                        Fecha de Colecta
                      </label>
                      <div className="text-xs sm:text-sm font-medium text-slate-700 bg-white px-2 py-1 rounded border">
                        {formatDateLocal(o.collection.collection_date)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Localidad */}
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-2 xs:p-3 sm:p-4 -mt-4">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <h3 className="font-medium text-slate-900">Localidad</h3>
                </div>

                <div className="space-y-1.5 xs:space-y-2 sm:space-y-3">
                  <div className="p-1.5 xs:p-2 sm:p-3 bg-green-50 rounded-lg border border-green-100">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <div className="flex-1">
                        <div className="text-xs sm:text-sm font-medium text-green-800">
                          {o.geolocation?.locality.locality_name || 'Sin localidad'}
                        </div>
                        <div className="text-xs text-green-600 mt-0.5">
                          {[
                            o.geolocation?.locality.department?.department_name,
                            o.geolocation?.locality.department?.province?.province_name,
                            o.geolocation?.locality.department?.province?.country
                              ?.country_name,
                          ]
                            .filter(Boolean)
                            .join(" • ")}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ambiente/Environment */}
                  {o.environment && (
                    <div className="p-1.5 xs:p-2 sm:p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                        <div className="flex-1">
                          <label className="text-xs font-medium text-emerald-700 uppercase tracking-wider mb-0.5 block">
                            Tipo de Ambiente
                          </label>
                          <div className="text-xs sm:text-sm font-medium text-emerald-800">
                            {o.environment.environment_name}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Información de Colecta */}
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-2 xs:p-3 sm:p-4 -mt-4">
                <div className="flex items-center gap-2 mb-4">
                  <Beaker className="h-4 w-4 text-purple-600" />
                  <h3 className="font-medium text-slate-900">
                    Información de Colecta
                  </h3>
                </div>

                <div className="space-y-2 xs:space-y-3">
                  <div className="grid grid-cols-1 gap-2 xs:gap-3">
                    <div className="p-1.5 xs:p-2 sm:p-3 bg-purple-50 rounded-lg border border-purple-100">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-3 w-3 text-purple-600" />
                        <label className="text-xs font-medium text-purple-800 uppercase tracking-wider">
                          Colector
                        </label>
                      </div>
                      <div className="text-xs sm:text-sm font-medium text-slate-700">
                        {o.collection.person
                          ? `${o.collection.person.person_name} ${o.collection.person.person_lastname}`
                          : "No especificado"}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 xs:gap-3">
                      <div className="p-1.5 xs:p-2 sm:p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <label className="text-xs font-medium text-slate-600 uppercase tracking-wider mb-1 block">
                          Método
                        </label>
                        <div className="text-xs sm:text-sm text-slate-700">
                          {o.collection.preservation_method?.method_name ||
                            "No especificado"}
                        </div>
                      </div>
                      <div className="p-1.5 xs:p-2 sm:p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <label className="text-xs font-medium text-slate-600 uppercase tracking-wider mb-1 block">
                          Trampa
                        </label>
                        <div className="text-xs sm:text-sm text-slate-700">
                          {o.collection.trap?.trap_name || "No especificada"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Geolocalización */}
            {o.geolocation ? (
              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-2 xs:p-3 sm:p-4 -mt-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Navigation className="h-4 w-4 text-blue-600" />
                    <h3 className="font-medium text-slate-900">
                      Geolocalización
                    </h3>
                  </div>

                  <div className="space-y-2 xs:space-y-3">
                    <div className="p-1.5 xs:p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Globe className="h-3 w-3 text-blue-600" />
                        <label className="text-xs font-medium text-blue-800 uppercase tracking-wider">
                          Coordenadas
                        </label>
                      </div>
                      <div className="text-sm sm:text-base font-mono font-semibold text-slate-900 bg-white px-2 py-1 rounded border">
                        {o.geolocation.latitude.toFixed(6)},{" "}
                        {o.geolocation.longitude.toFixed(6)}
                      </div>
                      {o.geolocation.tag && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-blue-700">
                          <span className="font-semibold uppercase tracking-wider">Tag:</span>
                          <span className="font-medium text-blue-900">{o.geolocation.tag}</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 xs:gap-3">
                      <div className="p-1.5 xs:p-2 sm:p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <label className="text-xs font-medium text-slate-600 uppercase tracking-wider mb-1 block">
                          Fuente
                        </label>
                        <div className="text-xs sm:text-sm text-slate-700">
                          {o.geolocation.source_type}
                        </div>
                      </div>
                      {o.geolocation.altitude != null && (
                        <div className="p-1.5 xs:p-2 sm:p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <div className="flex items-center gap-1 mb-1">
                            <Mountain className="h-3 w-3 text-slate-600" />
                            <label className="text-xs font-medium text-slate-600 uppercase tracking-wider">
                              Altitud
                            </label>
                          </div>
                          <div className="text-xs sm:text-sm text-slate-700">
                            {o.geolocation.altitude} m
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-2 xs:p-3 sm:p-4 -mt-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Navigation className="h-4 w-4 text-slate-400" />
                    <h3 className="font-medium text-slate-900">
                      Geolocalización
                    </h3>
                  </div>

                  <div className="p-1.5 xs:p-2 sm:p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Estado
                      </label>
                    </div>
                    <div className="text-xs sm:text-sm text-slate-600 italic">
                      No disponible - Sin coordenadas registradas
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Información de Especímenes */}
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-2 xs:p-3 sm:p-4 -mt-4">
                <div className="flex items-center gap-2 mb-4">
                  <Bug className="h-4 w-4 text-amber-600" />
                  <h3 className="font-medium text-slate-900">
                    Información de Especímenes
                  </h3>
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 xs:gap-3">
                  <div className="p-1.5 xs:p-2 sm:p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="h-3 w-3 text-amber-600" />
                      <label className="text-xs font-medium text-amber-800 uppercase tracking-wider">
                        Abundancia
                      </label>
                    </div>
                    <div className="text-sm sm:text-base font-semibold text-slate-900">
                      {o.abundance != null ? `${o.abundance} ${o.abundance === 1 ? 'individuo' : 'individuos'}` : 'No especificada'}
                    </div>
                  </div>

                  <div className="p-1.5 xs:p-2 sm:p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Bug className="h-3 w-3 text-amber-600" />
                      <label className="text-xs font-medium text-amber-800 uppercase tracking-wider">
                        Casta
                      </label>
                    </div>
                    <div className="text-xs sm:text-sm font-medium text-slate-700">
                      {o.caste ? o.caste.caste_name : 'No especificada'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Datos Climáticos */}
            {o.climate_data && (
              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-2 xs:p-3 sm:p-4 -mt-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Thermometer className="h-4 w-4 text-sky-600" />
                    <h3 className="font-medium text-slate-900">
                      Condiciones Climáticas
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {/* Temperatura */}
                    {(o.climate_data.t_min != null || o.climate_data.t_max != null || o.climate_data.t_med != null) && (
                      <div className="p-2 xs:p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Thermometer className="h-3.5 w-3.5 text-orange-600" />
                          <label className="text-xs font-semibold text-orange-800 uppercase tracking-wider">
                            Temperatura (°C)
                          </label>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {o.climate_data.t_min != null && (
                            <div className="bg-white/70 p-2 rounded border border-orange-100">
                              <div className="text-[10px] text-orange-600 font-medium uppercase mb-0.5">Mínima</div>
                              <div className="text-sm font-bold text-slate-900">{o.climate_data.t_min.toFixed(1)}°</div>
                            </div>
                          )}
                          {o.climate_data.t_med != null && (
                            <div className="bg-white/70 p-2 rounded border border-orange-100">
                              <div className="text-[10px] text-orange-600 font-medium uppercase mb-0.5">Media</div>
                              <div className="text-sm font-bold text-slate-900">{o.climate_data.t_med.toFixed(1)}°</div>
                            </div>
                          )}
                          {o.climate_data.t_max != null && (
                            <div className="bg-white/70 p-2 rounded border border-orange-100">
                              <div className="text-[10px] text-orange-600 font-medium uppercase mb-0.5">Máxima</div>
                              <div className="text-sm font-bold text-slate-900">{o.climate_data.t_max.toFixed(1)}°</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Humedad Relativa */}
                    {(o.climate_data.hr_min != null || o.climate_data.hr_max != null || o.climate_data.hr_med != null) && (
                      <div className="p-2 xs:p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Droplets className="h-3.5 w-3.5 text-blue-600" />
                          <label className="text-xs font-semibold text-blue-800 uppercase tracking-wider">
                            Humedad Relativa (%)
                          </label>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {o.climate_data.hr_min != null && (
                            <div className="bg-white/70 p-2 rounded border border-blue-100">
                              <div className="text-[10px] text-blue-600 font-medium uppercase mb-0.5">Mínima</div>
                              <div className="text-sm font-bold text-slate-900">{o.climate_data.hr_min.toFixed(1)}%</div>
                            </div>
                          )}
                          {o.climate_data.hr_med != null && (
                            <div className="bg-white/70 p-2 rounded border border-blue-100">
                              <div className="text-[10px] text-blue-600 font-medium uppercase mb-0.5">Media</div>
                              <div className="text-sm font-bold text-slate-900">{o.climate_data.hr_med.toFixed(1)}%</div>
                            </div>
                          )}
                          {o.climate_data.hr_max != null && (
                            <div className="bg-white/70 p-2 rounded border border-blue-100">
                              <div className="text-[10px] text-blue-600 font-medium uppercase mb-0.5">Máxima</div>
                              <div className="text-sm font-bold text-slate-900">{o.climate_data.hr_max.toFixed(1)}%</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Precipitaciones */}
                    {(o.climate_data.pp_14_days_before != null || o.climate_data.pp_30_days_before != null) && (
                      <div className="p-2 xs:p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                        <div className="flex items-center gap-2 mb-2">
                          <CloudRain className="h-3.5 w-3.5 text-indigo-600" />
                          <label className="text-xs font-semibold text-indigo-800 uppercase tracking-wider">
                            Precipitaciones Acumuladas (mm)
                          </label>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {o.climate_data.pp_14_days_before != null && (
                            <div className="bg-white/70 p-2 rounded border border-indigo-100">
                              <div className="text-[10px] text-indigo-600 font-medium uppercase mb-0.5">14 días antes</div>
                              <div className="text-sm font-bold text-slate-900">{o.climate_data.pp_14_days_before.toFixed(1)} mm</div>
                            </div>
                          )}
                          {o.climate_data.pp_30_days_before != null && (
                            <div className="bg-white/70 p-2 rounded border border-indigo-100">
                              <div className="text-[10px] text-indigo-600 font-medium uppercase mb-0.5">30 días antes</div>
                              <div className="text-sm font-bold text-slate-900">{o.climate_data.pp_30_days_before.toFixed(1)} mm</div>
                            </div>
                          )}
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
                  <h3 className="font-medium text-slate-900 mb-4">Acciones</h3>

                  <div className="space-y-1 xs:space-y-1.5 sm:space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start h-10 xs:h-12 sm:h-11 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors text-xs xs:text-sm sm:text-base cursor-pointer"
                      onClick={() => setEditOpen(true)}
                    >
                      <Edit3 className="h-3 w-3 xs:h-4 xs:w-4 mr-1.5 xs:mr-2 sm:mr-3 text-slate-600" />
                      <span className="font-medium">Editar observación</span>
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-start h-10 xs:h-12 sm:h-11 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors text-xs xs:text-sm sm:text-base cursor-pointer"
                      onClick={() => setFullDetailsOpen(true)}
                    >
                      <FileText className="h-3 w-3 xs:h-4 xs:w-4 mr-1.5 xs:mr-2 sm:mr-3 text-slate-600" />
                      <span className="font-medium">Ver detalles completos</span>
                    </Button>

                    <Separator className="my-3" />

                    {onDelete && (
                      <Button
                        variant="outline"
                        className="w-full justify-start h-10 xs:h-12 sm:h-11 border-red-200 text-red-700 cursor-pointer text-xs xs:text-sm sm:text-base"
                        onClick={() => onDelete(o.id_observation)}
                      >
                        <Trash2 className="h-3 w-3 xs:h-4 xs:w-4 mr-1.5 xs:mr-2 sm:mr-3" />
                        <span className="font-medium">Eliminar observación</span>
                      </Button>
                    )}

                    {onRestore && (
                      <Button
                        variant="outline"
                        className="w-full justify-start h-10 xs:h-12 sm:h-11 border-green-200 text-green-700 cursor-pointer text-xs xs:text-sm sm:text-base"
                        onClick={() => onRestore(o.id_observation)}
                      >
                        <Trash2 className="h-3 w-3 xs:h-4 xs:w-4 mr-1.5 xs:mr-2 sm:mr-3" />
                        <span className="font-medium">Restaurar observación</span>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </CanWrite>
          </div>
        )}
      </SheetContent>

      {/* Diálogo de detalles completos */}
      <ObservationFullDetailsDialog
        open={fullDetailsOpen}
        onClose={() => setFullDetailsOpen(false)}
        observation={observation}
      />

      {/* Diálogo de edición */}
      <EditObservationDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        observation={observation}
        onSuccess={() => {
          setEditOpen(false);
          onClose();
        }}
      />
    </Sheet>
  );
}

export default ObservationDetailsSheet;
