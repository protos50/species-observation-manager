"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { observationsApi } from "@/lib/api/observations";
import { SearchableSelect, SelectOption } from "@/components/SearchableSelect";
import { taxonomyApi } from "@/lib/api/taxonomy";
import { locationApi } from "@/lib/api/location";
import { collectionApi } from "@/lib/api/collection";
import { preservationApi } from "@/lib/api/preservation";
import { trapsApi } from "@/lib/api/traps";
import { castesApi } from "@/lib/api/castes";
import { geolocationApi } from "@/lib/api/geolocation";
import { createHeaders } from "@/lib/api/config";
import { CreateClimateDataDialog } from "./CreateClimateDataDialog";

const createObservationSchema = z.object({
  id_taxon: z.string().min(1, "Debe seleccionar un taxón"),
  id_person: z.string().min(1, "Debe seleccionar un colector"),
  id_preservation_method: z
    .string()
    .min(1, "Debe seleccionar un método de preservación"),
  id_trap: z.string().min(1, "Debe seleccionar una trampa"),
  collection_date: z.string().min(1, "Debe seleccionar una fecha de colecta"),
  trap_number: z.string().optional(),
  id_locality: z.string().min(1, "Debe seleccionar una localidad"),
  id_geolocation: z.string().min(1, "Debe seleccionar coordenadas"),
  abundance: z.string().optional(),
  id_caste: z.string().optional(),
  id_identifier: z.string().optional(),
  identification_date: z.string().optional(),
  id_confirmer: z.string().optional(),
  confirmation_date: z.string().optional(),
  conservation_status: z.string().optional(),
  biology_notes: z.string().optional(),
  general_observations: z.string().optional(),
});

type CreateFormValues = z.infer<typeof createObservationSchema>;

interface CreateObservationDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateObservationDialog({
  open,
  onClose,
  onSuccess,
}: CreateObservationDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [taxonOptions, setTaxonOptions] = useState<SelectOption[]>([]);
  const [localityOptions, setLocalityOptions] = useState<SelectOption[]>([]);
  const [geolocationOptions, setGeolocationOptions] = useState<SelectOption[]>(
    []
  );
  const [personOptions, setPersonOptions] = useState<SelectOption[]>([]);
  const [methodOptions, setMethodOptions] = useState<SelectOption[]>([]);
  const [trapOptions, setTrapOptions] = useState<SelectOption[]>([]);
  const [casteOptions, setCasteOptions] = useState<SelectOption[]>([]);
  const [climateData, setClimateData] = useState<any>(null);
  const [climateLoading, setClimateLoading] = useState(false);
  const [climateDialogOpen, setClimateDialogOpen] = useState(false);

  const form = useForm<CreateFormValues>({
    resolver: zodResolver(createObservationSchema),
    defaultValues: {
      id_taxon: "",
      abundance: "",
      id_caste: "",
      biology_notes: "",
      general_observations: "",
      conservation_status: "",
      id_identifier: "",
      identification_date: "",
      id_confirmer: "",
      confirmation_date: "",
      id_person: "",
      id_preservation_method: "",
      id_trap: "",
      trap_number: "",
      collection_date: "",
      id_locality: "",
      id_geolocation: "",
    },
  });

  const watchedLocality = form.watch("id_locality");
  const watchedDate = form.watch("collection_date");

  useEffect(() => {
    if (open) {
      loadInitialData();
    }
  }, [open]);

  useEffect(() => {
    if (watchedLocality) {
      loadGeolocationsByLocality(watchedLocality);
      loadClimateData(watchedLocality, watchedDate);
    } else {
      setGeolocationOptions([]);
      setClimateData(null);
    }
  }, [watchedLocality, watchedDate]);

  const loadInitialData = async () => {
    try {
      const [taxons, localities, people, methods, traps, castes] =
        await Promise.all([
          taxonomyApi.taxa.getAll(),
          locationApi.localities.getAll(),
          collectionApi.persons.getAll(),
          preservationApi.preservationMethods.getAll(),
          trapsApi.traps.getAll(),
          castesApi.castes.getAll(),
        ]);

      setTaxonOptions(
        taxons.map((t: any) => ({
          value: String(t.id_taxon),
          label: t.name,
          subtitle: t.taxonomic_level?.name || "",
        }))
      );

      setLocalityOptions(
        localities.map((l: any) => ({
          value: String(l.id_locality),
          label: l.locality_name,
          subtitle: [
            l.department?.department_name,
            l.department?.province?.province_name,
          ]
            .filter(Boolean)
            .join(", "),
        }))
      );

      setPersonOptions(
        people.map((p: any) => ({
          value: String(p.id_person),
          label: `${p.person_name} ${p.person_lastname}`,
        }))
      );

      setMethodOptions(
        methods.map((m: any) => ({
          value: String(m.id_preservation_method),
          label: m.method_name,
        }))
      );

      setTrapOptions(
        traps.map((t: any) => ({
          value: String(t.id_trap),
          label: t.trap_name,
        }))
      );

      setCasteOptions(
        castes.map((c: any) => ({
          value: String(c.id_caste),
          label: c.caste_name,
        }))
      );

      form.reset();
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Error al cargar datos iniciales");
    }
  };

  const loadGeolocationsByLocality = async (localityId: string) => {
    if (!localityId) {
      setGeolocationOptions([]);
      return;
    }

    try {
      const allGeolocations = await geolocationApi.getAll();
      const filtered = allGeolocations.filter(
        (g: any) => String(g.id_locality) === localityId
      );
      setGeolocationOptions(
        filtered.map((g: any) => {
          const coordsLabel = `Lat: ${g.latitude.toFixed(4)}, Lon: ${g.longitude.toFixed(4)}`;
          const label = g.tag ? `${coordsLabel} [${g.tag}]` : coordsLabel;
          const subtitleParts = [];
          if (g.altitude) subtitleParts.push(`Alt: ${g.altitude}m`);
          if (g.tag) subtitleParts.push(g.tag);
          
          return {
            value: String(g.id_geolocation),
            label: label,
            subtitle: subtitleParts.join(" • "),
            searchText: `${coordsLabel} ${g.tag || ""}`.toLowerCase(),
          };
        })
      );

      const currentGeolocation = form.getValues("id_geolocation");
      if (
        currentGeolocation &&
        !filtered.some(
          (g: any) => String(g.id_geolocation) === currentGeolocation
        )
      ) {
        form.setValue("id_geolocation", "");
      }
    } catch (error) {
      console.error("Error loading geolocations:", error);
      toast.error("Error al cargar coordenadas");
    }
  };

  const loadClimateData = async (localityId: string, date: string) => {
    if (!localityId || !date) {
      setClimateData(null);
      return;
    }

    setClimateLoading(true);
    try {
      // Buscar datos climáticos para esta localidad y fecha
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
      const response = await fetch(
        `${API_BASE}/climate-data/search?locality_id=${localityId}&date=${date}`,
        {
          headers: await createHeaders(),
        }
      );
      
      if (response.ok) {
        const text = await response.text();
        if (text) {
          const data = JSON.parse(text);
          setClimateData(data);
        } else {
          setClimateData(null);
        }
      } else {
        setClimateData(null);
      }
    } catch (error) {
      console.error("Error loading climate data:", error);
      setClimateData(null);
    } finally {
      setClimateLoading(false);
    }
  };

  const handleClimateDataCreated = (data: any) => {
    setClimateData(data);
    // Recargar datos climáticos
    if (watchedLocality && watchedDate) {
      loadClimateData(watchedLocality, watchedDate);
    }
  };

  const onSubmit = async (values: CreateFormValues) => {
    setIsLoading(true);

    try {
      const collectionDate = values.collection_date
        ? values.collection_date + "T12:00:00.000Z"
        : new Date().toISOString();

      let identificationDate = undefined;
      if (values.identification_date && values.identification_date.trim()) {
        try {
          identificationDate = values.identification_date + "T12:00:00.000Z";
        } catch (e) {
          identificationDate = undefined;
        }
      }

      let confirmationDate = undefined;
      if (values.confirmation_date && values.confirmation_date.trim()) {
        try {
          confirmationDate = values.confirmation_date + "T12:00:00.000Z";
        } catch (e) {
          confirmationDate = undefined;
        }
      }

      const createData = {
        id_taxon: parseInt(values.id_taxon),
        id_person: parseInt(values.id_person),
        id_preservation_method: parseInt(values.id_preservation_method),
        id_trap: parseInt(values.id_trap),
        collection_date: collectionDate,
        id_geolocation: parseInt(values.id_geolocation),
        trap_number: values.trap_number
          ? parseInt(values.trap_number)
          : undefined,
        abundance: values.abundance ? parseInt(values.abundance) : undefined,
        id_caste: values.id_caste ? parseInt(values.id_caste) : undefined,
        biology_notes: values.biology_notes?.trim() || undefined,
        general_observations: values.general_observations?.trim() || undefined,
        conservation_status: values.conservation_status?.trim() || undefined,
        id_identifier: values.id_identifier
          ? parseInt(values.id_identifier)
          : undefined,
        identification_date: identificationDate,
        id_confirmer: values.id_confirmer
          ? parseInt(values.id_confirmer)
          : undefined,
        confirmation_date: confirmationDate,
      };

      await observationsApi.createWithCollection(createData);
      toast.success("Observación creada con éxito");
      onClose();
      form.reset();
      setGeolocationOptions([]);
      onSuccess?.();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al crear observación");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      onClose();
      form.reset();
      setGeolocationOptions([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-2xl">Crear Observación</DialogTitle>
          <DialogDescription>
            Complete la información de la nueva observación. Los campos marcados
            con * son obligatorios.
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col h-full"
          >
            <ScrollArea className="h-[calc(90vh-12rem)] px-6">
              <div className="space-y-6 pb-6">
                {/* Información Principal */}
                <Card className="border-primary/30">
                  <CardHeader>
                    <CardTitle>Información Principal</CardTitle>
                    <CardDescription>
                      Taxón y datos básicos de la observación
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="id_taxon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Taxón *</FormLabel>
                          <FormControl>
                            <SearchableSelect
                              options={taxonOptions}
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder="Seleccionar taxón..."
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Datos de Colección */}
                <Card className="border-primary/30">
                  <CardHeader>
                    <CardTitle>Datos de Colección</CardTitle>
                    <CardDescription>
                      Información sobre el proceso de recolección
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="id_person"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Colector *</FormLabel>
                            <FormControl>
                              <SearchableSelect
                                options={personOptions}
                                value={field.value}
                                onValueChange={field.onChange}
                                placeholder="Seleccionar colector..."
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="collection_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha de Colecta *</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="id_preservation_method"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Método de Preservación *</FormLabel>
                            <FormControl>
                              <SearchableSelect
                                options={methodOptions}
                                value={field.value}
                                onValueChange={field.onChange}
                                placeholder="Seleccionar método..."
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="id_trap"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Trampa *</FormLabel>
                            <FormControl>
                              <SearchableSelect
                                options={trapOptions}
                                value={field.value}
                                onValueChange={field.onChange}
                                placeholder="Seleccionar trampa..."
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="trap_number"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Número de Trampa</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Ej: 5"
                                min={0}
                                {...field}
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Geolocalización */}
                <Card className="border-primary/30">
                  <CardHeader>
                    <CardTitle>Geolocalización</CardTitle>
                    <CardDescription>
                      Ubicación geográfica de la observación
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="id_locality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Localidad *</FormLabel>
                          <FormControl>
                            <SearchableSelect
                              options={localityOptions}
                              value={field.value}
                              onValueChange={(value) => {
                                field.onChange(value);
                                form.setValue("id_geolocation", "");
                              }}
                              placeholder="Seleccionar localidad..."
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="id_geolocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Coordenadas *</FormLabel>
                          <FormControl>
                            <SearchableSelect
                              options={geolocationOptions}
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder={
                                watchedLocality
                                  ? "Seleccionar coordenadas..."
                                  : "Primero seleccione una localidad"
                              }
                              disabled={isLoading || !watchedLocality}
                            />
                          </FormControl>
                          {!watchedLocality && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Seleccione una localidad para filtrar las
                              coordenadas disponibles
                            </p>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Información Adicional */}
                <Card className="border-primary/30">
                  <CardHeader>
                    <CardTitle>Información Adicional</CardTitle>
                    <CardDescription>
                      Datos complementarios opcionales sobre la observación
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="abundance"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Abundancia (individuos)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                placeholder="Ej: 5"
                                {...field}
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="id_caste"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Casta (para hormigas)</FormLabel>
                            <FormControl>
                              <SearchableSelect
                                options={casteOptions}
                                value={field.value || ""}
                                onValueChange={field.onChange}
                                placeholder="Seleccionar casta..."
                                disabled={isLoading}
                                clearable={true}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="id_identifier"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Identificador</FormLabel>
                            <FormControl>
                              <SearchableSelect
                                options={personOptions}
                                value={field.value || ""}
                                onValueChange={field.onChange}
                                placeholder="Quien identificó..."
                                disabled={isLoading}
                                clearable={true}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="identification_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha de Identificación</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="id_confirmer"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirmador</FormLabel>
                            <FormControl>
                              <SearchableSelect
                                options={personOptions}
                                value={field.value || ""}
                                onValueChange={field.onChange}
                                placeholder="Quien confirmó..."
                                disabled={isLoading}
                                clearable={true}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="confirmation_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha de Confirmación</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="conservation_status"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Estado de Conservación</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ej: ECD, EN, VU, LC, NT, DD"
                                {...field}
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Notas y Observaciones */}
                <Card className="border-primary/30">
                  <CardHeader>
                    <CardTitle>Notas y Observaciones</CardTitle>
                    <CardDescription>
                      Anotaciones y comentarios sobre la observación
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="biology_notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notas Biológicas</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Observaciones sobre comportamiento, hábitat, fenología..."
                              rows={3}
                              {...field}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="general_observations"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observaciones Generales</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Observaciones generales sobre la colecta, condiciones climáticas..."
                              rows={3}
                              {...field}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Datos Climáticos */}
                {climateLoading ? (
                  <Card className="border-sky-200 bg-sky-50">
                    <CardHeader>
                      <CardTitle className="text-sky-900">Datos Climáticos</CardTitle>
                      <CardDescription>Cargando datos climáticos...</CardDescription>
                    </CardHeader>
                  </Card>
                ) : climateData ? (
                  <Card className="border-sky-300 bg-gradient-to-r from-sky-50 to-blue-50">
                    <CardHeader>
                      <CardTitle className="text-sky-900">✅ Datos Climáticos Encontrados</CardTitle>
                      <CardDescription>
                        <div className="flex items-center gap-2">
                          <span>Datos disponibles para {watchedDate}</span>
                          {climateData.locality && (
                            <span className="bg-sky-100 text-sky-800 px-2 py-1 rounded text-xs font-medium">
                              📍 {climateData.locality.locality_name}
                            </span>
                          )}
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Temperatura */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                          🌡️ Temperatura
                        </h4>
                        <div className="grid grid-cols-3 gap-3">
                          {climateData.t_min != null && (
                            <div className="p-3 bg-white rounded border border-sky-200">
                              <p className="text-xs text-sky-600 font-medium">Mínima</p>
                              <p className="text-lg font-bold text-slate-900">{climateData.t_min.toFixed(1)}°C</p>
                            </div>
                          )}
                          {climateData.t_med != null && (
                            <div className="p-3 bg-white rounded border border-sky-200">
                              <p className="text-xs text-sky-600 font-medium">Media</p>
                              <p className="text-lg font-bold text-slate-900">{climateData.t_med.toFixed(1)}°C</p>
                            </div>
                          )}
                          {climateData.t_max != null && (
                            <div className="p-3 bg-white rounded border border-sky-200">
                              <p className="text-xs text-sky-600 font-medium">Máxima</p>
                              <p className="text-lg font-bold text-slate-900">{climateData.t_max.toFixed(1)}°C</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Humedad */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                          💧 Humedad Relativa
                        </h4>
                        <div className="grid grid-cols-3 gap-3">
                          {climateData.hr_min != null && (
                            <div className="p-3 bg-white rounded border border-sky-200">
                              <p className="text-xs text-sky-600 font-medium">Mínima</p>
                              <p className="text-lg font-bold text-slate-900">{climateData.hr_min.toFixed(1)}%</p>
                            </div>
                          )}
                          {climateData.hr_med != null && (
                            <div className="p-3 bg-white rounded border border-sky-200">
                              <p className="text-xs text-sky-600 font-medium">Media</p>
                              <p className="text-lg font-bold text-slate-900">{climateData.hr_med.toFixed(1)}%</p>
                            </div>
                          )}
                          {climateData.hr_max != null && (
                            <div className="p-3 bg-white rounded border border-sky-200">
                              <p className="text-xs text-sky-600 font-medium">Máxima</p>
                              <p className="text-lg font-bold text-slate-900">{climateData.hr_max.toFixed(1)}%</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Precipitaciones */}
                      {(climateData.pp_14_days_before != null || climateData.pp_30_days_before != null) && (
                        <div>
                          <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                            🌧️ Precipitaciones Acumuladas
                          </h4>
                          <div className="grid grid-cols-2 gap-3">
                            {climateData.pp_14_days_before != null && (
                              <div className="p-3 bg-white rounded border border-sky-200">
                                <p className="text-xs text-sky-600 font-medium">14 días antes</p>
                                <p className="text-lg font-bold text-slate-900">{climateData.pp_14_days_before.toFixed(1)} mm</p>
                              </div>
                            )}
                            {climateData.pp_30_days_before != null && (
                              <div className="p-3 bg-white rounded border border-sky-200">
                                <p className="text-xs text-sky-600 font-medium">30 días antes</p>
                                <p className="text-lg font-bold text-slate-900">{climateData.pp_30_days_before.toFixed(1)} mm</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : watchedLocality && watchedDate ? (
                  <Card className="border-amber-200 bg-amber-50">
                    <CardHeader>
                      <CardTitle className="text-amber-900">⚠️ Sin Datos Climáticos</CardTitle>
                      <CardDescription>
                        No hay datos climáticos disponibles para {watchedDate} en esta localidad.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setClimateDialogOpen(true)}
                        disabled={isLoading}
                        className="w-full border-amber-400 text-amber-900 hover:bg-amber-100"
                      >
                        🌡️ Crear Datos Climáticos
                      </Button>
                    </CardContent>
                  </Card>
                ) : null}
              </div>
            </ScrollArea>

            <Separator />

            <DialogFooter className="px-6 py-4 ">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
                className="cursor-pointer -mt-2"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="cursor-pointer -mt-2"
              >
                {isLoading ? "Guardando..." : "Crear Observación"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>

      {/* Diálogo para crear datos climáticos */}
      <CreateClimateDataDialog
        open={climateDialogOpen}
        onClose={() => setClimateDialogOpen(false)}
        onSuccess={handleClimateDataCreated}
        localityId={watchedLocality}
        date={watchedDate}
        localityName={
          localityOptions.find((l) => l.value === watchedLocality)?.label
        }
      />
    </Dialog>
  );
}
