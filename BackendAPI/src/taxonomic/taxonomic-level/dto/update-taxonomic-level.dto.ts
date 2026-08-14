import { PartialType } from '@nestjs/swagger';
import { CreateTaxonomicLevelDto } from './create-taxonomic-level.dto';

export class UpdateTaxonomicLevelDto extends PartialType(CreateTaxonomicLevelDto) {}
