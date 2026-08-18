"use client";

import { useState } from "react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Triangle,
  Edit3,
  Trash2,
  Hash,
  ChevronRight,
} from "lucide-react";
import { Taxon } from "@/lib/api/taxonomy";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { EditTaxonDialog } from "./EditTaxonDialog";
import { CanWrite } from "@/components/CanWrite";

interface TaxonDetailsSheetProps {
  open: boolean;
  onClose: () => void;
  taxon: Taxon | null;
  onDelete?: (id: number) => void;
  onUpdated?: (taxon: Taxon) => void;
}

export function TaxonDetailsSheet({
  open,
  onClose,
  taxon,
  onDelete,
  onUpdated,
}: TaxonDetailsSheetProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent
          side="right"
          className="w-full max-w-[100vw] sm:w-[420px] md:w-[500px] lg:w-[560px] p-0 overflow-y-auto max-h-screen"
        >
          <SheetHeader>
            <VisuallyHidden>
              <SheetTitle>Detalles del Taxón</SheetTitle>
            </VisuallyHidden>
          </SheetHeader>

          {taxon && (
            <div className="p-2 xs:p-3 sm:p-4 space-y-2 xs:space-y-3 sm:space-y-4 bg-slate-50/30 min-h-0 max-h-[calc(100vh-2rem)] overflow-y-auto">
              {/* Información Principal */}
              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-2 xs:p-3 sm:p-4 -mt-4">
                  <div className="flex items-center mb-4 ">
                    <Hash className="h-4 w-4 text-slate-500" />
                    <h3 className="font-medium text-slate-900">
                      Detalles del Taxón
                    </h3>
                  </div>

                  <div className="space-y-2 xs:space-y-3 sm:space-y-4">
                    <div className="p-2 xs:p-3 sm:p-4 bg-gradient-to-r from-blue-50/20 to-indigo-50 rounded-lg border">
                      <label className="text-xs font-medium text-blue-800 uppercase tracking-wider mb-1 block">
                        Nombre Científico
                      </label>
                      <div className="text-base sm:text-lg font-semibold text-slate-900">
                        {taxon.name}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 xs:gap-3">
                      <div className="p-1.5 xs:p-2 sm:p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <label className="text-xs font-medium text-slate-600 uppercase tracking-wider mb-1 block">
                          Identificador
                        </label>
                        <div className="text-xs sm:text-sm font-mono text-slate-700 bg-white px-2 py-1 rounded border">
                          #{taxon.id_taxon}
                        </div>
                      </div>
                      <div className="p-1.5 xs:p-2 sm:p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <label className="text-xs font-medium text-slate-600 uppercase tracking-wider mb-1 block">
                          Nivel Taxonómico
                        </label>
                        <div className="text-xs sm:text-sm font-medium text-slate-700 bg-white px-2 py-1 rounded border">
                          {taxon.taxonomic_level?.name ?? "No especificado"}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Jerarquía Taxonómica */}
              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-2 xs:p-3 sm:p-4 -mt-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Triangle className="h-4 w-4 text-green-600" />
                    <h3 className="font-medium text-slate-900">
                      Jerarquía Taxonómica
                    </h3>
                  </div>

                  <div className="space-y-1.5 xs:space-y-2 sm:space-y-3">
                    {taxon.parent ? (
                      <div className="relative">
                        <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 p-1.5 xs:p-2 sm:p-3 bg-green-50 rounded-lg border border-green-100">
                          <div className="flex items-center gap-2 flex-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <div>
                              <div className="text-xs sm:text-sm font-medium text-green-800">
                                {taxon.parent.name}
                              </div>
                              <div className="text-xs text-green-600">
                                {taxon.parent.taxonomic_level?.name ??
                                  (taxon.parent.id_taxonomic_level
                                    ? `Nivel ${taxon.parent.id_taxonomic_level}`
                                    : "Nivel no especificado")}
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="absolute left-4 top-full w-0.5 h-3 bg-green-200"></div>
                      </div>
                    ) : (
                      <div className="p-1.5 xs:p-2 sm:p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                          <span className="text-xs sm:text-sm text-amber-700 font-medium">
                            Taxón raíz - Sin padre asignado
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 p-1.5 xs:p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-center gap-2 flex-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div>
                          <div className="text-xs sm:text-sm font-medium text-blue-800">
                            {taxon.name}
                          </div>
                          <div className="text-xs text-blue-600">
                            Taxón actual
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <CanWrite>
                {/* Acciones */}
                <Card className="border-0 shadow-sm bg-white">
                  <CardContent className="p-2 xs:p-3 sm:p-4 -mt-4">
                    <h3 className="font-medium text-slate-900 mb-4">Acciones</h3>

                    <div className="space-y-1 xs:space-y-1.5 sm:space-y-2">
                      <Button
                        variant="outline"
                        className="w-full justify-start h-10 xs:h-12 sm:h-11 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors text-xs xs:text-sm sm:text-base"
                        onClick={() => setEditDialogOpen(true)}
                      >
                        <Edit3 className="h-3 w-3 xs:h-4 xs:w-4 mr-1.5 xs:mr-2 sm:mr-3 text-slate-600" />
                        <span className="font-medium">
                          Editar información del taxón
                        </span>
                      </Button>

                      <Separator className="my-3" />

                      <Button
                        variant="outline"
                        className="w-full justify-start h-10 xs:h-12 sm:h-11 border-red-200 text-red-700 cursor-pointer text-xs xs:text-sm sm:text-base"
                        onClick={() => {
                          if (taxon && onDelete) {
                            onDelete(taxon.id_taxon);
                            onClose();
                          }
                        }}
                      >
                        <Trash2 className="h-3 w-3 xs:h-4 xs:w-4 mr-1.5 xs:mr-2 sm:mr-3" />
                        <span className="font-medium">Eliminar taxón</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </CanWrite>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Modal de edición */}
      <EditTaxonDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        taxon={taxon}
        onTaxonUpdated={onUpdated}
      />
    </>
  );
}
