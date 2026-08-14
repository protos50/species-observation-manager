import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateGeolocationDto {
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsNumber()
  altitude?: number;

  @IsOptional()
  @IsString()
  source_type?: string;

  @IsOptional()
  @IsString()
  tag?: string;
}
