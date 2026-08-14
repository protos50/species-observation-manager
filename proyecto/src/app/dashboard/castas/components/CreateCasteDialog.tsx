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

import { castesApi } from "@/lib/api/castes";
import { z } from "zod";

type FormValues = {
  caste_name: string;
};

type Caste = {
  id_caste: number;
  caste_name: string;
};

interface CreateCasteDialogProps {
  onCasteCreated?: (newCaste: Caste) => void;
}

export function CreateCasteDialog({ onCasteCreated }: CreateCasteDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(
      z.object({
        caste_name: z.string().min(1, "El nombre es requerido"),
      })
    ),
    defaultValues: {
      caste_name: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const newCaste = await castesApi.castes.create({
        caste_name: values.caste_name,
      });

      toast.success("Casta creada con éxito");
      setOpen(false);
      form.reset();

      if (onCasteCreated) onCasteCreated(newCaste);
    } catch (error) {
      console.error("Error al crear casta:", error);
      toast.error("Error al crear casta");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer">
          <PlusCircle className="mr-2" />
          Crear Casta
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[400px] p-6">
        <DialogHeader>
          <DialogTitle>Crear Casta</DialogTitle>
          <DialogDescription>
            Ingrese el nombre de la nueva casta (ej: Trabajadora, Reina, Soldado, Macho).
          </DialogDescription>
        </DialogHeader>
        <Separator className="my-2" />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="caste_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la casta</FormLabel>
                  <FormControl>
                    <Input placeholder="Ejemplo: Trabajadora" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" className="cursor-pointer">
                Crear Casta
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
