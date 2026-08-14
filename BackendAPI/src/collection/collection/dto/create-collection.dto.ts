import { IsDate, IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCollectionDto {
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
  @IsDate()
  @Type(() => Date)
  collection_date: Date;

  @IsOptional()
  @IsInt()
  trap_number?: number;
}
