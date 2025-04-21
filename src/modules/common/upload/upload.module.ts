import { PrismaService } from '@/prisma/prisma.service';
import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { ClearChunksTaskService } from '@/tasks/clear_chunks_task';

@Module({
    imports: [],
    controllers: [UploadController],
    providers: [UploadService, PrismaService, ClearChunksTaskService]
})
export class UploadModule {
    constructor() {}
}
