import { PartialType } from '@nestjs/swagger';
import { CreateCasteDto } from './create-caste.dto';

export class UpdateCasteDto extends PartialType(CreateCasteDto) {}
