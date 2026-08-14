import { IsDate, IsInt, IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchObservationDto {
  // Búsqueda por IDs (mantener compatibilidad)
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  taxon_id?: number;
  
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  locality_id?: number;
  
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  collector_id?: number;
  
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  confirmer_id?: number;
  
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  identifier_id?: number;
  
  // Búsqueda por nombres/texto (más flexible)
  @IsOptional()
  @IsString()
  taxon_name?: string;
  
  @IsOptional()
  @IsString()
  q?: string;
  
  @IsOptional()
  @IsString()
  confirmer_name?: string;
  
  @IsOptional()
  @IsString()
  identifier_name?: string;
  
  @IsOptional()
  @IsString()
  taxonomic_level?: string;
  
  @IsOptional()
  @IsString()
  caste?: string;
  
  @IsOptional()
  @IsString()
  environment_name?: string;
  
  @IsOptional()
  @IsString()
  conservation_status?: string;
  
  @IsOptional()
  @IsString()
  person_name?: string;
  
  @IsOptional()
  @IsString()
  locality_name?: string;
  
  @IsOptional()
  @IsString()
  department_name?: string;
  
  @IsOptional()
  @IsString()
  province_name?: string;
  
  @IsOptional()
  @IsString()
  country_name?: string;

  @IsOptional()
  @IsString()
  geolocation_tag?: string;

  // Búsqueda por fechas
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  start_date?: Date;
  
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  end_date?: Date;
  
  // Búsqueda por coordenadas
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;
  
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;
  
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  radius?: number; // Radio en metros para búsqueda por coordenadas
  
  // Abundancia
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  min_abundance?: number;
  
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  max_abundance?: number;
  
  // Paginación
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number = 1;
  
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number = 10;
}
