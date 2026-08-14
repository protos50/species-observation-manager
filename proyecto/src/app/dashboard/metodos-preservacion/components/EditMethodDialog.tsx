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

import { preservationApi } from "@/lib/api/preservation";
import { z } from "zod";

type FormValues = {
  method_name: string;
};

type PreservationMethod = {
  id_preservation_method: number;
  method_name: string;
};

interface EditMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  method: PreservationMethod | null;
  onMethodUpdated?: (updatedMethod: PreservationMethod) => void;
}

export function EditMethodDialog({
  open,
  onOpenChange,
  method,
  onMethodUpdated,
}: EditMethodDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(
      z.object({
        method_name: z.string().min(1, "El nombre es requerido"),
      })
    ),
    defaultValues: {
      method_name: "",
    },
  });

  useEffect(() => {
    if (method) {
      form.setValue("method_name", method.method_name);
    } else {
      form.reset();
    }
  }, [method, form]);

  const onSubmit = async (values: FormValues) => {
    if (!method) return;

    setIsLoading(true);
    try {
      const updatedMethod = await preservationApi.preservationMethods.update(
        String(method.id_preservation_method),
        {
          method_name: values.method_name,
        }
      );

      toast.success("Método de preservación actualizado con éxito");
      onOpenChange(false);
      form.reset();

      if (onMethodUpdated) onMethodUpdated(updatedMethod);
    } catch (error) {
      console.error("Error al actualizar método de preservación:", error);
      toast.error("Error al actualizar el método de preservación");
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
          <DialogTitle>Editar Método de Preservación</DialogTitle>
          <DialogDescription>
            Modifique el nombre del método de preservación seleccionado.
          </DialogDescription>
        </DialogHeader>
        <Separator className="my-2" />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="method_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del método</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ejemplo: Alcohol 70%"
                      {...field}
                    />
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
                {isLoading ? "Actualizando..." : "Actualizar Método"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
