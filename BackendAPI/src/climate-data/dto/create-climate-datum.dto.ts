import { IsNotEmpty, IsInt, IsDate, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateClimateDatumDto {
  @IsNotEmpty()
  @IsInt()
  id_locality: number;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  climate_date: Date;

  @IsOptional()
  @IsNumber()
  t_min?: number;

  @IsOptional()
  @IsNumber()
  t_max?: number;

  @IsOptional()
  @IsNumber()
  t_med?: number;

  @IsOptional()
  @IsNumber()
  hr_min?: number;

  @IsOptional()
  @IsNumber()
  hr_max?: number;

  @IsOptional()
  @IsNumber()
  hr_med?: number;

  @IsOptional()
  @IsNumber()
  pp_14_days_before?: number;

  @IsOptional()
  @IsNumber()
  pp_30_days_before?: number;
}
