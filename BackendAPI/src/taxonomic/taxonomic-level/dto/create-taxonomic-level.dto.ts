import { IsString, IsNotEmpty } from 'class-validator';

export class CreateTaxonomicLevelDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
