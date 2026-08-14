import { IsOptional, IsString, IsDateString } from 'class-validator';

export class ExportCsvDto {
  @IsOptional()
  @IsString()
  taxon_name?: string;

  @IsOptional()
  @IsString()
  locality_name?: string;

  @IsOptional()
  @IsString()
  environment_name?: string;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @IsString()
  format?: 'csv' | 'json' = 'csv';
}
