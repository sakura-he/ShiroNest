import { ErrorEnum } from '@/common/constants/error_code.constant';
import { BusinessException } from '@/common/exceptions/biz.exceptions';
import { PrismaService } from '@/prisma/prisma.service';
import { ClearChunksTaskService } from '@/tasks/clear_chunks_task';
import { Injectable } from '@nestjs/common';
import { FileMergeStatus, shiro_file_chunk } from '@prisma/client';
import dayjs from 'dayjs';
import { createHash } from 'node:crypto';
import * as fs from 'node:fs';
import * as fsp from 'node:fs/promises';
import * as path from 'node:path';

/**
 * 文件上传服务
 * 处理文件切片上传、合并等相关功能
 */
@Injectable()
export class UploadService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly clearChunksTaskService: ClearChunksTaskService
    ) {}

    /**
     * 通过user_id 和 file_merge_id 检查指定的文件记录
     * @param userId 用户ID
     * @param fileMergeId 合并文件记录ID
     */
    async getFileMergeInfo(userId: number | undefined, fileMergeId: number) {
        const FileMergeInfo = await this.prismaService.shiro_file_merge.findUnique({
            where: { id: fileMergeId, user_id: userId, is_delete: false },
            omit: {
                created_at: true,
                is_delete: true,
                ref_file_id: true
            }
        });
        return FileMergeInfo;
    }

    /**
     * 保存文件切片
     * @param chunkInfo 切片信息
     * @param userId 用户ID
     */
    async saveFileChunk(chunkInfo: any, userId: number) {
        const ChunkFilePath = path.join(process.cwd(), 'chunks', chunkInfo.chunk_path);
        // 校验前端传的切片 hash 是否与后端一致
        await this.validateChunkHash(ChunkFilePath, chunkInfo.chunk_hash);
        const ExistedChunk = await this.findExistedChunk(chunkInfo.chunk_hash);
        let CreateChunkData = {
            id: undefined,
            user_id: userId,
            chunk_index: chunkInfo.chunk_index,
            chunk_hash: chunkInfo.chunk_hash,
            chunk_size: chunkInfo.chunk_size,
            chunk_path: ExistedChunk ? ExistedChunk.chunk_path : chunkInfo.chunk_path,
            chunk_name: ExistedChunk ? ExistedChunk.chunk_name : chunkInfo.chunk_name,
            file_size: chunkInfo.file_size,
            file_type: chunkInfo.file_type,
            file_hash: chunkInfo.file_hash,
            file_chunks_length: chunkInfo.file_chunks_length,
            file_name: chunkInfo.file_name,
            file_uid: chunkInfo.file_uid,
            is_delete: false,
            ref_chunk_id: ExistedChunk ? ExistedChunk.id : null
        };
        // 如果存在已上传的切片,则删除当前用户已上传的切片,使用查找到的已经上传过的切片
        if (ExistedChunk) {
            // 删除当前用户已上传的切片,并将切片的
        }
        // 创建文件切片记录并返回
        return await this.prismaService.shiro_file_chunk.create({
            data: CreateChunkData,
            omit: {
                created_at: true,
                file_merge_id: true,
                file_uid: true,
                is_delete: true,
                ref_chunk_id: true
            }
        });
    }

    /**
     * 根据上传切片hash,查找原始上传的切片
     * @param chunkHash 切片哈希值
     */
    private async findExistedChunk(chunkHash: string) {
        return this.prismaService.shiro_file_chunk.findFirst({
            where: {
                chunk_hash: chunkHash,
                ref_chunk_id: null
            },
            omit: {
                created_at: true,
                file_merge_id: true,
                file_name: true,
                file_uid: true,
                is_delete: true,
                ref_chunk_id: true
            }
        });
    }

    /**
     * 验证文件切片的哈希值是否匹配
     * @param chunkPath 要验证的切片的文件路径
     * @param expectedHash 期望的哈希值
     */
    private async validateChunkHash(chunkPath: string, expectedHash: string): Promise<void> {
        const ChunkBuffer = await fsp.readFile(chunkPath);
        const ActualHash = createHash('md5').update(ChunkBuffer).digest('hex');

        if (ActualHash !== expectedHash) {
            throw new BusinessException(ErrorEnum.FILE_CHUNK_HASH_NOT_MATCH);
        }
    }

    /**
     * 通过 user_id 和 file_uid 请求合并文件切片
     * @param userId 用户ID
     * @param fileUID 文件唯一标识
     */
    async mergeFileChunks(userId: number, fileUID: string) {
        // 获取文件的所有切片
        const FileChunks = await this.getChunkByFileUID(userId, fileUID);
        // 由于存在多个切片,且要合并的文件信息存在切片记录上
        // 取最后一个切片保存的文件信息为要合并的文件的文件信息
        const LastChunk = FileChunks[FileChunks.length - 1];
        const fileHash = LastChunk.file_hash;
        // 通过比较切片记录保存的数量是否同用户上传时记录的切片数量相等,判断切片是否完整
        if (FileChunks.length !== FileChunks[0].file_chunks_length) {
            throw new BusinessException(ErrorEnum.FILE_CHUNK_NOT_UPLOADED);
        }
        // 通过文件hash查找是否存在已合并的文件,复用合并完成的文件
        const ExistedMergedFile = await this.prismaService.shiro_file_merge.findFirst({
            where: { file_hash: fileHash, ref_file_id: null, status: FileMergeStatus.MERGE_SUCCESS },
            omit: {
                created_at: true,
                file_name: true,
                is_delete: true,
                ref_file_id: true,
                user_id: true
            }
        });
        if (ExistedMergedFile) {
            const MergedFileRef = await this.prismaService.shiro_file_merge.create({
                data: {
                    ...ExistedMergedFile,
                    id: undefined,
                    user_id: userId,
                    // 保持用户上传文件名
                    file_name: LastChunk.file_name,
                    is_delete: false,
                    // 保持用户上传文件唯一标识,从用户的切片记录中获取
                    file_uid: LastChunk.file_uid,
                    ref_file_id: ExistedMergedFile.id,
                    file_chunks: {
                        connect: (
                            await this.prismaService.shiro_file_chunk.findMany({
                                where: {
                                    file_hash: fileHash,
                                    user_id: userId,
                                    file_uid: LastChunk.file_uid
                                }
                            })
                        ).map((chunk) => ({ id: chunk.id }))
                    }
                },
                omit: {
                    created_at: true,
                    is_delete: true,
                    ref_file_id: true
                }
            });
            // 清理切片文件
            await this.clearMergeChunks(fileUID);
            return MergedFileRef;
        }

        // 合并切片
        const ChunksDir = path.join(process.cwd(), 'chunks');
        const UploadDateTime = dayjs(LastChunk.created_at);
        const MergePath = `merge/${UploadDateTime.format('YYYY/MM/DD')}`;
        const MergedFileName = `${UploadDateTime.format('HH:mm:ss')}-${Math.floor(Math.random() * 10000)}-${LastChunk.file_name}`;
        const MergeFileFullPath = path.resolve(process.cwd(), MergePath, MergedFileName);
        if (!fs.existsSync(MergePath)) {
            fs.mkdirSync(MergePath, { recursive: true });
        }

        // 在merge_file 表中添加条新的状态记录
        const MergeFile = await this.prismaService.shiro_file_merge.create({
            data: {
                file_hash: LastChunk.file_hash,
                file_name: LastChunk.file_name,
                file_path: path.join(MergePath, MergedFileName),
                file_size: LastChunk.file_size,
                file_type: LastChunk.file_type,
                file_uid: fileUID,
                ref_file_id: null,
                user_id: userId,
                status: FileMergeStatus.MERGE_ING // 初始状态：合并中
            }
        });

        const MergeStream = fs.createWriteStream(MergeFileFullPath);

        // 修改 processChunk 函数添加错误处理
        const processChunk = async () => {
            try {
                if (FileChunks.length === 0) {
                    MergeStream.end();
                    return;
                }
                const Chunk = FileChunks.shift();
                // 计算合并进度
                const MergeProgress = Math.floor(
                    ((LastChunk.file_chunks_length - FileChunks.length) / LastChunk.file_chunks_length) * 100
                );
                // 更新合并进度
                await this.prismaService.shiro_file_merge.update({
                    where: { id: MergeFile.id },
                    data: { merge_progress: MergeProgress }
                });
                const ChunkPath = path.join(ChunksDir, Chunk?.chunk_path || '');
                const ReadStream = fs.createReadStream(ChunkPath);

                ReadStream.on('error', async (error) => {
                    await this.prismaService.shiro_file_merge.update({
                        where: { id: MergeFile.id },
                        data: {
                            status: FileMergeStatus.MERGE_FAILED,
                            error_msg: `切片 ${Chunk?.chunk_path || '未知'} 读取失败: ${error.message}`
                        }
                    });
                    MergeStream.destroy();
                });

                ReadStream.pipe(MergeStream, { end: false });
                ReadStream.on('end', processChunk);
            } catch (error) {
                console.error('处理切片过程出错:', error);
            }
        };
        // 添加错误处理
        MergeStream.on('error', async (error) => {
            await this.prismaService.shiro_file_merge.update({
                where: { id: MergeFile.id },
                data: {
                    status: FileMergeStatus.MERGE_FAILED, // 更新状态为合并失败
                    error_msg: error.message // 记录错误信息
                }
            });
            MergeStream.destroy();
        });

        MergeStream.on('finish', async () => {
            try {
                let FileInfo = await this.prismaService.shiro_file_merge.update({
                    where: { id: MergeFile.id },
                    data: {
                        status: FileMergeStatus.MERGE_SUCCESS, // 更新状态为合并成功
                        merge_progress: 100,
                        file_chunks: {
                            connect: FileChunks.map((chunk) => ({ id: chunk.id }))
                        }
                    }
                });
                // 清理切片文件
                await this.clearMergeChunks(FileInfo.file_uid);
            } catch (error) {
                console.error('更新合并文件状态失败:', error);
                await this.prismaService.shiro_file_merge.update({
                    where: { id: MergeFile.id },
                    data: {
                        status: FileMergeStatus.MERGE_FAILED,
                        error_msg: '文件合并成功但更新数据库失败:' + (error as Error).message
                    }
                });
            }
        });
        processChunk();
        return MergeFile;
    }

    /**
     * 根据文件唯一标识获取文件的所有切片
     * @param userId 用户ID
     * @param fileUID 文件唯一标识
     */
    async getChunkByFileUID(userId: number, fileUID: string): Promise<shiro_file_chunk[]> {
        const FileChunks = await this.prismaService.shiro_file_chunk.findMany({
            where: { file_uid: fileUID, user_id: userId },
            orderBy: { chunk_index: 'asc' }
        });

        if (FileChunks.length === 0) {
            throw new BusinessException(ErrorEnum.FILE_CHUNK_NOT_FOUND);
        }
        return FileChunks;
    }
    /**
     * 清理文件对应的切片
     * 清理规则:
     * 如果该文件的切片属于引用的别的切片文件,直接删除
     * 如果该文件的切片属于原始上传的切片 1. 没有被别的切片记录引用的原始切片  直接删除
     *                              2. 被别的切片记录引用的原始切片      标记删除
     * @param fileUID 文件唯一标识
     */
    async clearMergeChunks(fileUID: string) {
        // 查询当前合并成功的文件对应的所有切片
        const CurrentFileChunks = await this.prismaService.shiro_file_chunk.findMany({
            where: { file_uid: fileUID }
        });

        if (!CurrentFileChunks.length) {
            return;
        }
        let ChunkGroups: {
            originChunks: shiro_file_chunk[]; // 存放原始切片id
            refChunks: shiro_file_chunk[]; // 存放属于引用别的原始切片的切片id
        } = {
            originChunks: [],
            refChunks: []
        };
        CurrentFileChunks.forEach((chunk) => {
            // 如果ref_chunk_id 为 null ,则属于原始切片
            if (chunk.ref_chunk_id !== null) {
                ChunkGroups.refChunks.push(chunk);
            } else {
                ChunkGroups.originChunks.push(chunk);
            }
        });
        console.log('ChunkGroups', ChunkGroups);
        // 如果是引用的切片直接删除
        if (ChunkGroups.refChunks.length) {
            let DeletedChunks = await this.prismaService.shiro_file_chunk.deleteMany({
                where: { id: { in: ChunkGroups.refChunks.map((chunk) => chunk.id) } }
            });
        }

        // 1. 没有被别的切片记录引用的原始切片  // 直接删除
        // 2. 被别的切片记录引用的原始切片  // 标记删除
        // 根据原始切片 id,筛选被别的引用切片引用的原始切片
        // 标记为删除状态,防止返回给原始上传用户
        if (ChunkGroups.originChunks.length) {
            const ReferencingOriginChunks = await this.prismaService.shiro_file_chunk.findMany({
                where: {
                    ref_chunk_id: { in: ChunkGroups.originChunks.map((chunk) => chunk.id) }
                },
                select: {
                    ref_chunk_id: true
                }
            });
            const ReferencingOriginChunkIds = [...new Set(ReferencingOriginChunks.map((chunk) => chunk.ref_chunk_id))];
            console.log('原始切片正在被别的切片使用', ReferencingOriginChunkIds);
            if (ReferencingOriginChunkIds.length) {
                // 标记为删除状态,防止返回给原始上传用户
                let DeletedChunks = await this.prismaService.shiro_file_chunk.updateMany({
                    where: { id: { in: ReferencingOriginChunkIds.filter((id): id is number => id !== null) } },
                    data: {
                        is_delete: true
                    }
                });
            }
            // 没有被引用的原始切片,直接删除
            const NotReferencingOriginChunks = ChunkGroups.originChunks.filter(
                (chunk) => !ReferencingOriginChunkIds.includes(chunk.id)
            );
            if (NotReferencingOriginChunks.length) {
                let DeletedChunks = await this.prismaService.shiro_file_chunk.deleteMany({
                    where: { id: { in: NotReferencingOriginChunks.map((chunk) => chunk.id) } }
                });
                // 删除对应的本地文件
                NotReferencingOriginChunks.forEach((chunk) => {
                    const ChunkPath = path.join(process.cwd(), 'chunks', chunk.chunk_path);
                    if (fs.existsSync(ChunkPath)) {
                        fs.unlinkSync(ChunkPath);
                    }
                });
                console.log('切片删除成功:', DeletedChunks);
            }
        }
    }
    /**
     * 测试方法
     * @param fileHash 文件哈希值
     */
    async test(fileHash: string) {
        // 实现测试逻辑
    }
}
