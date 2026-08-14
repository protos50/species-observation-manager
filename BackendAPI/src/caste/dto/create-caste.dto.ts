import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCasteDto {
  @IsNotEmpty()
  @IsString()
  caste_name: string;
}
