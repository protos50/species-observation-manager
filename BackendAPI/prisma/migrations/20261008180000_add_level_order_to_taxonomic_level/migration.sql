-- AlterTable
ALTER TABLE "TaxonomicLevel" ADD COLUMN "level_order" INTEGER;

-- Hasta ahora la jerarquía salía del id, porque el script de importación creó
-- los niveles en orden (Kingdom primero, Species último). Se conserva ese orden.
UPDATE "TaxonomicLevel" SET "level_order" = "id_taxonomic_level";

ALTER TABLE "TaxonomicLevel" ALTER COLUMN "level_order" SET NOT NULL;
