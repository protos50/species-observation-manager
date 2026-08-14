"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, Leaf } from "lucide-react";
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

interface CreateEnvironmentDialogProps {
  onEnvironmentCreated?: (newEnvironment: Environment) => void;
}

export function CreateEnvironmentDialog({
  onEnvironmentCreated,
}: CreateEnvironmentDialogProps) {
  const [open, setOpen] = useState(false);

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

  const onSubmit = async (values: FormValues) => {
    try {
      const newEnvironment = await locationApi.environments.create({
        environment_name: values.environment_name.trim(),
      });

      toast.success("Ambiente creado con éxito");
      setOpen(false);
      form.reset();

      if (onEnvironmentCreated) onEnvironmentCreated(newEnvironment);
    } catch (error) {
      console.error("Error al crear ambiente:", error);
      toast.error("Error al crear ambiente");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer">
          <PlusCircle className="mr-2" />
          Crear Ambiente
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px] p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-emerald-600" />
            Crear Ambiente
          </DialogTitle>
          <DialogDescription>
            Ingrese el nombre del nuevo tipo de ambiente.
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
              <Button type="submit" className="cursor-pointer">
                Crear Ambiente
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

