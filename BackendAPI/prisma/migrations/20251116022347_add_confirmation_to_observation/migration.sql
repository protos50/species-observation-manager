-- AlterTable
ALTER TABLE "Observation" ADD COLUMN     "confirmation_date" DATE,
ADD COLUMN     "id_confirmer" INTEGER;

-- AddForeignKey
ALTER TABLE "Observation" ADD CONSTRAINT "fk_observation_confirmer" FOREIGN KEY ("id_confirmer") REFERENCES "Person"("id_person") ON DELETE SET NULL ON UPDATE CASCADE;
