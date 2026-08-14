"use client";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { taxonomyApi, TaxonomicLevel, Taxon } from "@/lib/api/taxonomy";
import { authorsApi } from "@/lib/api/authors";
import { z } from "zod";

interface Author {
  id_author: number;
  author_name: string;
}

const createTaxonSchema = z.object({
  name: z.string().min(1, "El nombre debe tener al menos un caracter"),
  id_taxonomic_level: z.number().min(1, "Debe seleccionar un nivel taxonómico"),
  parent_id: z.number().optional().nullable(),
  id_author: z.number().optional().nullable(),
});

type FormValues = z.infer<typeof createTaxonSchema>;

interface CreateTaxonDialogProps {
  onTaxonCreated?: (newTaxon: Taxon) => void;
}

export function CreateTaxonDialog({ onTaxonCreated }: CreateTaxonDialogProps) {
  const [open, setOpen] = useState(false);
  const [taxonomicLevels, setTaxonomicLevels] = useState<TaxonomicLevel[]>([]);
  const [parentTaxa, setParentTaxa] = useState<Taxon[]>([]);
  const [loading, setLoading] = useState(false);
  const [authors, setAuthors] = useState<Author[]>([]);
  const form = useForm<FormValues>({
    resolver: zodResolver(createTaxonSchema),
    defaultValues: {
      name: "",
      id_taxonomic_level: undefined,
      parent_id: null,
      id_author: null,
    },
  });

  // Cargar niveles taxonómicos y autores al abrir el diálogo
  useEffect(() => {
    if (open) {
      loadTaxonomicLevels();
      loadAuthors();
    }
  }, [open]);

  // Cargar taxones padre cuando cambia el nivel taxonómico
  const selectedLevelId = form.watch("id_taxonomic_level");
  useEffect(() => {
    if (selectedLevelId) {
      loadParentTaxa(selectedLevelId);
    } else {
      setParentTaxa([]);
    }
  }, [selectedLevelId]);

  const loadTaxonomicLevels = async () => {
    try {
      const levels = await taxonomyApi.levels.getAll();
      setTaxonomicLevels(levels);
    } catch (error) {
      toast.error("Error al cargar niveles taxonómicos");
    }
  };

  const loadParentTaxa = async (levelId: number) => {
    try {
      // El padre debe estar en el nivel inmediatamente superior
      const parentLevelId = levelId - 1;
      if (!parentLevelId || parentLevelId < 1) {
        setParentTaxa([]);
        return;
      }
      const taxaAtParentLevel = await taxonomyApi.taxa.getByLevel(
        parentLevelId
      );
      setParentTaxa(taxaAtParentLevel);
    } catch (error) {
      toast.error("Error al cargar taxones padre");
    }
  };

  const loadAuthors = async () => {
    try {
      const authors = await authorsApi.authors.getAll();
      setAuthors(authors as Author[]);
    } catch (error) {
      toast.error("Error al cargar autores");
    }
  };

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const createdTaxon = await taxonomyApi.taxa.create({
        name: values.name,
        id_taxonomic_level: values.id_taxonomic_level,
        parent_id: values.parent_id || null,
        id_author: values.id_author || null,
      });

      const completeTaxon = await taxonomyApi.taxa.getById(
        createdTaxon.id_taxon
      );

      toast.success("Taxón creado con éxito");
      setOpen(false);
      form.reset();

      if (onTaxonCreated) onTaxonCreated(completeTaxon);
    } catch (error) {
      console.error("Error al crear taxón:", error);
      toast.error("Error al crear taxón. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      form.reset();
      setParentTaxa([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer">
          <PlusCircle className="mr-2" />
          Crear Taxón
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px] p-6">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Taxón</DialogTitle>
          <DialogDescription>
            Complete la información del nuevo taxón. Los campos marcados con *
            son obligatorios.
          </DialogDescription>
        </DialogHeader>
        <Separator className="my-2" />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del taxón *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ejemplo: Formicidae" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="id_taxonomic_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nivel taxonómico *</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un nivel taxonómico" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {taxonomicLevels.map((level) => (
                        <SelectItem
                          key={level.id_taxonomic_level}
                          value={level.id_taxonomic_level.toString()}
                        >
                          {level.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="parent_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Taxón padre (opcional)</FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(value === "none" ? null : parseInt(value))
                    }
                    value={field.value?.toString() || "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un taxón padre" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Sin taxón padre</SelectItem>
                      {parentTaxa.map((taxon) => (
                        <SelectItem
                          key={taxon.id_taxon}
                          value={taxon.id_taxon.toString()}
                        >
                          {taxon.name} ({taxon.taxonomic_level.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="id_author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Autor (opcional)</FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(value === "none" ? null : parseInt(value))
                    }
                    value={field.value?.toString() || "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un autor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Sin autor</SelectItem>
                      {authors.map((author) => (
                        <SelectItem
                          key={author.id_author}
                          value={author.id_author.toString()}
                        >
                          {author.author_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creando..." : "Crear Taxón"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
