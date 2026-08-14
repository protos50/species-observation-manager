import { Module } from '@nestjs/common';
import { EnvironmentService } from './environment.service';
import { EnvironmentController } from './environment.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [EnvironmentController],
  providers: [EnvironmentService, PrismaService],
  exports: [EnvironmentService],
})
export class EnvironmentModule {}
