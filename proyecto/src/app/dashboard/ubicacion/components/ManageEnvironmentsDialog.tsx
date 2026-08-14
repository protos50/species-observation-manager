"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Leaf, Loader2 } from "lucide-react";
import { locationApi } from "@/lib/api/location";

interface Environment {
  id_environment: number;
  environment_name: string;
}

interface ManageEnvironmentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  localityId: number;
  localityName: string;
  currentEnvironments: Environment[];
}

export function ManageEnvironmentsDialog({
  open,
  onOpenChange,
  onSuccess,
  localityId,
  localityName,
  currentEnvironments
}: ManageEnvironmentsDialogProps) {
  const [allEnvironments, setAllEnvironments] = useState<Environment[]>([]);
  const [selectedEnvironmentIds, setSelectedEnvironmentIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      loadEnvironments();
      setSelectedEnvironmentIds(currentEnvironments.map(env => env.id_environment));
    }
  }, [open, currentEnvironments]);

  const loadEnvironments = async () => {
    try {
      setIsLoading(true);
      const environments = await locationApi.environments.getAll();
      setAllEnvironments(environments);
    } catch (error) {
      console.error('Error loading environments:', error);
      alert('Error al cargar ambientes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnvironmentToggle = (environmentId: number, checked: boolean) => {
    if (checked) {
      setSelectedEnvironmentIds(prev => [...prev, environmentId]);
    } else {
      setSelectedEnvironmentIds(prev => prev.filter(id => id !== environmentId));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Note: Environment associations are now managed at the observation level,
    // not at the locality level. This dialog is kept for UI compatibility
    // but doesn't perform any action.
    alert('Los ambientes ahora se asignan directamente a las observaciones, no a las localidades.');
    onOpenChange(false);
  };

  const handleCancel = () => {
    setSelectedEnvironmentIds(currentEnvironments.map(env => env.id_environment));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-emerald-600" />
              Gestionar Ambientes
            </DialogTitle>
            <DialogDescription>
              Selecciona los ambientes asociados a la localidad <strong>{localityName}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Cargando ambientes...</span>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <Label className="text-base font-medium">
                    Ambientes disponibles ({allEnvironments.length})
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Una localidad puede tener múltiples ambientes
                  </p>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {allEnvironments.map((environment) => {
                    const isSelected = selectedEnvironmentIds.includes(environment.id_environment);
                    return (
                      <div 
                        key={environment.id_environment}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50"
                      >
                        <Checkbox
                          id={`env-${environment.id_environment}`}
                          checked={isSelected}
                          onCheckedChange={(checked: boolean) => 
                            handleEnvironmentToggle(environment.id_environment, checked)
                          }
                          disabled={isSaving}
                        />
                        <Label 
                          htmlFor={`env-${environment.id_environment}`}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Leaf className="h-4 w-4 text-emerald-500" />
                            <span>{environment.environment_name}</span>
                          </div>
                        </Label>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                  <Label className="text-sm font-medium">
                    Ambientes seleccionados ({selectedEnvironmentIds.length})
                  </Label>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedEnvironmentIds.length === 0 ? (
                      <span className="text-sm text-muted-foreground">
                        Ningún ambiente seleccionado
                      </span>
                    ) : (
                      allEnvironments
                        .filter(env => selectedEnvironmentIds.includes(env.id_environment))
                        .map(env => (
                          <Badge 
                            key={env.id_environment} 
                            variant="secondary"
                            className="bg-emerald-100 text-emerald-800 border-emerald-200"
                          >
                            {env.environment_name}
                          </Badge>
                        ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Guardando...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
