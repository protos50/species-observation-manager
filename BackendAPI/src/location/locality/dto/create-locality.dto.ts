import { IsNotEmpty, IsString, IsInt, IsOptional } from 'class-validator';

export class CreateLocalityDto {
  @IsNotEmpty()
  @IsInt()
  id_department: number;
  
  // Now environments are managed through LocalityEnvironment junction table
  // Removed id_environment field
  
  @IsNotEmpty()
  @IsString()
  locality_name: string;
}
