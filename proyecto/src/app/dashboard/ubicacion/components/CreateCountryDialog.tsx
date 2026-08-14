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

interface Country {
  id_country: number;
  country_name: string;
}

interface CreateCountryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editingCountry?: Country | null;
}

export function CreateCountryDialog({
  open,
  onOpenChange,
  onSuccess,
  editingCountry
}: CreateCountryDialogProps) {
  const [countryName, setCountryName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (editingCountry) {
      setCountryName(editingCountry.country_name);
    } else {
      setCountryName("");
    }
  }, [editingCountry, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!countryName.trim()) {
      alert("El nombre del país es obligatorio");
      return;
    }

    try {
      setIsLoading(true);
      
      if (editingCountry) {
        await locationApi.countries.update(String(editingCountry.id_country), {
          country_name: countryName.trim()
        });
      } else {
        await locationApi.countries.create({
          country_name: countryName.trim()
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving country:', error);
      alert(
        editingCountry 
          ? "Error al actualizar el país" 
          : "Error al crear el país"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setCountryName("");
    setIsLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {editingCountry ? "Editar país" : "Crear nuevo país"}
            </DialogTitle>
            <DialogDescription>
              {editingCountry 
                ? "Modifica los datos del país"
                : "Completa los datos para crear un nuevo país"
              }
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="country_name" className="text-right">
                Nombre *
              </Label>
              <Input
                id="country_name"
                value={countryName}
                onChange={(e) => setCountryName(e.target.value)}
                className="col-span-3"
                placeholder="ej: Argentina"
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
              {isLoading ? "Guardando..." : editingCountry ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
