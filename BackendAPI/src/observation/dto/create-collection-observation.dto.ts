import { IsDate, IsInt, IsNotEmpty, IsOptional, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCollectionObservationDto {
  // Collection fields
  @IsNotEmpty()
  @IsInt()
  id_person: number;
  
  @IsNotEmpty()
  @IsInt()
  id_preservation_method: number;
  
  @IsNotEmpty()
  @IsInt()
  id_trap: number;
  
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  collection_date: Date;
  
  @IsOptional()
  @IsInt()
  trap_number?: number;
  
  // Observation fields
  @IsNotEmpty()
  @IsInt()
  id_taxon: number;
  
  @IsNotEmpty()
  @IsInt()
  id_geolocation: number;
  
  @IsOptional()
  @IsInt()
  id_environment?: number;
  
  @IsOptional()
  @IsInt()
  id_caste?: number;
  
  @IsOptional()
  @IsInt()
  abundance?: number;
  
  @IsOptional()
  @IsInt()
  id_identifier?: number;
  
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  identification_date?: Date;
  
  @IsOptional()
  @IsInt()
  id_confirmer?: number;
  
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  confirmation_date?: Date;
  
  @IsOptional()
  @IsString()
  biology_notes?: string;
  
  @IsOptional()
  @IsString()
  general_observations?: string;
  
  @IsOptional()
  @IsString()
  conservation_status?: string;
}
