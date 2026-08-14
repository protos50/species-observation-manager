import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePersonDto {
  @IsNotEmpty()
  @IsString()
  person_name: string;
  
  @IsNotEmpty()
  @IsString()
  person_lastname: string;
}
