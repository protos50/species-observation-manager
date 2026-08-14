import { IsNotEmpty, IsNumber, IsOptional, IsString, IsInt } from 'class-validator';

export class CreateGeolocationDto {
  @IsNotEmpty()
  @IsNumber()
  latitude: number;

  @IsNotEmpty()
  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsNumber()
  altitude?: number;

  @IsNotEmpty()
  @IsString()
  source_type: string;

  @IsOptional()
  @IsString()
  tag?: string;

  @IsNotEmpty()
  @IsInt()
  id_locality: number;

  @IsOptional()
  @IsNumber()
  ihh?: number;

  @IsOptional()
  @IsNumber()
  distance_to_river?: number;
}
