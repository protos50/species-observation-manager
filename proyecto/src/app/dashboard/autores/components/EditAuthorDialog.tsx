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

import { authorsApi } from "@/lib/api/authors";
import { z } from "zod";

type FormValues = {
  author_name: string;
};

type Author = {
  id_author: number;
  author_name: string;
};

interface EditAuthorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  author: Author | null;
  onAuthorUpdated?: (updatedAuthor: Author) => void;
}

export function EditAuthorDialog({
  open,
  onOpenChange,
  author,
  onAuthorUpdated,
}: EditAuthorDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(
      z.object({
        author_name: z.string().min(1, "El nombre es requerido"),
      })
    ),
    defaultValues: {
      author_name: "",
    },
  });

  useEffect(() => {
    if (author) {
      form.setValue("author_name", author.author_name);
    } else {
      form.reset();
    }
  }, [author, form]);

  const onSubmit = async (values: FormValues) => {
    if (!author) return;

    setIsLoading(true);
    try {
      const updatedAuthor = await authorsApi.authors.update(
        String(author.id_author),
        {
          author_name: values.author_name,
        }
      );

      toast.success("Autor actualizado con éxito");
      onOpenChange(false);
      form.reset();

      if (onAuthorUpdated) onAuthorUpdated(updatedAuthor);
    } catch (error) {
      console.error("Error al actualizar autor:", error);
      toast.error("Error al actualizar el autor");
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
          <DialogTitle>Editar Autor</DialogTitle>
          <DialogDescription>
            Modifique el nombre del autor taxonómico seleccionado.
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
                    <Input
                      placeholder="Ejemplo: Linnaeus"
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
                {isLoading ? "Actualizando..." : "Actualizar Autor"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
