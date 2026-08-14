"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { BookOpen } from "lucide-react";

import type { ColumnDef } from "@tanstack/react-table";

import { CreateAuthorDialog } from "./CreateAuthorDialog";
import { EditAuthorDialog } from "./EditAuthorDialog";
import { getColumns, getDeletedColumns } from "./Columns";
import ResponsiveDataList from "@/components/ResponsiveDataList";
import { authorsApi } from "@/lib/api/authors";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InUseAlertDialog } from "@/components/InUseAlertDialog";
import { toast } from "sonner";

type Author = {
  id_author: number;
  author_name: string;
  deleted_at?: Date | string | null;
};

interface AuthorClientProps {
  authors: Author[];
}

export function AuthorClient({ authors: initialAuthors }: AuthorClientProps) {
  const [activeAuthors, setActiveAuthors] = useState<Author[]>(initialAuthors);
  const [deletedAuthors, setDeletedAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("activos");
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [authorToDelete, setAuthorToDelete] = useState<Author | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [inUseInfo, setInUseInfo] = useState<any>(null);

  // Cargar autores dados de baja al inicio
  const loadDeletedAuthors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authorsApi.authors.getDeleted();
      setDeletedAuthors(
        data.map((author: any) => ({
          ...author,
          deleted_at: author.deleted_at ? new Date(author.deleted_at) : null,
        }))
      );
    } catch {
      setError("Error al cargar autores dados de baja");
    } finally {
      setLoading(false);
    }
  }, []);

  // Recargar autores activos
  const loadActiveAuthors = useCallback(async () => {
    try {
      const data = await authorsApi.authors.getAll();
      setActiveAuthors(data);
    } catch {
      console.error("Error al recargar autores activos");
    }
  }, []);

  const handleDeleteClick = useCallback(
    async (author: Author) => {
      setAuthorToDelete(author);
      try {
        const result = await authorsApi.authors.checkIfInUse(author.id_author);
        setInUseInfo(result);
        setIsDeleteDialogOpen(true);
      } catch (error) {
        console.error("Error checking references:", error);
        toast.error("Error al verificar referencias");
      }
    },
    []
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!authorToDelete) return;
    try {
      await authorsApi.authors.delete(authorToDelete.id_author.toString());
      setActiveAuthors((prev) => prev.filter((a) => a.id_author !== authorToDelete.id_author));
      setDeletedAuthors((prev) => [
        ...prev,
        { ...authorToDelete, deleted_at: new Date() },
      ]);
      toast.success(`El autor "${authorToDelete.author_name}" fue dado de baja exitosamente`);
      setIsDeleteDialogOpen(false);
      setAuthorToDelete(null);
    } catch (error) {
      console.error("Error al eliminar autor:", error);
      toast.error("Error al dar de baja el autor");
    }
  }, [authorToDelete]);

  // Función para manejar acciones de autor (eliminar/restaurar)
  const handleAuthorAction = useCallback(
    async (
      authorId: number,
      authorName: string,
      action: "delete" | "restore"
    ) => {
      try {
        if (action === "delete") {
          const author = activeAuthors.find((a) => a.id_author === authorId);
          if (author) {
            handleDeleteClick(author);
          }
          // Remover de autores activos y agregar a eliminados
        } else {
          await authorsApi.authors.restore(authorId.toString());
          // Remover de autores eliminados y agregar a activos
          const authorToRestore = deletedAuthors.find((a) => a.id_author === authorId);
          if (authorToRestore) {
            setDeletedAuthors((prev) => prev.filter((a) => a.id_author !== authorId));
            setActiveAuthors((prev) => [
              ...prev,
              { ...authorToRestore, deleted_at: undefined },
            ]);
          }
        }
      } catch (error) {
        console.error(
          `Error al ${action === "delete" ? "eliminar" : "restaurar"} autor:`,
          error
        );
        // En caso de error, recargar ambos listados para mantener consistencia
        await Promise.all([loadActiveAuthors(), loadDeletedAuthors()]);
      }
    },
    [activeAuthors, deletedAuthors, loadActiveAuthors, loadDeletedAuthors, handleDeleteClick]
  );

  const handleAuthorCreated = useCallback(async (newAuthor: Author) => {
    setActiveAuthors((prev) => [...prev, newAuthor]);
  }, []);

  const handleAuthorUpdated = useCallback(async (updatedAuthor: Author) => {
    setActiveAuthors((prev) =>
      prev.map((author) =>
        author.id_author === updatedAuthor.id_author ? updatedAuthor : author
      )
    );
  }, []);

  const handleEdit = useCallback((author: Author) => {
    setEditingAuthor(author);
    setIsEditDialogOpen(true);
  }, []);

  const handleCloseEditDialog = useCallback(() => {
    setIsEditDialogOpen(false);
    setEditingAuthor(null);
  }, []);

  const columns = useMemo<ColumnDef<Author>[]>(
    () => getColumns(handleAuthorAction, handleEdit),
    [handleAuthorAction, handleEdit]
  );

  const deletedColumns = useMemo<ColumnDef<Author>[]>(
    () => getDeletedColumns(handleAuthorAction),
    [handleAuthorAction]
  );

  const activosCount = activeAuthors.length;
  const bajaCount = deletedAuthors.length;

  // Cargar datos al montar el componente
  useEffect(() => {
    loadDeletedAuthors();
  }, [loadDeletedAuthors]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-primary/10 p-2">
            <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight">
            Autores Científicos
          </h2>
        </div>
        <CreateAuthorDialog onAuthorCreated={handleAuthorCreated} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted p-1 w-full sm:w-fit overflow-x-auto">
          <TabsTrigger
            value="activos"
            className="text-sm sm:text-base whitespace-nowrap"
          >
            Autores activos
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-600 rounded-full px-1.5 sm:px-2 py-0.5 text-xs"
            >
              {activosCount}
            </Badge>
          </TabsTrigger>

          <TabsTrigger
            value="baja"
            className="text-sm sm:text-base whitespace-nowrap"
          >
            Autores dados de baja
            <Badge
              variant="secondary"
              className="bg-red-100 text-red-600 rounded-full px-1.5 sm:px-2 py-0.5 text-xs"
            >
              {bajaCount}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activos" className="mt-4">
          <ResponsiveDataList columns={columns} data={activeAuthors} />
        </TabsContent>

        <TabsContent value="baja" className="mt-4">
          {loading ? (
            <div className="border rounded-md p-3 sm:p-4 text-muted-foreground text-sm sm:text-base">
              <p>Cargando autores dados de baja...</p>
            </div>
          ) : error ? (
            <div className="border rounded-md p-3 sm:p-4 text-red-600 text-sm sm:text-base">
              {error}
            </div>
          ) : deletedAuthors.length === 0 ? (
            <div className="border rounded-md p-3 sm:p-4 text-muted-foreground text-sm sm:text-base">
              <p>No hay autores dados de baja</p>
            </div>
          ) : (
            <ResponsiveDataList columns={deletedColumns} data={deletedAuthors} />
          )}
        </TabsContent>
      </Tabs>

      <EditAuthorDialog
        open={isEditDialogOpen}
        onOpenChange={handleCloseEditDialog}
        author={editingAuthor}
        onAuthorUpdated={handleAuthorUpdated}
      />

      <InUseAlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        inUseInfo={inUseInfo}
        onConfirm={handleConfirmDelete}
        title="Confirmar eliminación de autor"
        description={`¿Está seguro de que desea dar de baja al autor "${authorToDelete?.author_name}"?`}
        itemName={authorToDelete?.author_name}
      />
    </div>
  );
}
