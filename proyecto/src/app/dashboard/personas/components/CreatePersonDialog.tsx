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

import { collectionApi } from "@/lib/api/collection";
import { z } from "zod";

type FormValues = {
  person_name: string;
  person_lastname: string;
};

type Person = {
  id_person: number;
  person_name: string;
  person_lastname: string;
};

interface CreatePersonDialogProps {
  onPersonCreated?: (newPerson: Person) => void;
}

export function CreatePersonDialog({
  onPersonCreated,
}: CreatePersonDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(
      z.object({
        person_name: z.string().min(1, "El nombre es requerido"),
        person_lastname: z.string().min(1, "El apellido es requerido"),
      })
    ),
    defaultValues: {
      person_name: "",
      person_lastname: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const newPerson = await collectionApi.persons.create({
        person_name: values.person_name,
        person_lastname: values.person_lastname,
      });

      toast.success("Persona creada con éxito");
      setOpen(false);
      form.reset();

      if (onPersonCreated) onPersonCreated(newPerson);
    } catch (error) {
      console.error("Error al crear persona:", error);
      toast.error("Error al crear persona");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer">
          <PlusCircle className="mr-2" />
          Crear Persona
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px] p-6">
        <DialogHeader>
          <DialogTitle>Crear Persona</DialogTitle>
          <DialogDescription>
            Ingrese los datos de la nueva persona (colector).
          </DialogDescription>
        </DialogHeader>
        <Separator className="my-2" />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="person_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ejemplo: Juan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="person_lastname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apellido</FormLabel>
                  <FormControl>
                    <Input placeholder="Ejemplo: Pérez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" className="cursor-pointer">
                Crear Persona
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
