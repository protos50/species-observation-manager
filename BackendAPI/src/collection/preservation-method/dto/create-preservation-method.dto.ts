import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePreservationMethodDto {
  @IsNotEmpty()
  @IsString()
  method_name: string;
}
