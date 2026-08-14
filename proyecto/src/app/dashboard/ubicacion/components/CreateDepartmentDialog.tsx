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

interface Department {
  id_department: number;
  id_province: number;
  department_name: string;
}

interface CreateDepartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  provinceId: number;
  editingDepartment?: Department | null;
}

export function CreateDepartmentDialog({
  open,
  onOpenChange,
  onSuccess,
  provinceId,
  editingDepartment
}: CreateDepartmentDialogProps) {
  const [departmentName, setDepartmentName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (editingDepartment) {
      setDepartmentName(editingDepartment.department_name);
    } else {
      setDepartmentName("");
    }
  }, [editingDepartment, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!departmentName.trim()) {
      alert("El nombre del departamento es obligatorio");
      return;
    }

    try {
      setIsLoading(true);
      
      if (editingDepartment) {
        await locationApi.departments.update(String(editingDepartment.id_department), {
          department_name: departmentName.trim(),
          id_province: provinceId
        });
      } else {
        await locationApi.departments.create({
          department_name: departmentName.trim(),
          id_province: provinceId
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving department:', error);
      alert(
        editingDepartment 
          ? "Error al actualizar el departamento" 
          : "Error al crear el departamento"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setDepartmentName("");
    setIsLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {editingDepartment ? "Editar departamento" : "Crear nuevo departamento"}
            </DialogTitle>
            <DialogDescription>
              {editingDepartment 
                ? "Modifica los datos del departamento"
                : "Completa los datos para crear un nuevo departamento"
              }
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="department_name" className="text-right">
                Nombre *
              </Label>
              <Input
                id="department_name"
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                className="col-span-3"
                placeholder="ej: Almirante Brown"
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
              {isLoading ? "Guardando..." : editingDepartment ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
