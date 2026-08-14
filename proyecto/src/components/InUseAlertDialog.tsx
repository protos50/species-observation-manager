"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDateLocal } from "@/lib/utils/dateUtils";
import { AlertCircle } from "lucide-react";

interface InUseInfo {
  inUse: boolean;
  count: number;
  observations?: Array<{
    id_observation: number;
    taxon_name?: string;
    locality_name?: string;
    collection_date?: string;
  }>;
}

interface InUseAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inUseInfo: InUseInfo | null;
  onConfirm: () => void;
  title: string;
  description: string;
  itemName?: string;
}


export function InUseAlertDialog({
  open,
  onOpenChange,
  inUseInfo,
  onConfirm,
  title,
  description,
  itemName,
}: InUseAlertDialogProps) {
  const hasValidObservations = 
    inUseInfo?.observations && 
    Array.isArray(inUseInfo.observations) && 
    inUseInfo.observations.length > 0 &&
    inUseInfo.observations.some(obs => obs && obs.id_observation);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {hasValidObservations ? (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm font-semibold text-amber-900">
                ⚠️ {inUseInfo.count} observación{inUseInfo.count !== 1 ? 'es' : ''} {inUseInfo.count !== 1 ? 'se verán afectadas' : 'se verá afectada'}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Observaciones que lo utilizan:</p>
              {inUseInfo.observations
                .filter(obs => obs && obs.id_observation)
                .map((obs, idx) => (
                  <div key={obs.id_observation || idx} className="p-2 bg-muted rounded text-sm">
                    <p>
                      <strong>ID:</strong> {obs.id_observation}
                    </p>
                    {obs.taxon_name && (
                      <p>
                        <strong>Taxón:</strong> {obs.taxon_name}
                      </p>
                    )}
                    {obs.locality_name && (
                      <p>
                        <strong>Localidad:</strong> {obs.locality_name}
                      </p>
                    )}
                    {obs.collection_date && (
                      <p>
                        <strong>Fecha Colección:</strong> {formatDateLocal(obs.collection_date)}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">
              ✓ Este registro no está siendo utilizado por ninguna observación.
            </p>
            <p className="text-xs text-green-700 mt-1">
              Se puede eliminar de forma segura.
            </p>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            Eliminar de Todas Formas
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
