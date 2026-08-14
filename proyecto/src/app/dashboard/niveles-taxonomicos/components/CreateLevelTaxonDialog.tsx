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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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

interface CreateLevelTaxonDialogProps {
  onLevelTaxonCreated?: (newLevelTaxon: TaxonomicLevel) => void;
}

export function CreateLevelTaxonDialog({
  onLevelTaxonCreated,
}: CreateLevelTaxonDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(
      z.object({
        name: z.string().min(3),
      })
    ),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const newLevelTaxon = await taxonomyApi.levels.create({
        name: values.name,
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
    <Dialog open={open} onOpenChange={setOpen}>
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
            Ingrese el nombre del nuevo nivel taxonómico.
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
