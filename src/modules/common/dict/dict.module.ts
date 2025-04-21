import { Module } from '@nestjs/common';
import { DictController } from './dict.controller';
import { DictService } from './dict.service';
import { PrismaService } from '@/prisma/prisma.service';
@Module({
    controllers: [DictController],
    providers: [DictService, PrismaService]
})
export class DictModule {}
