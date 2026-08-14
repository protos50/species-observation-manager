import { Module } from '@nestjs/common';
import { TrapService } from './trap.service';
import { TrapController } from './trap.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TrapController],
  providers: [TrapService],
  exports: [TrapService]
})
export class TrapModule {}
