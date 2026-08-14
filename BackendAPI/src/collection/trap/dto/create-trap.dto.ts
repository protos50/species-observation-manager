import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTrapDto {
  @IsNotEmpty()
  @IsString()
  trap_name: string;
}
