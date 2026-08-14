import { Module } from '@nestjs/common';
import { PreservationMethodService } from './preservation-method.service';
import { PreservationMethodController } from './preservation-method.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PreservationMethodController],
  providers: [PreservationMethodService],
  exports: [PreservationMethodService]
})
export class PreservationMethodModule {}
