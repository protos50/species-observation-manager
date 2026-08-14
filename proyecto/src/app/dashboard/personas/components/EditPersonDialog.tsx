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

interface EditPersonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  person: Person | null;
  onPersonUpdated?: (updatedPerson: Person) => void;
}

export function EditPersonDialog({
  open,
  onOpenChange,
  person,
  onPersonUpdated,
}: EditPersonDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    if (person) {
      form.setValue("person_name", person.person_name);
      form.setValue("person_lastname", person.person_lastname);
    } else {
      form.reset();
    }
  }, [person, form]);

  const onSubmit = async (values: FormValues) => {
    if (!person) return;

    setIsLoading(true);
    try {
      const updatedPerson = await collectionApi.persons.update(
        String(person.id_person),
        {
          person_name: values.person_name,
          person_lastname: values.person_lastname,
        }
      );

      toast.success("Persona actualizada con éxito");
      onOpenChange(false);
      form.reset();

      if (onPersonUpdated) onPersonUpdated(updatedPerson);
    } catch (error) {
      console.error("Error al actualizar persona:", error);
      toast.error("Error al actualizar la persona");
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
          <DialogTitle>Editar Persona</DialogTitle>
          <DialogDescription>
            Modifique los datos de la persona seleccionada.
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
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Actualizando..." : "Actualizar Persona"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
