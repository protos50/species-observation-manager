import { Module } from '@nestjs/common';
import { TaxonService } from './taxon.service';
import { TaxonController } from './taxon.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TaxonController],
  providers: [TaxonService],
  exports: [TaxonService]
})
export class TaxonModule {}
