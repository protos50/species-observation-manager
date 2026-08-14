"use client";

import React, { useState } from "react";
import { Observation } from "./Columns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDateLocal } from "@/lib/utils/dateUtils";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText,
  Leaf,
  AlertTriangle,
  Info,
  Users,
  Beaker,
  PawPrint,
  MapPin,
  Thermometer,
  Droplets,
  CloudRain,
  Edit,
  User,
  Calendar,
  Bug,
} from "lucide-react";

interface ObservationFullDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  observation: Observation | null;
}

export function ObservationFullDetailsDialog({
  open,
  onClose,
  observation,
}: ObservationFullDetailsDialogProps) {
  const o = observation;
  const [isEditingIdentification, setIsEditingIdentification] = useState(false);

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? onClose() : null)}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-2xl font-bold">
            Detalles Completos de la Observación
          </DialogTitle>
        </DialogHeader>

        <Separator />

        {o && (
          <ScrollArea className="h-[calc(90vh-8rem)] px-6 pb-6">
            <div className="space-y-5">
              {/* Información General */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Info className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">Información General</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">ID Observación</p>
                      <p className="text-base font-mono">#{o.id_observation}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Fecha de Colecta</p>
                      <p className="text-base">
                        {formatDateLocal(o.collection.collection_date, 'es-AR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Personas */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold">Personas</h3>
                  </div>
                  <div className="space-y-4">
                    {/* Colector */}
                    {o.collection.person && (
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-purple-600" />
                          <p className="text-sm font-semibold text-purple-800 uppercase tracking-wider">Colector</p>
                        </div>
                        <p className="text-base font-medium text-slate-900">
                          {`${o.collection.person.person_name} ${o.collection.person.person_lastname}`}
                        </p>
                      </div>
                    )}
                    
                    {/* Identificador con botón de edición */}
                    <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-indigo-600" />
                          <p className="text-sm font-semibold text-indigo-800 uppercase tracking-wider">Identificador</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="cursor-pointer"
                          onClick={() => setIsEditingIdentification(true)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Actualizar
                        </Button>
                      </div>
                      {o.identifier ? (
                        <div>
                          <p className="text-base font-medium text-slate-900">
                            {`${o.identifier.person_name} ${o.identifier.person_lastname}`}
                          </p>
                          {o.identification_date && (
                            <div className="flex items-center gap-2 mt-2 text-sm text-slate-600">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {formatDateLocal(o.identification_date, 'es-AR', {
                                  day: '2-digit',
                                  month: 'long',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500 italic">Sin identificar</p>
                      )}
                    </div>
                    
                    {/* Confirmador */}
                    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-green-600" />
                        <p className="text-sm font-semibold text-green-800 uppercase tracking-wider">Confirmador</p>
                      </div>
                      {o.confirmer ? (
                        <div>
                          <p className="text-base font-medium text-slate-900">
                            {`${o.confirmer.person_name} ${o.confirmer.person_lastname}`}
                          </p>
                          {o.confirmation_date && (
                            <div className="flex items-center gap-2 mt-2 text-sm text-slate-600">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {formatDateLocal(o.confirmation_date, 'es-AR', {
                                  day: '2-digit',
                                  month: 'long',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500 italic">Sin confirmar</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Datos de Colección */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Beaker className="h-5 w-5 text-cyan-600" />
                    <h3 className="text-lg font-semibold">Datos de Colección</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {o.collection.preservation_method && (
                      <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-100">
                        <p className="text-xs font-medium text-cyan-700 uppercase mb-1">Método de Preservación</p>
                        <p className="text-sm font-semibold text-slate-900">{o.collection.preservation_method.method_name}</p>
                      </div>
                    )}
                    {o.collection.trap && (
                      <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-100">
                        <div className="flex items-center gap-2 mb-1">
                          <PawPrint className="h-3 w-3 text-cyan-600" />
                          <p className="text-xs font-medium text-cyan-700 uppercase">Tipo de Trampa</p>
                        </div>
                        <p className="text-sm font-semibold text-slate-900">{o.collection.trap.trap_name}</p>
                      </div>
                    )}
                    {o.collection.trap_number != null && (
                      <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-100">
                        <p className="text-xs font-medium text-cyan-700 uppercase mb-1">Número de Trampa</p>
                        <p className="text-sm font-semibold text-slate-900">#{o.collection.trap_number}</p>
                      </div>
                    )}
                    
                    {/* Datos de Especímenes */}
                    <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-100">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="h-3 w-3 text-cyan-600" />
                        <p className="text-xs font-medium text-cyan-700 uppercase">Abundancia</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">
                        {o.abundance != null ? `${o.abundance} ${o.abundance === 1 ? 'individuo' : 'individuos'}` : 'No especificada'}
                      </p>
                    </div>
                    
                    <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-100">
                      <div className="flex items-center gap-2 mb-1">
                        <Bug className="h-3 w-3 text-cyan-600" />
                        <p className="text-xs font-medium text-cyan-700 uppercase">Casta</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">
                        {o.caste ? o.caste.caste_name : 'No especificada'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notas Biológicas */}
              {o.biology_notes && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Leaf className="h-5 w-5 text-green-600" />
                      <h3 className="text-lg font-semibold">Notas Biológicas</h3>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <p className="text-slate-700 whitespace-pre-wrap">{o.biology_notes}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Observaciones Generales */}
              {o.general_observations && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold">Observaciones Generales</h3>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <p className="text-slate-700 whitespace-pre-wrap">{o.general_observations}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Estado de Conservación */}
              {o.conservation_status && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                      <h3 className="text-lg font-semibold">Estado de Conservación</h3>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                      <p className="text-slate-700 font-medium">{o.conservation_status}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Datos Climáticos Completos */}
              {o.climate_data && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Thermometer className="h-5 w-5 text-sky-600" />
                      <h3 className="text-lg font-semibold">Datos Climáticos Completos</h3>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Temperatura */}
                      <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-100">
                        <div className="flex items-center gap-2 mb-3">
                          <Thermometer className="h-4 w-4 text-orange-600" />
                          <p className="font-semibold text-orange-800">Temperatura (°C)</p>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          {o.climate_data.t_min != null && (
                            <div className="bg-white p-3 rounded border border-orange-100">
                              <p className="text-xs text-orange-600 font-medium uppercase">Mínima</p>
                              <p className="text-lg font-bold text-slate-900">{o.climate_data.t_min.toFixed(1)}°C</p>
                            </div>
                          )}
                          {o.climate_data.t_med != null && (
                            <div className="bg-white p-3 rounded border border-orange-100">
                              <p className="text-xs text-orange-600 font-medium uppercase">Media</p>
                              <p className="text-lg font-bold text-slate-900">{o.climate_data.t_med.toFixed(1)}°C</p>
                            </div>
                          )}
                          {o.climate_data.t_max != null && (
                            <div className="bg-white p-3 rounded border border-orange-100">
                              <p className="text-xs text-orange-600 font-medium uppercase">Máxima</p>
                              <p className="text-lg font-bold text-slate-900">{o.climate_data.t_max.toFixed(1)}°C</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Humedad Relativa */}
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                        <div className="flex items-center gap-2 mb-3">
                          <Droplets className="h-4 w-4 text-blue-600" />
                          <p className="font-semibold text-blue-800">Humedad Relativa (%)</p>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          {o.climate_data.hr_min != null && (
                            <div className="bg-white p-3 rounded border border-blue-100">
                              <p className="text-xs text-blue-600 font-medium uppercase">Mínima</p>
                              <p className="text-lg font-bold text-slate-900">{o.climate_data.hr_min.toFixed(1)}%</p>
                            </div>
                          )}
                          {o.climate_data.hr_med != null && (
                            <div className="bg-white p-3 rounded border border-blue-100">
                              <p className="text-xs text-blue-600 font-medium uppercase">Media</p>
                              <p className="text-lg font-bold text-slate-900">{o.climate_data.hr_med.toFixed(1)}%</p>
                            </div>
                          )}
                          {o.climate_data.hr_max != null && (
                            <div className="bg-white p-3 rounded border border-blue-100">
                              <p className="text-xs text-blue-600 font-medium uppercase">Máxima</p>
                              <p className="text-lg font-bold text-slate-900">{o.climate_data.hr_max.toFixed(1)}%</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Precipitaciones */}
                      <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                        <div className="flex items-center gap-2 mb-3">
                          <CloudRain className="h-4 w-4 text-indigo-600" />
                          <p className="font-semibold text-indigo-800">Precipitaciones Acumuladas (mm)</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {o.climate_data.pp_14_days_before != null && (
                            <div className="bg-white p-3 rounded border border-indigo-100">
                              <p className="text-xs text-indigo-600 font-medium uppercase">14 días antes</p>
                              <p className="text-lg font-bold text-slate-900">{o.climate_data.pp_14_days_before.toFixed(1)} mm</p>
                            </div>
                          )}
                          {o.climate_data.pp_30_days_before != null && (
                            <div className="bg-white p-3 rounded border border-indigo-100">
                              <p className="text-xs text-indigo-600 font-medium uppercase">30 días antes</p>
                              <p className="text-lg font-bold text-slate-900">{o.climate_data.pp_30_days_before.toFixed(1)} mm</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Geolocalización Completa */}
              {o.geolocation && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="h-5 w-5 text-emerald-600" />
                      <h3 className="text-lg font-semibold">Geolocalización</h3>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Coordenadas y Localidad */}
                      <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                        <div className="flex items-center gap-2 mb-3">
                          <MapPin className="h-4 w-4 text-emerald-600" />
                          <p className="font-semibold text-emerald-800">Coordenadas y Localidad</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-emerald-600 font-medium uppercase mb-1">Coordenadas</p>
                            <p className="text-lg font-mono font-bold text-slate-900">
                              {o.geolocation.latitude.toFixed(6)}, {o.geolocation.longitude.toFixed(6)}
                            </p>
                            {o.geolocation.altitude && (
                              <p className="text-sm text-slate-600 mt-1">Altitud: {o.geolocation.altitude} m</p>
                            )}
                            {o.geolocation.tag && (
                              <div className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-700 border border-emerald-100 bg-white rounded-full px-2 py-0.5">
                                <span className="font-semibold uppercase tracking-wider">Tag</span>
                                <span className="font-medium text-emerald-900">{o.geolocation.tag}</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-xs text-emerald-600 font-medium uppercase mb-1">Localidad</p>
                            <p className="text-base font-semibold text-slate-900">
                              {o.geolocation.locality.locality_name}
                            </p>
                            <p className="text-sm text-slate-600">
                              {[
                                o.geolocation.locality.department?.department_name,
                                o.geolocation.locality.department?.province?.province_name,
                                o.geolocation.locality.department?.province?.country?.country_name,
                              ]
                                .filter(Boolean)
                                .join(", ")}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <p className="text-xs text-emerald-600 font-medium uppercase mb-1">Fuente</p>
                          <p className="text-sm text-slate-700">{o.geolocation.source_type}</p>
                        </div>
                      </div>

                      {/* Datos Extendidos */}
                      {(o.geolocation.ihh != null || o.geolocation.distance_to_river != null) && (
                        <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                          <div className="flex items-center gap-2 mb-3">
                            <MapPin className="h-4 w-4 text-emerald-600" />
                            <p className="font-semibold text-emerald-800">Datos de Geolocalización Extendidos</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            {o.geolocation.ihh != null && (
                              <div>
                                <p className="text-xs text-emerald-600 font-medium uppercase mb-1">IHH (Índice de Huella Humana)</p>
                                <p className="text-2xl font-bold text-slate-900">{o.geolocation.ihh}</p>
                              </div>
                            )}
                            {o.geolocation.distance_to_river != null && (
                              <div>
                                <p className="text-xs text-emerald-600 font-medium uppercase mb-1">Distancia al río</p>
                                <p className="text-2xl font-bold text-slate-900">{o.geolocation.distance_to_river.toFixed(2)} m</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ObservationFullDetailsDialog;
