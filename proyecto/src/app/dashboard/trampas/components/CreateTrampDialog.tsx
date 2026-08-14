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

import { trapsApi } from "@/lib/api/traps";
import { z } from "zod";

type FormValues = {
  trap_name: string;
};

type Trap = {
  id_trap: number;
  trap_name: string;
};

interface CreateTrampDialogProps {
  onTrampCreated?: (newTramp: Trap) => void;
}

export function CreateTrampDialog({ onTrampCreated }: CreateTrampDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(
      z.object({
        trap_name: z.string().min(1),
      })
    ),
    defaultValues: {
      trap_name: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const newTramp = await trapsApi.traps.create({
        trap_name: values.trap_name,
      });

      toast.success("Trampa creada con éxito");
      setOpen(false);
      form.reset();

      if (onTrampCreated) onTrampCreated(newTramp);
    } catch (error) {
      console.error("Error al crear trampa:", error);
      toast.error("Error al crear trampa");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer">
          <PlusCircle className="mr-2" />
          Crear Trampa
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[400px] p-6">
        <DialogHeader>
          <DialogTitle>Crear Trampa</DialogTitle>
          <DialogDescription>
            Ingrese el nombre de la nueva trampa.
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
              <Button type="submit" className="cursor-pointer">
                Crear Trampa
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
