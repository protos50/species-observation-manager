import { Module } from '@nestjs/common';
import { CasteService } from './caste.service';
import { CasteController } from './caste.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CasteController],
  providers: [CasteService],
})
export class CasteModule {}
