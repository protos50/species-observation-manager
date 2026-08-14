import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTaxonDto {
  @IsNotEmpty()
  @IsString()
  name: string;
  
  @IsNotEmpty()
  @IsInt()
  id_taxonomic_level: number;
  
  @IsOptional()
  @IsInt()
  parent_id?: number | null;

  @IsOptional()
  @IsInt()
  id_author?: number | null;
}
