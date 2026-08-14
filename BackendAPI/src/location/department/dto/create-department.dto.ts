import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateDepartmentDto {
  @IsNotEmpty()
  @IsInt()
  id_province: number;
  
  @IsNotEmpty()
  @IsString()
  department_name: string;
}
