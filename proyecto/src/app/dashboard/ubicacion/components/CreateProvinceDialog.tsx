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

interface Province {
  id_province: number;
  id_country: number;
  province_name: string;
}

interface CreateProvinceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  countryId: number;
  editingProvince?: Province | null;
}

export function CreateProvinceDialog({
  open,
  onOpenChange,
  onSuccess,
  countryId,
  editingProvince
}: CreateProvinceDialogProps) {
  const [provinceName, setProvinceName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (editingProvince) {
      setProvinceName(editingProvince.province_name);
    } else {
      setProvinceName("");
    }
  }, [editingProvince, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!provinceName.trim()) {
      alert("El nombre de la provincia es obligatorio");
      return;
    }

    try {
      setIsLoading(true);
      
      if (editingProvince) {
        await locationApi.provinces.update(String(editingProvince.id_province), {
          province_name: provinceName.trim(),
          id_country: countryId
        });
      } else {
        await locationApi.provinces.create({
          province_name: provinceName.trim(),
          id_country: countryId
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving province:', error);
      alert(
        editingProvince 
          ? "Error al actualizar la provincia" 
          : "Error al crear la provincia"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setProvinceName("");
    setIsLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {editingProvince ? "Editar provincia" : "Crear nueva provincia"}
            </DialogTitle>
            <DialogDescription>
              {editingProvince 
                ? "Modifica los datos de la provincia"
                : "Completa los datos para crear una nueva provincia"
              }
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="province_name" className="text-right">
                Nombre *
              </Label>
              <Input
                id="province_name"
                value={provinceName}
                onChange={(e) => setProvinceName(e.target.value)}
                className="col-span-3"
                placeholder="ej: Buenos Aires"
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
              {isLoading ? "Guardando..." : editingProvince ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
