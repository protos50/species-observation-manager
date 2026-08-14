import { Module } from '@nestjs/common';
import { ClimateDataService } from './climate-data.service';
import { ClimateDataController } from './climate-data.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ClimateDataController],
  providers: [ClimateDataService],
})
export class ClimateDataModule {}
