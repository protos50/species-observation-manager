"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { User } from "lucide-react";

import type { ColumnDef } from "@tanstack/react-table";

import { CreatePersonDialog } from "./CreatePersonDialog";
import { EditPersonDialog } from "./EditPersonDialog";
import { getColumns, getDeletedColumns } from "./Columns";
import ResponsiveDataList from "@/components/ResponsiveDataList";
import { collectionApi } from "@/lib/api/collection";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InUseAlertDialog } from "@/components/InUseAlertDialog";
import { toast } from "sonner";
import { CanWrite, withoutActionsColumn } from "@/components/CanWrite";
import { useRoleAuth } from "@/hooks/use-role-auth";

type Person = {
  id_person: number;
  person_name: string;
  person_lastname: string;
  email?: string | null;
  institution?: string | null;
  deleted_at?: Date | string | null;
};

interface PersonClientProps {
  persons: Person[];
}

export function PersonClient({ persons: initialPersons }: PersonClientProps) {
  const { canWrite } = useRoleAuth();
  const [activePersons, setActivePersons] = useState<Person[]>(initialPersons);
  const [deletedPersons, setDeletedPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("activos");
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [personToDelete, setPersonToDelete] = useState<Person | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [inUseInfo, setInUseInfo] = useState<any>(null);
  const [isCheckingReferences, setIsCheckingReferences] = useState(false);

  // Cargar personas dadas de baja al inicio
  const loadDeletedPersons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await collectionApi.persons.getDeleted();
      setDeletedPersons(
        data.map((person: any) => ({
          ...person,
          deleted_at: person.deleted_at ? new Date(person.deleted_at) : null,
        }))
      );
    } catch {
      setError("Error al cargar personas dadas de baja");
    } finally {
      setLoading(false);
    }
  }, []);

  // Recargar personas activas
  const loadActivePersons = useCallback(async () => {
    try {
      const data = await collectionApi.persons.getAll();
      setActivePersons(data);
    } catch {
      console.error("Error al recargar personas activas");
    }
  }, []);

  // Verificar si una persona está en uso
  const handleDeleteClick = useCallback(
    async (person: Person) => {
      setPersonToDelete(person);
      setIsCheckingReferences(true);
      try {
        const result = await collectionApi.persons.checkIfInUse(person.id_person.toString());
        setInUseInfo(result);
        setIsDeleteDialogOpen(true);
      } catch (error) {
        console.error("Error checking references:", error);
        toast.error("Error al verificar referencias");
      } finally {
        setIsCheckingReferences(false);
      }
    },
    []
  );

  // Confirmar eliminación
  const handleConfirmDelete = useCallback(async () => {
    if (!personToDelete) return;
    try {
      await collectionApi.persons.delete(personToDelete.id_person.toString());
      setActivePersons((prev) => prev.filter((p) => p.id_person !== personToDelete.id_person));
      setDeletedPersons((prev) => [
        ...prev,
        { ...personToDelete, deleted_at: new Date() },
      ]);
      toast.success(`La persona "${personToDelete.person_name} ${personToDelete.person_lastname}" fue dada de baja exitosamente`);
      setIsDeleteDialogOpen(false);
      setPersonToDelete(null);
    } catch (error) {
      console.error("Error al eliminar persona:", error);
      toast.error("Error al dar de baja la persona");
    }
  }, [personToDelete]);

  // Función para manejar acciones de persona (restaurar)
  const handlePersonAction = useCallback(
    async (
      personId: number,
      personName: string,
      action: "delete" | "restore"
    ) => {
      try {
        if (action === "delete") {
          const person = activePersons.find((p) => p.id_person === personId);
          if (person) {
            handleDeleteClick(person);
          }
        } else {
          await collectionApi.persons.restore(personId.toString());
          // Remover de personas eliminadas y agregar a activas
          const personToRestore = deletedPersons.find(
            (p) => p.id_person === personId
          );
          if (personToRestore) {
            setDeletedPersons((prev) =>
              prev.filter((p) => p.id_person !== personId)
            );
            setActivePersons((prev) => [
              ...prev,
              { ...personToRestore, deleted_at: undefined },
            ]);
          }
        }
      } catch (error) {
        console.error(
          `Error al ${action === "delete" ? "eliminar" : "restaurar"} persona:`,
          error
        );
        // En caso de error, recargar ambos listados para mantener consistencia
        await Promise.all([loadActivePersons(), loadDeletedPersons()]);
      }
    },
    [activePersons, deletedPersons, loadActivePersons, loadDeletedPersons, handleDeleteClick]
  );

  // Método creado
  const handlePersonCreated = useCallback(async (newPerson: Person) => {
    setActivePersons((prev) => [...prev, newPerson]);
  }, []);

  // Método editado
  const handlePersonUpdated = useCallback(async (updatedPerson: Person) => {
    setActivePersons((prev) =>
      prev.map((person) =>
        person.id_person === updatedPerson.id_person ? updatedPerson : person
      )
    );
  }, []);

  // Editar
  const handleEdit = useCallback((person: Person) => {
    setEditingPerson(person);
    setIsEditDialogOpen(true);
  }, []);

  // Cerrar diálogo
  const handleCloseEditDialog = useCallback(() => {
    setIsEditDialogOpen(false);
    setEditingPerson(null);
  }, []);

  const columns = useMemo<ColumnDef<Person>[]>(
    () => {
      const cols = getColumns(handlePersonAction, handleEdit);
      return canWrite() ? cols : withoutActionsColumn(cols);
    },
    [handlePersonAction, handleEdit, canWrite]
  );

  const deletedColumns = useMemo<ColumnDef<Person>[]>(
    () => {
      const cols = getDeletedColumns(handlePersonAction);
      return canWrite() ? cols : withoutActionsColumn(cols);
    },
    [handlePersonAction, canWrite]
  );

  const activosCount = activePersons.length;
  const bajaCount = deletedPersons.length;

  // Cargar datos al montar el componente
  useEffect(() => {
    loadDeletedPersons();
  }, [loadDeletedPersons]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-primary/10 p-2">
            <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight">
            Identificadores y/o colectores
          </h2>
        </div>
        <CanWrite>
          <CreatePersonDialog onPersonCreated={handlePersonCreated} />
        </CanWrite>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted p-1 w-full sm:w-fit overflow-x-auto">
          <TabsTrigger
            value="activos"
            className="text-sm sm:text-base whitespace-nowrap"
          >
            Activos
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
            Dados de baja
            <Badge
              variant="secondary"
              className="bg-red-100 text-red-600 rounded-full px-1.5 sm:px-2 py-0.5 text-xs"
            >
              {bajaCount}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activos" className="mt-4">
          <ResponsiveDataList columns={columns} data={activePersons} />
        </TabsContent>

        <TabsContent value="baja" className="mt-4">
          {loading ? (
            <div className="border rounded-md p-3 sm:p-4 text-muted-foreground text-sm sm:text-base">
              <p>Cargando personas dadas de baja...</p>
            </div>
          ) : error ? (
            <div className="border rounded-md p-3 sm:p-4 text-red-600 text-sm sm:text-base">
              {error}
            </div>
          ) : deletedPersons.length === 0 ? (
            <div className="border rounded-md p-3 sm:p-4 text-muted-foreground text-sm sm:text-base">
              <p>No hay personas dadas de baja</p>
            </div>
          ) : (
            <ResponsiveDataList
              columns={deletedColumns}
              data={deletedPersons}
            />
          )}
        </TabsContent>
      </Tabs>

      <EditPersonDialog
        open={isEditDialogOpen}
        onOpenChange={handleCloseEditDialog}
        person={editingPerson}
        onPersonUpdated={handlePersonUpdated}
      />

      <InUseAlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        inUseInfo={inUseInfo}
        onConfirm={handleConfirmDelete}
        title="Confirmar eliminación de persona"
        description={`¿Está seguro de que desea dar de baja a ${personToDelete?.person_name} ${personToDelete?.person_lastname}?`}
        itemName={`${personToDelete?.person_name} ${personToDelete?.person_lastname}`}
      />
    </div>
  );
}
