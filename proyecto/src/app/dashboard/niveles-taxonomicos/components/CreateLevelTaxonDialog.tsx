"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { PlusCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Separator } from "@/components/ui/separator";

import { taxonomyApi } from "@/lib/api/taxonomy";
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

interface CreateLevelTaxonDialogProps {
  // Niveles activos, de arriba hacia abajo en la jerarquía
  levels: TaxonomicLevel[];
  onLevelTaxonCreated?: (newLevelTaxon: TaxonomicLevel) => void;
}

export function CreateLevelTaxonDialog({
  levels,
  onLevelTaxonCreated,
}: CreateLevelTaxonDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(
      z.object({
        name: z.string().min(3),
        above: z.string(),
      })
    ),
    defaultValues: {
      name: "",
      above: PRIMERO,
    },
  });

  // Por defecto el nivel nuevo va último, debajo del que hoy está más abajo
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      const ultimo = levels[levels.length - 1];
      form.reset({
        name: "",
        above: ultimo ? ultimo.id_taxonomic_level.toString() : PRIMERO,
      });
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const newLevelTaxon = await taxonomyApi.levels.create({
        name: values.name,
        above_level_id:
          values.above === PRIMERO ? null : parseInt(values.above),
      });

      toast.success("Nivel taxonómico creado con éxito");
      setOpen(false);
      form.reset();

      if (onLevelTaxonCreated) onLevelTaxonCreated(newLevelTaxon);
    } catch (error) {
      console.error("Error al crear nivel taxonómico:", error);
      toast.error("Error al crear nivel taxonómico");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer">
          <PlusCircle className="mr-2" />
          Crear Nivel Taxonómico
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[400px] p-6">
        <DialogHeader>
          <DialogTitle>Crear Nivel Taxonómico</DialogTitle>
          <DialogDescription>
            Ingrese el nombre del nuevo nivel taxonómico y dónde va en la
            jerarquía.
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
                      {levels.map((l) => (
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
                    Elija el nivel que queda justo arriba. Por ejemplo, Superfamily
                    va debajo de Order.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" className="cursor-pointer">
                Crear Nivel Taxonómico
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
