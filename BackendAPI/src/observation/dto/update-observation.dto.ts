import { PartialType } from '@nestjs/swagger';
import { CreateObservationDto } from './create-observation.dto';
import { IsInt, IsOptional } from 'class-validator';

export class UpdateObservationDto extends PartialType(CreateObservationDto) {
  // trap_number pertenece a Collection, pero lo aceptamos aquí para updates
  @IsOptional()
  @IsInt()
  trap_number?: number;
}
