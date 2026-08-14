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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createHeaders } from "@/lib/api/config";

// Validador para números decimales con conversión de coma a punto
const numericString = (fieldName: string, min?: number, max?: number) =>
  z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true;
        // Convertir coma a punto y validar
        const normalized = val.replace(",", ".");
        const num = parseFloat(normalized);
        return !isNaN(num);
      },
      { message: `${fieldName} debe ser un número válido` }
    )
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true;
        if (min !== undefined) {
          const normalized = val.replace(",", ".");
          const num = parseFloat(normalized);
          return num >= min;
        }
        return true;
      },
      { message: `${fieldName} debe ser mayor o igual a ${min}` }
    )
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true;
        if (max !== undefined) {
          const normalized = val.replace(",", ".");
          const num = parseFloat(normalized);
          return num <= max;
        }
        return true;
      },
      { message: `${fieldName} debe ser menor o igual a ${max}` }
    );

const climateDataSchema = z
  .object({
    id_locality: z.string().optional(),
    climate_date: z.string().optional(),
    t_min: numericString("Temperatura mínima", -50, 60),
    t_max: numericString("Temperatura máxima", -50, 60),
    t_med: numericString("Temperatura media", -50, 60),
    hr_min: numericString("Humedad mínima", 0, 100),
    hr_max: numericString("Humedad máxima", 0, 100),
    hr_med: numericString("Humedad media", 0, 100),
    pp_14_days_before: numericString("Precipitación 14 días", 0, 10000),
    pp_30_days_before: numericString("Precipitación 30 días", 0, 10000),
  })
  .refine(
    (data) => {
      // Validar que t_min <= t_med <= t_max si existen
      const tMin = data.t_min ? parseFloat(data.t_min.replace(",", ".")) : null;
      const tMed = data.t_med ? parseFloat(data.t_med.replace(",", ".")) : null;
      const tMax = data.t_max ? parseFloat(data.t_max.replace(",", ".")) : null;

      if (tMin !== null && tMed !== null && tMin > tMed) return false;
      if (tMed !== null && tMax !== null && tMed > tMax) return false;
      if (tMin !== null && tMax !== null && tMin > tMax) return false;

      return true;
    },
    {
      message: "Las temperaturas deben cumplir: mínima ≤ media ≤ máxima",
      path: ["t_med"],
    }
  )
  .refine(
    (data) => {
      // Validar que hr_min <= hr_med <= hr_max si existen
      const hrMin = data.hr_min
        ? parseFloat(data.hr_min.replace(",", "."))
        : null;
      const hrMed = data.hr_med
        ? parseFloat(data.hr_med.replace(",", "."))
        : null;
      const hrMax = data.hr_max
        ? parseFloat(data.hr_max.replace(",", "."))
        : null;

      if (hrMin !== null && hrMed !== null && hrMin > hrMed) return false;
      if (hrMed !== null && hrMax !== null && hrMed > hrMax) return false;
      if (hrMin !== null && hrMax !== null && hrMin > hrMax) return false;

      return true;
    },
    {
      message: "La humedad debe cumplir: mínima ≤ media ≤ máxima",
      path: ["hr_med"],
    }
  );

type ClimateFormValues = z.infer<typeof climateDataSchema>;

interface CreateClimateDataDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (data: any) => void;
  localityId?: string;
  date?: string;
  localityName?: string;
}

interface Locality {
  id_locality: number;
  locality_name: string;
  department?: {
    department_name: string;
    province?: {
      province_name: string;
    };
  };
}

export function CreateClimateDataDialog({
  open,
  onClose,
  onSuccess,
  localityId,
  date,
  localityName,
}: CreateClimateDataDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [localities, setLocalities] = useState<Locality[]>([]);

  const form = useForm<ClimateFormValues>({
    resolver: zodResolver(climateDataSchema),
    defaultValues: {
      id_locality: localityId || "",
      climate_date: date || "",
      t_min: "",
      t_max: "",
      t_med: "",
      hr_min: "",
      hr_max: "",
      hr_med: "",
      pp_14_days_before: "",
      pp_30_days_before: "",
    },
  });

  // Cargar localidades y rellenar formulario
  useEffect(() => {
    if (open) {
      loadLocalities();
      // Resetear a valores vacíos en modo creación
      form.reset({
        id_locality: localityId || "",
        climate_date: date || "",
        t_min: "",
        t_max: "",
        t_med: "",
        hr_min: "",
        hr_max: "",
        hr_med: "",
        pp_14_days_before: "",
        pp_30_days_before: "",
      });
    }
  }, [open, localityId, date, form]);

  const loadLocalities = async () => {
    try {
      const API_BASE =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
      const response = await fetch(`${API_BASE}/locality`, {
        headers: await createHeaders(),
      });

      if (!response.ok) throw new Error("Error al cargar localidades");

      const data = await response.json();
      setLocalities(data);
    } catch (error) {
      console.error("Error loading localities:", error);
      toast.error("Error al cargar localidades");
    }
  };

  const onSubmit = async (values: ClimateFormValues) => {
    setIsLoading(true);

    try {
      // Normalizar valores: convertir coma a punto antes de parsear
      const normalizeNumber = (val?: string) => {
        if (!val || val.trim() === "") return undefined;
        return parseFloat(val.replace(",", "."));
      };

      const payload: any = {
        t_min: normalizeNumber(values.t_min),
        t_max: normalizeNumber(values.t_max),
        t_med: normalizeNumber(values.t_med),
        hr_min: normalizeNumber(values.hr_min),
        hr_max: normalizeNumber(values.hr_max),
        hr_med: normalizeNumber(values.hr_med),
        pp_14_days_before: normalizeNumber(values.pp_14_days_before),
        pp_30_days_before: normalizeNumber(values.pp_30_days_before),
      };

      // Agregar localityId y climate_date
      const idLocality = values.id_locality || localityId;
      const climateDate = values.climate_date || date;

      if (!idLocality || !climateDate) {
        toast.error("Debe seleccionar una localidad y una fecha");
        setIsLoading(false);
        return;
      }

      payload.id_locality = parseInt(idLocality);
      payload.climate_date = climateDate + "T12:00:00.000Z";

      const API_BASE =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
      const response = await fetch(`${API_BASE}/climate-data`, {
        method: "POST",
        headers: await createHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API Error:", errorData);
        throw new Error(errorData.message || "Error al crear datos climáticos");
      }

      const createdData = await response.json();
      toast.success("Datos climáticos creados con éxito");
      onClose();
      form.reset();
      onSuccess?.(createdData);
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al crear datos climáticos"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      onClose();
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-2xl">Crear Datos Climáticos</DialogTitle>
          <DialogDescription>
            Ingrese los datos climáticos para {localityName || "la localidad"}{" "}
            el {date}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col"
          >
            <div className="px-6 py-4 space-y-4">
              {/* Localidad y Fecha */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                <FormField
                  control={form.control}
                  name="id_locality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Localidad *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una localidad" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {localities.map((locality) => (
                            <SelectItem
                              key={locality.id_locality}
                              value={locality.id_locality.toString()}
                            >
                              {locality.locality_name}
                              {locality.department &&
                                ` - ${locality.department.department_name}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="climate_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Temperatura */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-slate-700">
                  Temperatura (°C)
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <FormField
                    control={form.control}
                    name="t_min"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mínima</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            inputMode="decimal"
                            placeholder="Ej: 15.5 o 15,5"
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
                    name="t_med"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Media</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            inputMode="decimal"
                            placeholder="Ej: 22.0 o 22,0"
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
                    name="t_max"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Máxima</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            inputMode="decimal"
                            placeholder="Ej: 28.5 o 28,5"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Humedad */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-slate-700">
                  Humedad Relativa (%)
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <FormField
                    control={form.control}
                    name="hr_min"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mínima</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            inputMode="decimal"
                            placeholder="Ej: 45.0 o 45,0"
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
                    name="hr_med"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Media</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            inputMode="decimal"
                            placeholder="Ej: 65.0 o 65,0"
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
                    name="hr_max"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Máxima</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            inputMode="decimal"
                            placeholder="Ej: 85.0 o 85,0"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Precipitaciones */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-slate-700">
                  Precipitaciones Acumuladas (mm)
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="pp_14_days_before"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>14 días antes</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            inputMode="decimal"
                            placeholder="Ej: 25.5 o 25,5"
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
                    name="pp_30_days_before"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>30 días antes</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            inputMode="decimal"
                            placeholder="Ej: 45.0 o 45,0"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="px-6 py-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Guardando..." : "Crear Datos Climáticos"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
