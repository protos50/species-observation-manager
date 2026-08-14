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

import { preservationApi } from "@/lib/api/preservation";
import { z } from "zod";

type FormValues = {
  method_name: string;
};

type PreservationMethod = {
  id_preservation_method: number;
  method_name: string;
};

interface CreateMethodDialogProps {
  onMethodCreated?: (newMethod: PreservationMethod) => void;
}

export function CreateMethodDialog({
  onMethodCreated,
}: CreateMethodDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(
      z.object({
        method_name: z.string().min(1),
      })
    ),
    defaultValues: {
      method_name: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const newMethod = await preservationApi.preservationMethods.create({
        method_name: values.method_name,
      });

      toast.success("Método de preservación creado con éxito");
      setOpen(false);
      form.reset();

      if (onMethodCreated) onMethodCreated(newMethod);
    } catch (error) {
      console.error("Error al crear método:", error);
      toast.error("Error al crear método de preservación");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer">
          <PlusCircle className="mr-2" />
          Crear Método
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[400px] p-6">
        <DialogHeader>
          <DialogTitle>Crear Método de Preservación</DialogTitle>
          <DialogDescription>
            Ingrese el nombre del nuevo método.
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
                    <Input placeholder="Ejemplo: Alcohol 70%" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" className="cursor-pointer">
                Crear Método
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
