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

import { serviceApi, Service } from "@/lib/api/service";
import { z } from "zod";

type FormValues = {
  service_name: string;
};

interface EditServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service | null;
  onServiceUpdated?: (updatedService: Service) => void;
}

export function EditServiceDialog({
  open,
  onOpenChange,
  service,
  onServiceUpdated,
}: EditServiceDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(
      z.object({
        service_name: z.string().min(1, "El nombre es requerido"),
      })
    ),
    defaultValues: {
      service_name: "",
    },
  });

  useEffect(() => {
    if (service) {
      form.setValue("service_name", service.service_name);
    } else {
      form.reset();
    }
  }, [service, form]);

  const onSubmit = async (values: FormValues) => {
    if (!service) return;

    setIsLoading(true);
    try {
      const updatedService = await serviceApi.service.update(
        service.id_service.toString(),
        {
          service_name: values.service_name,
        }
      );

      toast.success("Servicio actualizado con éxito");
      onOpenChange(false);
      form.reset();

      if (onServiceUpdated) onServiceUpdated(updatedService);
    } catch (error) {
      console.error("Error al actualizar servicio:", error);
      toast.error("Error al actualizar el servicio");
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
          <DialogTitle>Editar Servicio</DialogTitle>
          <DialogDescription>
            Modifique el nombre del servicio seleccionado.
          </DialogDescription>
        </DialogHeader>
        <Separator className="my-2" />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="service_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del servicio</FormLabel>
                  <FormControl>
                    <Input placeholder="Ejemplo: Mantenimiento de equipos" {...field} />
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
                {isLoading ? "Actualizando..." : "Actualizar Servicio"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

