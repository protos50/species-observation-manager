"use client";

import { useState, useEffect } from "react";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { taxonomyApi } from "@/lib/api/taxonomy";
import { z } from "zod";

type FormValues = {
  name: string;
};

type TaxonomicLevel = {
  id_taxonomic_level: number;
  name: string;
};

interface EditLevelTaxonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  level: TaxonomicLevel | null;
  onLevelUpdated?: (updatedLevel: TaxonomicLevel) => void;
}

export function EditLevelTaxonDialog({
  open,
  onOpenChange,
  level,
  onLevelUpdated,
}: EditLevelTaxonDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(
      z.object({
        name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
      })
    ),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (level) {
      form.setValue("name", level.name);
    } else {
      form.reset();
    }
  }, [level, form]);

  const onSubmit = async (values: FormValues) => {
    if (!level) return;

    setIsLoading(true);
    try {
      const updatedLevel = await taxonomyApi.levels.update(level.id_taxonomic_level, {
        name: values.name,
      });

      toast.success("Nivel taxonómico actualizado con éxito");
      onOpenChange(false);
      form.reset();

      if (onLevelUpdated) onLevelUpdated(updatedLevel);
    } catch (error) {
      console.error("Error al actualizar nivel taxonómico:", error);
      toast.error("Error al actualizar el nivel taxonómico");
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
            Modifique el nombre del nivel taxonómico seleccionado.
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

