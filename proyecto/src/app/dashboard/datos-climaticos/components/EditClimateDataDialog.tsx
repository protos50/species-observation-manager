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
import { toast } from "sonner";
import { locationApi } from "@/lib/api/location";

// Validador para números decimales con conversión de coma a punto
const numericString = (fieldName: string, min?: number, max?: number) =>
  z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true;
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

const climateDataSchema = z.object({
  t_min: numericString("Temperatura mínima", -50, 60),
  t_max: numericString("Temperatura máxima", -50, 60),
  t_med: numericString("Temperatura media", -50, 60),
  hr_min: numericString("Humedad mínima", 0, 100),
  hr_max: numericString("Humedad máxima", 0, 100),
  hr_med: numericString("Humedad media", 0, 100),
  pp_14_days_before: numericString("Precipitación 14 días", 0, 10000),
  pp_30_days_before: numericString("Precipitación 30 días", 0, 10000),
}).refine(
  (data) => {
    const tMin = data.t_min ? parseFloat(data.t_min.replace(",", ".")) : null;
    const tMed = data.t_med ? parseFloat(data.t_med.replace(",", ".")) : null;
    const tMax = data.t_max ? parseFloat(data.t_max.replace(",", ".")) : null;
    
    if (tMin !== null && tMed !== null && tMin > tMed) return false;
    if (tMed !== null && tMax !== null && tMed > tMax) return false;
    if (tMin !== null && tMax !== null && tMin > tMax) return false;
    
    return true;
  },
  { message: "Las temperaturas deben cumplir: mínima ≤ media ≤ máxima", path: ["t_med"] }
).refine(
  (data) => {
    const hrMin = data.hr_min ? parseFloat(data.hr_min.replace(",", ".")) : null;
    const hrMed = data.hr_med ? parseFloat(data.hr_med.replace(",", ".")) : null;
    const hrMax = data.hr_max ? parseFloat(data.hr_max.replace(",", ".")) : null;
    
    if (hrMin !== null && hrMed !== null && hrMin > hrMed) return false;
    if (hrMed !== null && hrMax !== null && hrMed > hrMax) return false;
    if (hrMin !== null && hrMax !== null && hrMin > hrMax) return false;
    
    return true;
  },
  { message: "La humedad debe cumplir: mínima ≤ media ≤ máxima", path: ["hr_med"] }
);

type ClimateFormValues = z.infer<typeof climateDataSchema>;

type ClimateData = {
  id_climate_data: number;
  id_locality: number;
  climate_date: string;
  t_min?: number;
  t_max?: number;
  t_med?: number;
  hr_min?: number;
  hr_max?: number;
  hr_med?: number;
  pp_14_days_before?: number;
  pp_30_days_before?: number;
};

interface EditClimateDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  climateData: ClimateData | null;
  onClimateDataUpdated?: (updatedData: ClimateData) => void;
}

export function EditClimateDataDialog({
  open,
  onOpenChange,
  climateData,
  onClimateDataUpdated,
}: EditClimateDataDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ClimateFormValues>({
    resolver: zodResolver(climateDataSchema),
    defaultValues: {
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

  useEffect(() => {
    if (climateData) {
      form.reset({
        t_min: climateData.t_min?.toString() || "",
        t_max: climateData.t_max?.toString() || "",
        t_med: climateData.t_med?.toString() || "",
        hr_min: climateData.hr_min?.toString() || "",
        hr_max: climateData.hr_max?.toString() || "",
        hr_med: climateData.hr_med?.toString() || "",
        pp_14_days_before: climateData.pp_14_days_before?.toString() || "",
        pp_30_days_before: climateData.pp_30_days_before?.toString() || "",
      });
    } else {
      form.reset();
    }
  }, [climateData, form]);

  const onSubmit = async (values: ClimateFormValues) => {
    if (!climateData) return;

    setIsLoading(true);

    try {
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

      const updatedData = await locationApi.climateData.update(
        String(climateData.id_climate_data),
        payload
      );

      toast.success("Datos climáticos actualizados con éxito");
      onOpenChange(false);
      form.reset();

      if (onClimateDataUpdated) onClimateDataUpdated(updatedData);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al actualizar datos climáticos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-2xl">Editar Datos Climáticos</DialogTitle>
          <DialogDescription>
            Modifique los datos climáticos del registro seleccionado.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
            <div className="px-6 py-4 space-y-4">
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
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Actualizando..." : "Actualizar Datos Climáticos"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

