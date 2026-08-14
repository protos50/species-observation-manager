import { IsInt, IsNotEmpty, IsOptional, IsString, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateObservationDto {
  @IsNotEmpty()
  @IsInt()
  id_taxon: number;
  
  @IsNotEmpty()
  @IsInt()
  id_collection: number;
  
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
