"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { PlusCircle } from "lucide-react";
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
import { serviceApi, Service, CreateServiceData } from "@/lib/api/service";
import { z } from "zod";

type FormValues = {
  service_name: string;
};

interface CreateServiceDialogProps {
  onServiceCreated?: (newService: Service) => void;
}

export function CreateServiceDialog({
  onServiceCreated,
}: CreateServiceDialogProps) {
  const [open, setOpen] = useState(false);

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

  const onSubmit = async (values: FormValues) => {
    try {
      const newService = await serviceApi.service.create({
        service_name: values.service_name,
      });

      toast.success("Servicio creado con éxito");
      setOpen(false);
      form.reset();

      if (onServiceCreated) onServiceCreated(newService);
    } catch (error) {
      console.error("Error al crear servicio:", error);
      toast.error("Error al crear el servicio");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer">
          <PlusCircle className="mr-2" />
          Crear Servicio
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[400px] p-6">
        <DialogHeader>
          <DialogTitle>Crear Servicio</DialogTitle>
          <DialogDescription>
            Ingrese el nombre del nuevo servicio.
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
              <Button type="submit" className="cursor-pointer">
                Crear Servicio
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
