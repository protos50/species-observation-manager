import { PartialType } from '@nestjs/swagger';
import { CreateTaxonDto } from './create-taxon.dto';

export class UpdateTaxonDto extends PartialType(CreateTaxonDto) {}
