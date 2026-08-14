import { IsNotEmpty, IsString, IsInt } from 'class-validator';

export class CreateProvinceDto {
  @IsNotEmpty()
  @IsInt()
  id_country: number;
  
  @IsNotEmpty()
  @IsString()
  province_name: string;
}
