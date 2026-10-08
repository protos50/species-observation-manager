import { IsString, IsNotEmpty, IsInt, IsOptional } from 'class-validator';

export class CreateTaxonomicLevelDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  // Nivel que queda justo arriba de este en la jerarquía; null lo pone primero.
  // Al crear, si no se manda, el nivel va último; al editar, no se mueve.
  @IsOptional()
  @IsInt()
  above_level_id?: number | null;
}
