import { Module } from '@nestjs/common';
import { TaxonomicLevelService } from './taxonomic-level.service';
import { TaxonomicLevelController } from './taxonomic-level.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TaxonomicLevelController],
  providers: [TaxonomicLevelService],
  exports: [TaxonomicLevelService]
})
export class TaxonomicLevelModule {}
