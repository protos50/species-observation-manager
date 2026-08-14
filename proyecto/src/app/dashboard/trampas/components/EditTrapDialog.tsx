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

import { trapsApi } from "@/lib/api/traps";
import { z } from "zod";

type FormValues = {
  trap_name: string;
};

type Trap = {
  id_trap: number;
  trap_name: string;
};

interface EditTrapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trap: Trap | null;
  onTrapUpdated?: (updatedTrap: Trap) => void;
}

export function EditTrapDialog({
  open,
  onOpenChange,
  trap,
  onTrapUpdated,
}: EditTrapDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(
      z.object({
        trap_name: z.string().min(1, "El nombre es requerido"),
      })
    ),
    defaultValues: {
      trap_name: "",
    },
  });

  useEffect(() => {
    if (trap) {
      form.setValue("trap_name", trap.trap_name);
    } else {
      form.reset();
    }
  }, [trap, form]);

  const onSubmit = async (values: FormValues) => {
    if (!trap) return;

    setIsLoading(true);
    try {
      const updatedTrap = await trapsApi.traps.update(String(trap.id_trap), {
        trap_name: values.trap_name,
      });

      toast.success("Trampa actualizada con éxito");
      onOpenChange(false);
      form.reset();

      if (onTrapUpdated) onTrapUpdated(updatedTrap);
    } catch (error) {
      console.error("Error al actualizar trampa:", error);
      toast.error("Error al actualizar la trampa");
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
          <DialogTitle>Editar Trampa</DialogTitle>
          <DialogDescription>
            Modifique el nombre de la trampa seleccionada.
          </DialogDescription>
        </DialogHeader>
        <Separator className="my-2" />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="trap_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la trampa</FormLabel>
                  <FormControl>
                    <Input placeholder="Ejemplo: Trampa Malaise" {...field} />
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
                {isLoading ? "Actualizando..." : "Actualizar Trampa"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
