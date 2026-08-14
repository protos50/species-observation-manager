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

import { authorsApi } from "@/lib/api/authors";
import { z } from "zod";

type FormValues = {
  author_name: string;
};

type Author = {
  id_author: number;
  author_name: string;
};

interface CreateAuthorDialogProps {
  onAuthorCreated?: (newAuthor: Author) => void;
}

export function CreateAuthorDialog({ onAuthorCreated }: CreateAuthorDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(
      z.object({
        author_name: z.string().min(1, "El nombre del autor es requerido"),
      })
    ),
    defaultValues: {
      author_name: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const newAuthor = await authorsApi.authors.create({
        author_name: values.author_name,
      });

      toast.success("Autor creado con éxito");
      setOpen(false);
      form.reset();

      if (onAuthorCreated) onAuthorCreated(newAuthor);
    } catch (error) {
      console.error("Error al crear autor:", error);
      toast.error("Error al crear autor");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer">
          <PlusCircle className="mr-2" />
          Crear Autor
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[400px] p-6">
        <DialogHeader>
          <DialogTitle>Crear Autor Científico</DialogTitle>
          <DialogDescription>
            Ingrese el nombre del autor científico (ej: Linnaeus, Fabricius, Latreille).
          </DialogDescription>
        </DialogHeader>
        <Separator className="my-2" />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="author_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del autor</FormLabel>
                  <FormControl>
                    <Input placeholder="Ejemplo: Linnaeus" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" className="cursor-pointer">
                Crear Autor
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
