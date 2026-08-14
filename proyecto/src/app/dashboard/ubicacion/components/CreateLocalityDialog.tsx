"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { locationApi } from "@/lib/api/location";

interface Locality {
  id_locality: number;
  id_department: number;
  locality_name: string;
}

interface CreateLocalityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  departmentId: number;
  editingLocality?: Locality | null;
}

export function CreateLocalityDialog({
  open,
  onOpenChange,
  onSuccess,
  departmentId,
  editingLocality
}: CreateLocalityDialogProps) {
  const [localityName, setLocalityName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (editingLocality) {
      setLocalityName(editingLocality.locality_name);
    } else {
      setLocalityName("");
    }
  }, [editingLocality, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!localityName.trim()) {
      alert("El nombre de la localidad es obligatorio");
      return;
    }

    try {
      setIsLoading(true);
      
      const payload = {
        locality_name: localityName.trim(),
        id_department: departmentId
      };

      if (editingLocality) {
        await locationApi.localities.update(String(editingLocality.id_locality), payload);
      } else {
        await locationApi.localities.create(payload);
      }
      
      // Note: Environment is managed at the observation level, not locality level
      
      onSuccess();
    } catch (error) {
      console.error('Error saving locality:', error);
      alert(
        editingLocality 
          ? "Error al actualizar la localidad" 
          : "Error al crear la localidad"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setLocalityName("");
    setIsLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {editingLocality ? "Editar localidad" : "Crear nueva localidad"}
            </DialogTitle>
            <DialogDescription>
              {editingLocality 
                ? "Modifica los datos de la localidad"
                : "Completa los datos para crear una nueva localidad"
              }
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="locality_name" className="text-right">
                Nombre *
              </Label>
              <Input
                id="locality_name"
                value={localityName}
                onChange={(e) => setLocalityName(e.target.value)}
                className="col-span-3"
                placeholder="ej: Villa María"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : editingLocality ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
