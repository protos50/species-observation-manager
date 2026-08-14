import { Module } from '@nestjs/common';
import { TaxonomicLevelModule } from './taxonomic-level/taxonomic-level.module';
import { TaxonModule } from './taxon/taxon.module';

@Module({
  imports: [TaxonomicLevelModule, TaxonModule],
  exports: [TaxonomicLevelModule, TaxonModule]
})
export class TaxonomicModule {}
