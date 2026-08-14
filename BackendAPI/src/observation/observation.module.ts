import { Module } from '@nestjs/common';
import { ObservationService } from './observation.service';
import { ObservationController } from './observation.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ObservationController],
  providers: [ObservationService],
  exports: [ObservationService]
})
export class ObservationModule {}
