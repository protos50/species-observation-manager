import { PartialType } from '@nestjs/swagger';
import { CreatePreservationMethodDto } from './create-preservation-method.dto';

export class UpdatePreservationMethodDto extends PartialType(CreatePreservationMethodDto) {}
