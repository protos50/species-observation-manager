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

import { castesApi } from "@/lib/api/castes";
import { z } from "zod";

type FormValues = {
  caste_name: string;
};

type Caste = {
  id_caste: number;
  caste_name: string;
};

interface EditCasteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caste: Caste | null;
  onCasteUpdated?: (updatedCaste: Caste) => void;
}

export function EditCasteDialog({
  open,
  onOpenChange,
  caste,
  onCasteUpdated,
}: EditCasteDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    if (caste) {
      form.setValue("caste_name", caste.caste_name);
    } else {
      form.reset();
    }
  }, [caste, form]);

  const onSubmit = async (values: FormValues) => {
    if (!caste) return;

    setIsLoading(true);
    try {
      const updatedCaste = await castesApi.castes.update(String(caste.id_caste), {
        caste_name: values.caste_name,
      });

      toast.success("Casta actualizada con éxito");
      onOpenChange(false);
      form.reset();

      if (onCasteUpdated) onCasteUpdated(updatedCaste);
    } catch (error) {
      console.error("Error al actualizar casta:", error);
      toast.error("Error al actualizar la casta");
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
          <DialogTitle>Editar Casta</DialogTitle>
          <DialogDescription>
            Modifique el nombre de la casta seleccionada.
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
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Actualizando..." : "Actualizar Casta"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
