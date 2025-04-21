// 清理切片任务
import { UploadService } from '@/modules/common/upload/upload.service';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { FileMergeStatus } from '@prisma/client';
@Injectable()
export class ClearChunksTaskService implements OnModuleInit {
    uploadService: any;
    constructor(private readonly moduleRef: ModuleRef) {}
    onModuleInit() {
        this.prismaService = this.moduleRef.get(PrismaService, { strict: false });
        this.uploadService = this.moduleRef.get(UploadService, { strict: false });
    }
    private prismaService!: PrismaService;
    clearMergeFilesChunksTask = async () => {
        // 查询所有完成合并的文件 file_uid user_id
        const MergeFiles = await this.prismaService.shiro_file_merge.findMany({
            where: {
                status: FileMergeStatus.MERGE_SUCCESS
            },
            select: {
                file_uid: true,
                user_id: true
            }
        });
        const ClearChunkTask = MergeFiles.map((mergeFile) => {
            return this.uploadService.clearMergeChunks(mergeFile.file_uid);
        });
        await Promise.all(ClearChunkTask);
    };
}
