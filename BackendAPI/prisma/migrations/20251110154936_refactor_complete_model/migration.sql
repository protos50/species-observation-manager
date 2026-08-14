-- CreateTable
CREATE TABLE "Rol" (
    "role_id" SERIAL NOT NULL,
    "name" VARCHAR(20) NOT NULL,
    "description" VARCHAR(255),
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "pk_rol" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "User" (
    "user_id" SERIAL NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(30) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,
    "role_id" INTEGER NOT NULL,

    CONSTRAINT "pk_user" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "TaxonomicLevel" (
    "id_taxonomic_level" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "pk_taxonomic_level" PRIMARY KEY ("id_taxonomic_level")
);

-- CreateTable
CREATE TABLE "Author" (
    "id_author" SERIAL NOT NULL,
    "author_name" VARCHAR(100) NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "pk_author" PRIMARY KEY ("id_author")
);

-- CreateTable
CREATE TABLE "Taxon" (
    "id_taxon" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "id_taxonomic_level" INTEGER NOT NULL,
    "parent_id" INTEGER,
    "id_author" INTEGER,
    "description_year" INTEGER,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "pk_taxon" PRIMARY KEY ("id_taxon")
);

-- CreateTable
CREATE TABLE "Environment" (
    "id_environment" SERIAL NOT NULL,
    "environment_name" TEXT NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "pk_environment" PRIMARY KEY ("id_environment")
);

-- CreateTable
CREATE TABLE "Caste" (
    "id_caste" SERIAL NOT NULL,
    "caste_name" VARCHAR(50) NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "pk_caste" PRIMARY KEY ("id_caste")
);

-- CreateTable
CREATE TABLE "Trap" (
    "id_trap" SERIAL NOT NULL,
    "trap_name" TEXT NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "pk_trap" PRIMARY KEY ("id_trap")
);

-- CreateTable
CREATE TABLE "PreservationMethod" (
    "id_preservation_method" SERIAL NOT NULL,
    "method_name" TEXT NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "pk_preservation_method" PRIMARY KEY ("id_preservation_method")
);

-- CreateTable
CREATE TABLE "Person" (
    "id_person" SERIAL NOT NULL,
    "person_name" TEXT NOT NULL,
    "person_lastname" TEXT NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "pk_person" PRIMARY KEY ("id_person")
);

-- CreateTable
CREATE TABLE "Country" (
    "id_country" SERIAL NOT NULL,
    "country_name" TEXT NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "pk_country" PRIMARY KEY ("id_country")
);

-- CreateTable
CREATE TABLE "Province" (
    "id_province" SERIAL NOT NULL,
    "id_country" INTEGER NOT NULL,
    "province_name" TEXT NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "pk_province" PRIMARY KEY ("id_province")
);

-- CreateTable
CREATE TABLE "Department" (
    "id_department" SERIAL NOT NULL,
    "id_province" INTEGER NOT NULL,
    "department_name" TEXT NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "pk_department" PRIMARY KEY ("id_department")
);

-- CreateTable
CREATE TABLE "Locality" (
    "id_locality" SERIAL NOT NULL,
    "id_department" INTEGER NOT NULL,
    "locality_name" TEXT NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "pk_locality" PRIMARY KEY ("id_locality")
);

-- CreateTable
CREATE TABLE "Geolocation" (
    "id_geolocation" SERIAL NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "altitude" DOUBLE PRECISION,
    "source_type" TEXT NOT NULL,
    "tag" TEXT,
    "ihh" DOUBLE PRECISION,
    "distance_to_river" DOUBLE PRECISION,
    "id_locality" INTEGER NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "pk_geolocation" PRIMARY KEY ("id_geolocation")
);

-- CreateTable
CREATE TABLE "ClimateData" (
    "id_climate_data" SERIAL NOT NULL,
    "id_locality" INTEGER NOT NULL,
    "climate_date" DATE NOT NULL,
    "t_min" DOUBLE PRECISION,
    "t_max" DOUBLE PRECISION,
    "t_med" DOUBLE PRECISION,
    "hr_min" DOUBLE PRECISION,
    "hr_max" DOUBLE PRECISION,
    "hr_med" DOUBLE PRECISION,
    "pp_14_days_before" DOUBLE PRECISION,
    "pp_30_days_before" DOUBLE PRECISION,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "pk_climate_data" PRIMARY KEY ("id_climate_data")
);

-- CreateTable
CREATE TABLE "Collection" (
    "id_collection" SERIAL NOT NULL,
    "id_person" INTEGER NOT NULL,
    "id_preservation_method" INTEGER NOT NULL,
    "id_trap" INTEGER NOT NULL,
    "collection_date" DATE NOT NULL,
    "trap_number" INTEGER,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "pk_collection" PRIMARY KEY ("id_collection")
);

-- CreateTable
CREATE TABLE "Observation" (
    "id_observation" SERIAL NOT NULL,
    "id_taxon" INTEGER NOT NULL,
    "id_collection" INTEGER NOT NULL,
    "id_geolocation" INTEGER NOT NULL,
    "id_environment" INTEGER,
    "id_caste" INTEGER,
    "id_climate_data" INTEGER,
    "abundance" INTEGER,
    "deleted_at" TIMESTAMPTZ,
    "id_identifier" INTEGER,
    "identification_date" DATE,
    "biology_notes" TEXT,
    "general_observations" TEXT,
    "conservation_status" VARCHAR(50),

    CONSTRAINT "pk_observation" PRIMARY KEY ("id_observation")
);

-- CreateTable
CREATE TABLE "Service" (
    "id_service" SERIAL NOT NULL,
    "service_name" VARCHAR(100) NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "pk_service" PRIMARY KEY ("id_service")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id_contact" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "id_service" INTEGER NOT NULL,

    CONSTRAINT "pk_contact" PRIMARY KEY ("id_contact")
);

-- CreateIndex
CREATE UNIQUE INDEX "uq_rol_name" ON "Rol"("name");

-- CreateIndex
CREATE UNIQUE INDEX "uq_user_email" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TaxonomicLevel_name_key" ON "TaxonomicLevel"("name");

-- CreateIndex
CREATE UNIQUE INDEX "unique_climate_data_locality_date" ON "ClimateData"("id_locality", "climate_date");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "fk_user_rol" FOREIGN KEY ("role_id") REFERENCES "Rol"("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Taxon" ADD CONSTRAINT "fk_taxon_taxonomic_level" FOREIGN KEY ("id_taxonomic_level") REFERENCES "TaxonomicLevel"("id_taxonomic_level") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Taxon" ADD CONSTRAINT "fk_taxon_parent" FOREIGN KEY ("parent_id") REFERENCES "Taxon"("id_taxon") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Taxon" ADD CONSTRAINT "fk_taxon_author" FOREIGN KEY ("id_author") REFERENCES "Author"("id_author") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Province" ADD CONSTRAINT "fk_province_country" FOREIGN KEY ("id_country") REFERENCES "Country"("id_country") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "fk_department_province" FOREIGN KEY ("id_province") REFERENCES "Province"("id_province") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Locality" ADD CONSTRAINT "fk_locality_department" FOREIGN KEY ("id_department") REFERENCES "Department"("id_department") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Geolocation" ADD CONSTRAINT "fk_geolocation_locality" FOREIGN KEY ("id_locality") REFERENCES "Locality"("id_locality") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClimateData" ADD CONSTRAINT "fk_climate_data_locality" FOREIGN KEY ("id_locality") REFERENCES "Locality"("id_locality") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "fk_collection_person" FOREIGN KEY ("id_person") REFERENCES "Person"("id_person") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "fk_collection_preservation_method" FOREIGN KEY ("id_preservation_method") REFERENCES "PreservationMethod"("id_preservation_method") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "fk_collection_trap" FOREIGN KEY ("id_trap") REFERENCES "Trap"("id_trap") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observation" ADD CONSTRAINT "fk_observation_taxon" FOREIGN KEY ("id_taxon") REFERENCES "Taxon"("id_taxon") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observation" ADD CONSTRAINT "fk_observation_collection" FOREIGN KEY ("id_collection") REFERENCES "Collection"("id_collection") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observation" ADD CONSTRAINT "fk_observation_geolocation" FOREIGN KEY ("id_geolocation") REFERENCES "Geolocation"("id_geolocation") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observation" ADD CONSTRAINT "fk_observation_environment" FOREIGN KEY ("id_environment") REFERENCES "Environment"("id_environment") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observation" ADD CONSTRAINT "fk_observation_caste" FOREIGN KEY ("id_caste") REFERENCES "Caste"("id_caste") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observation" ADD CONSTRAINT "fk_observation_identifier" FOREIGN KEY ("id_identifier") REFERENCES "Person"("id_person") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observation" ADD CONSTRAINT "fk_observation_climate_data" FOREIGN KEY ("id_climate_data") REFERENCES "ClimateData"("id_climate_data") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "fk_contact_service" FOREIGN KEY ("id_service") REFERENCES "Service"("id_service") ON DELETE RESTRICT ON UPDATE CASCADE;
