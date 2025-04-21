import { Module } from '@nestjs/common';
import { ClearChunksTaskService } from '@/tasks/clear_chunks_task';
import { TaskService } from './task.service';
import { PrismaService } from '@/prisma/prisma.service';
import { TaskController } from './task.controller';
@Module({
    controllers: [TaskController],
    providers: [PrismaService, TaskService, ClearChunksTaskService],
    exports: [TaskService]
})
export class TaskModule {}
