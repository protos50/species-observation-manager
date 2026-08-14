import { IsNotEmpty, IsString } from 'class-validator';

export class CreateEnvironmentDto {
  @IsNotEmpty()
  @IsString()
  environment_name: string;
}
