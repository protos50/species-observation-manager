"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { taxonomyApi, UpdateTaxonomicLevelData } from "@/lib/api/taxonomy";
import { z } from "zod";

// Valor del selector para un nivel que no va debajo de ningún otro
const PRIMERO = "primero";

type FormValues = {
  name: string;
  above: string;
};

type TaxonomicLevel = {
  id_taxonomic_level: number;
  name: string;
};

interface EditLevelTaxonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  level: TaxonomicLevel | null;
  // Niveles activos, de arriba hacia abajo en la jerarquía
  levels: TaxonomicLevel[];
  onLevelUpdated?: (updatedLevel: TaxonomicLevel) => void;
}

export function EditLevelTaxonDialog({
  open,
  onOpenChange,
  level,
  levels,
  onLevelUpdated,
}: EditLevelTaxonDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(
      z.object({
        name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
        above: z.string(),
      })
    ),
    defaultValues: {
      name: "",
      above: PRIMERO,
    },
  });

  // Nivel que hoy está justo arriba del que se edita
  const arribaActual = useMemo(() => {
    const i = levels.findIndex(
      (l) => l.id_taxonomic_level === level?.id_taxonomic_level
    );
    return i > 0 ? levels[i - 1].id_taxonomic_level.toString() : PRIMERO;
  }, [level, levels]);

  // Un nivel no puede ir debajo de sí mismo
  const otrosNiveles = levels.filter(
    (l) => l.id_taxonomic_level !== level?.id_taxonomic_level
  );

  useEffect(() => {
    if (level) {
      form.setValue("name", level.name);
      form.setValue("above", arribaActual);
    } else {
      form.reset();
    }
  }, [level, arribaActual, form]);

  const onSubmit = async (values: FormValues) => {
    if (!level) return;

    setIsLoading(true);
    try {
      const data: UpdateTaxonomicLevelData = { name: values.name };
      // Solo se mueve si eligieron otro lugar en la jerarquía
      if (values.above !== arribaActual) {
        data.above_level_id =
          values.above === PRIMERO ? null : parseInt(values.above);
      }
      const updatedLevel = await taxonomyApi.levels.update(
        level.id_taxonomic_level,
        data
      );

      toast.success("Nivel taxonómico actualizado con éxito");
      onOpenChange(false);
      form.reset();

      if (onLevelUpdated) onLevelUpdated(updatedLevel);
    } catch (error) {
      console.error("Error al actualizar nivel taxonómico:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al actualizar el nivel taxonómico"
      );
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
      <DialogContent className="sm:max-w-[400px] p-6">
        <DialogHeader>
          <DialogTitle>Editar Nivel Taxonómico</DialogTitle>
          <DialogDescription>
            Modifique el nombre del nivel taxonómico seleccionado o su lugar en
            la jerarquía.
          </DialogDescription>
        </DialogHeader>
        <Separator className="my-2" />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del nivel taxonómico</FormLabel>
                  <FormControl>
                    <Input placeholder="Ejemplo: Reino" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="above"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Va debajo de</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un nivel" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={PRIMERO}>Ninguno (va primero)</SelectItem>
                      {otrosNiveles.map((l) => (
                        <SelectItem
                          key={l.id_taxonomic_level}
                          value={l.id_taxonomic_level.toString()}
                        >
                          {l.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Elija el nivel que queda justo arriba.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Actualizando..." : "Actualizar Nivel"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

