import { PartialType } from '@nestjs/swagger';
import { CreateClimateDatumDto } from './create-climate-datum.dto';

export class UpdateClimateDatumDto extends PartialType(CreateClimateDatumDto) {}
