"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Leaf } from "lucide-react";
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

import { locationApi } from "@/lib/api/location";
import { z } from "zod";

type FormValues = {
  environment_name: string;
};

type Environment = {
  id_environment: number;
  environment_name: string;
  _count?: {
    Observation: number;
  };
};

interface EditEnvironmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  environment: Environment | null;
  onEnvironmentUpdated?: (updatedEnvironment: Environment) => void;
}

export function EditEnvironmentDialog({
  open,
  onOpenChange,
  environment,
  onEnvironmentUpdated,
}: EditEnvironmentDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(
      z.object({
        environment_name: z.string().min(1, "El nombre del ambiente es requerido"),
      })
    ),
    defaultValues: {
      environment_name: "",
    },
  });

  useEffect(() => {
    if (environment) {
      form.setValue("environment_name", environment.environment_name);
    } else {
      form.reset();
    }
  }, [environment, form]);

  const onSubmit = async (values: FormValues) => {
    if (!environment) return;

    setIsLoading(true);
    try {
      const updatedEnvironment = await locationApi.environments.update(
        String(environment.id_environment),
        {
          environment_name: values.environment_name.trim(),
        }
      );

      toast.success("Ambiente actualizado con éxito");
      onOpenChange(false);
      form.reset();

      if (onEnvironmentUpdated) onEnvironmentUpdated(updatedEnvironment);
    } catch (error) {
      console.error("Error al actualizar ambiente:", error);
      toast.error("Error al actualizar el ambiente");
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
      <DialogContent className="sm:max-w-[500px] p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-emerald-600" />
            Editar Ambiente
          </DialogTitle>
          <DialogDescription>
            Modifique el nombre del ambiente seleccionado.
          </DialogDescription>
        </DialogHeader>
        <Separator className="my-2" />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="environment_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Ambiente</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Bosque, Pastizal, Selva riparia..."
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
                {isLoading ? "Actualizando..." : "Actualizar Ambiente"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

