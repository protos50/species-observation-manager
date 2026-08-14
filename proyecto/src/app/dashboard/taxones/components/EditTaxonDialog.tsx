"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { taxonomyApi, TaxonomicLevel, Taxon } from "@/lib/api/taxonomy";
import { authorsApi } from "@/lib/api/authors";

interface Author {
  id_author: number;
  author_name: string;
}

const editTaxonSchema = z.object({
  name: z.string().min(1, "El nombre debe tener al menos un caracter"),
  id_taxonomic_level: z.number().min(1, "Debe seleccionar un nivel taxonómico"),
  parent_id: z.number().optional().nullable(),
  id_author: z.number().optional().nullable(),
});

type FormValues = z.infer<typeof editTaxonSchema>;

interface EditTaxonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taxon: Taxon | null;
  onTaxonUpdated?: (updatedTaxon: Taxon) => void;
}

export function EditTaxonDialog({
  open,
  onOpenChange,
  taxon,
  onTaxonUpdated,
}: EditTaxonDialogProps) {
  const [loading, setLoading] = useState(false);
  const [taxonomicLevels, setTaxonomicLevels] = useState<TaxonomicLevel[]>([]);
  const [parentTaxa, setParentTaxa] = useState<Taxon[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(editTaxonSchema),
    defaultValues: {
      name: "",
      id_taxonomic_level: undefined,
      parent_id: null,
      id_author: null,
    },
  });

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (open && taxon) {
      loadData();
      loadAuthors();
      // Establecer valores del formulario
      form.reset({
        name: taxon.name,
        id_taxonomic_level:
          taxon.taxonomic_level?.id_taxonomic_level ?? taxon.id_taxonomic_level,
        parent_id: taxon.parent?.id_taxon ?? taxon.parent_id ?? null,
        id_author: taxon.author?.id_author ?? taxon.id_author ?? null,
      });
    }
  }, [open, taxon, form]);

  const loadData = async () => {
    try {
      const [levels, allTaxa] = await Promise.all([
        taxonomyApi.levels.getAll(),
        taxonomyApi.taxa.getAll(),
      ]);
      setTaxonomicLevels(levels);
      // Si hay taxón cargado, filtramos por su nivel actual - 1; si no, dejamos todos
      if (taxon) {
        const currentLevelId =
          taxon.id_taxonomic_level ?? taxon.taxonomic_level?.id_taxonomic_level;
        const parentLevelId = (currentLevelId ?? 0) - 1;
        setParentTaxa(
          parentLevelId > 0
            ? allTaxa.filter((t) => t.id_taxonomic_level === parentLevelId)
            : []
        );
      } else {
        setParentTaxa(allTaxa);
      }
    } catch (error) {
      toast.error("Error al cargar datos auxiliares");
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
    if (!taxon) return;

    setLoading(true);
    try {
      // Actualizar el taxón
      await taxonomyApi.taxa.update(taxon.id_taxon, {
        name: values.name,
        id_taxonomic_level: values.id_taxonomic_level,
        parent_id: values.parent_id || null,
        id_author: values.id_author || null,
      });

      // Obtener el taxón completo con sus relaciones
      const updatedTaxon = await taxonomyApi.taxa.getById(taxon.id_taxon);

      toast.success("Taxón actualizado con éxito");
      onOpenChange(false);
      form.reset();

      if (onTaxonUpdated) onTaxonUpdated(updatedTaxon);
    } catch (error) {
      console.error("Error al actualizar taxón:", error);
      toast.error("Error al actualizar el taxón");
    } finally {
      setLoading(false);
    }
  };

  // Reaccionar a cambios del nivel para volver a cargar posibles padres
  const selectedLevelId = form.watch("id_taxonomic_level");
  useEffect(() => {
    if (!open) return;
    if (selectedLevelId) {
      const parentLevelId = selectedLevelId - 1;
      if (parentLevelId < 1) {
        setParentTaxa([]);
        // si el nivel es el más alto, forzamos parent_id a null
        form.setValue("parent_id", null, {
          shouldDirty: true,
          shouldValidate: true,
        });
        return;
      }
      // Usamos endpoint por nivel para eficiencia
      taxonomyApi.taxa
        .getByLevel(parentLevelId)
        .then((list) => {
          // Evitar seleccionarse a sí mismo si estamos editando
          const filtered = taxon
            ? list.filter((t) => t.id_taxon !== taxon.id_taxon)
            : list;
          setParentTaxa(filtered);
          // Si el parent seleccionado no pertenece al nuevo conjunto, lo limpiamos
          const currentParentId = form.getValues("parent_id");
          if (
            currentParentId &&
            !filtered.some((t) => t.id_taxon === currentParentId)
          ) {
            form.setValue("parent_id", null, {
              shouldDirty: true,
              shouldValidate: true,
            });
          }
        })
        .catch(() => toast.error("Error al cargar taxones padre"));
    } else {
      setParentTaxa([]);
      form.setValue("parent_id", null, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [selectedLevelId, open, taxon, form]);

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-6">
        <DialogHeader>
          <DialogTitle>Editar Taxón</DialogTitle>
          <DialogDescription>
            Modifica la información del taxón seleccionado.
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
                      {parentTaxa
                        .filter((t) => t.id_taxon !== taxon?.id_taxon)
                        .map((t) => (
                          <SelectItem
                            key={t.id_taxon}
                            value={t.id_taxon.toString()}
                          >
                            {t.name} (
                            {t.taxonomic_level?.name ??
                              `Nivel ${t.id_taxonomic_level}`}
                            )
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
                {loading ? "Guardando..." : "Guardar cambios"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
