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

interface CreateGeolocationDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (newGeo: any) => void;
}

export function CreateGeolocationDialog({
  open,
  onClose,
  onSuccess,
}: CreateGeolocationDialogProps) {
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

  useEffect(() => {
    if (open) {
      loadLocalities();
    }
  }, [open]);

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
    
    if (!formData.latitude || !formData.longitude || !formData.id_locality) {
      toast.error("Latitud, Longitud y Localidad son obligatorios");
      return;
    }

    setIsLoading(true);

    try {
      const createdGeo = await geolocationApi.create({
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        altitude: formData.altitude ? parseFloat(formData.altitude) : undefined,
        source_type: formData.source_type,
        tag: formData.tag || undefined,
        ihh: formData.ihh ? parseFloat(formData.ihh) : undefined,
        distance_to_river: formData.distance_to_river ? parseFloat(formData.distance_to_river) : undefined,
        id_locality: parseInt(formData.id_locality),
      });

      toast.success("Geolocalización creada con éxito");
      onClose();
      onSuccess?.(createdGeo);
      
      // Reset form
      setFormData({
        latitude: "",
        longitude: "",
        altitude: "",
        source_type: "GPS",
        tag: "",
        ihh: "",
        distance_to_river: "",
        id_locality: "",
      });
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al crear geolocalización");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? onClose() : null)}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crear Geolocalización</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="latitude">Latitud *</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) =>
                  setFormData({ ...formData, latitude: e.target.value })
                }
                placeholder="Ej: -26.9341"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="longitude">Longitud *</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) =>
                  setFormData({ ...formData, longitude: e.target.value })
                }
                placeholder="Ej: -58.6474"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="altitude">Altitud (m)</Label>
              <Input
                id="altitude"
                type="number"
                step="any"
                value={formData.altitude}
                onChange={(e) =>
                  setFormData({ ...formData, altitude: e.target.value })
                }
                placeholder="Ej: 150"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="source_type">Tipo de Fuente</Label>
              <Select
                value={formData.source_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, source_type: value })
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GPS">GPS</SelectItem>
                  <SelectItem value="Manual">Manual</SelectItem>
                  <SelectItem value="Mapa">Mapa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tag">Tag</Label>
              <Input
                id="tag"
                type="text"
                value={formData.tag}
                onChange={(e) =>
                  setFormData({ ...formData, tag: e.target.value })
                }
                placeholder="Ej: Punto A, Zona 1, etc."
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="id_locality">Localidad *</Label>
            <Select
              value={formData.id_locality}
              onValueChange={(value) =>
                setFormData({ ...formData, id_locality: value })
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione una localidad" />
              </SelectTrigger>
              <SelectContent>
                {localities.map((loc) => (
                  <SelectItem key={loc.id_locality} value={String(loc.id_locality)}>
                    {loc.locality_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ihh">IHH (Índice de Huella Humana)</Label>
              <Input
                id="ihh"
                type="number"
                step="any"
                value={formData.ihh}
                onChange={(e) =>
                  setFormData({ ...formData, ihh: e.target.value })
                }
                placeholder="Ej: 50"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="distance_to_river">Distancia al Río (m)</Label>
              <Input
                id="distance_to_river"
                type="number"
                step="any"
                value={formData.distance_to_river}
                onChange={(e) =>
                  setFormData({ ...formData, distance_to_river: e.target.value })
                }
                placeholder="Ej: 128.14"
                disabled={isLoading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="cursor-pointer">
              {isLoading ? "Creando..." : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
