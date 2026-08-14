"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { geolocationApi } from "@/lib/api/geolocation";
import { locationApi } from "@/lib/api/location";
import { Geolocation } from "./Columns";

interface EditGeolocationDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (updatedGeo: any) => void;
  geolocation: Geolocation | null;
}

export function EditGeolocationDialog({
  open,
  onClose,
  onSuccess,
  geolocation,
}: EditGeolocationDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [localities, setLocalities] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    latitude: "",
    longitude: "",
    altitude: "",
    source_type: "GPS",
    tag: "",
    ihh: "",
    distance_to_river: "",
    id_locality: "",
  });

  // Cargar datos cuando el diálogo se abre y hay una geolocalización
  useEffect(() => {
    if (open && geolocation) {
      loadLocalities();
      setFormData({
        latitude: geolocation.latitude.toString(),
        longitude: geolocation.longitude.toString(),
        altitude: geolocation.altitude?.toString() || "",
        source_type: geolocation.source_type,
        tag: geolocation.tag || "",
        ihh: geolocation.ihh?.toString() || "",
        distance_to_river: geolocation.distance_to_river?.toString() || "",
        id_locality: geolocation.id_locality.toString(),
      });
    }
  }, [open, geolocation]);

  const loadLocalities = async () => {
    try {
      const data = await locationApi.localities.getAll();
      setLocalities(data);
    } catch (error) {
      console.error("Error loading localities:", error);
      toast.error("Error al cargar localidades");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!geolocation) return;

    // Validar campos requeridos
    if (!formData.latitude || !formData.longitude || !formData.id_locality) {
      toast.error("Por favor complete los campos requeridos");
      return;
    }

    setIsLoading(true);

    try {
      const updatedGeo = await geolocationApi.update(String(geolocation.id_geolocation), {
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        altitude: formData.altitude ? parseFloat(formData.altitude) : undefined,
        source_type: formData.source_type,
        tag: formData.tag || undefined,
        ihh: formData.ihh ? parseFloat(formData.ihh) : undefined,
        distance_to_river: formData.distance_to_river ? parseFloat(formData.distance_to_river) : undefined,
        id_locality: parseInt(formData.id_locality),
      });

      toast.success("Geolocalización actualizada con éxito");
      onClose();
      onSuccess?.(updatedGeo);
    } catch (error) {
      console.error("Error updating geolocation:", error);
      toast.error("Error al actualizar geolocalización");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Geolocalización</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitud *</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => handleInputChange("latitude", e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitud *</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => handleInputChange("longitude", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="locality">Localidad *</Label>
            <Select value={formData.id_locality} onValueChange={(value) => handleInputChange("id_locality", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione una localidad" />
              </SelectTrigger>
              <SelectContent>
                {localities.map((locality) => (
                  <SelectItem key={locality.id_locality} value={locality.id_locality.toString()}>
                    {locality.locality_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="altitude">Altitud (m.s.n.m.)</Label>
            <Input
              id="altitude"
              type="number"
              step="any"
              value={formData.altitude}
              onChange={(e) => handleInputChange("altitude", e.target.value)}
              placeholder="Opcional"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="source_type">Tipo de Fuente *</Label>
            <Select value={formData.source_type} onValueChange={(value) => handleInputChange("source_type", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GPS">GPS</SelectItem>
                <SelectItem value="Manual">Manual</SelectItem>
                <SelectItem value="Google Maps">Google Maps</SelectItem>
                <SelectItem value="Otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tag">Tag</Label>
            <Input
              id="tag"
              type="text"
              value={formData.tag}
              onChange={(e) => handleInputChange("tag", e.target.value)}
              placeholder="Ej: Punto A, Zona 1, etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ihh">IHH</Label>
              <Input
                id="ihh"
                type="number"
                step="any"
                value={formData.ihh}
                onChange={(e) => handleInputChange("ihh", e.target.value)}
                placeholder="Opcional"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="distance_to_river">Distancia al Río (m)</Label>
              <Input
                id="distance_to_river"
                type="number"
                step="any"
                value={formData.distance_to_river}
                onChange={(e) => handleInputChange("distance_to_river", e.target.value)}
                placeholder="Opcional"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : "Actualizar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
