import {
    Body,
    Controller, ParseFilePipeBuilder,
    ParseIntPipe,
    Post,
    Query,
    UploadedFile,
    UploadedFiles,
    UseInterceptors
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import dayjs from 'dayjs';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { join as pathJoin, relative } from 'path';
import { UploadService } from './upload.service';
// 上传文件拦截器选项复用
const FileInterceptorOptions = (filePath: string) => ({
    storage: diskStorage({
        // 相对于 process.pwd()返回的目录
        destination(req, file, cb) {
            let uploadDir = `./${filePath}/${dayjs().format('YYYY/MM/DD')}`;
            let destinationDir = pathJoin(process.cwd(), uploadDir);
            if (!existsSync(destinationDir)) {
                mkdirSync(destinationDir, { recursive: true });
            }
            cb(null, destinationDir);
        },
        filename(req, file, cb) {
            // 格式化文件名为：字段名-时间-随机数-文件原始名
            let filename = `${file.fieldname}-${dayjs().format('HH:mm:ss')}-${Math.floor(Math.random() * 10000)}-${file.originalname}`;
            cb(null, filename);
        }
    })
});

@Controller()
export class UploadController {
    constructor(private readonly uploadService: UploadService) {}
    // 上传单文件
    @Post('upload')
    @UseInterceptors(FileInterceptor('file', FileInterceptorOptions('uploads')))
    uploadFile(
        @UploadedFile(
            new ParseFilePipeBuilder()
                .addMaxSizeValidator({
                    maxSize: 1024 * 1024 * 999,
                    message: '文件大小超过限制'
                })
                .build()
        )
        file: Express.Multer.File
    ) {
        let path = relative(pathJoin(process.cwd(), 'uploads'), file.path);
        return {
            file_url: path
        };
    }
    // 上传多文件
    @Post('uploads')
    @UseInterceptors(FilesInterceptor('file', 9, FileInterceptorOptions('uploads')))
    uploadFiles(
        @UploadedFiles(
            new ParseFilePipeBuilder()
                .addMaxSizeValidator({
                    maxSize: 1024 * 1024 * 999,
                    message: '文件大小超过限制'
                })
                .build()
        )
        files: Express.Multer.File[]
    ) {
        let paths = files.map((file) => relative(pathJoin(process.cwd(), 'uploads'), file.path));
        return {
            file_url: paths
        };
    }
    // 切片方式上传文件
    @Post('upload_chunk')
    @UseInterceptors(FileInterceptor('chunk', FileInterceptorOptions('chunks')))
    async uploadFileChunk(
        @UploadedFile(
            new ParseFilePipeBuilder()
                .addMaxSizeValidator({
                    maxSize: 1024 * 1024 * 999,
                    message: '文件大小超过限制'
                })
                .build()
        )
        file: Express.Multer.File,
        @Body('chunk_hash') chunk_hash: string, // 切片hash
        @Body('chunk_index', ParseIntPipe) chunk_index: number, // 切片索引
        @Body('file_chunks_length', ParseIntPipe) file_chunks_length: number, // 文件切片总数
        @Body('file_hash') file_hash: string, // 文件hash
        @Body('file_name') file_name: string, // 文件名
        @Body('file_size', ParseIntPipe) file_size: number, // 文件大小
        @Body('file_type') file_type: string, // 文件类型
        @Body('file_uid') file_uid: string // 文件唯一标识
    ) {
        console.log('file_uid', file_uid);
        const user_id = 2;
        let path = relative(pathJoin(process.cwd(), 'chunks'), file.path);
        let chunkInfo = {
            // 保存切片hash
            chunk_hash,
            // 保存切片索引
            chunk_index,
            // 保存切片文件名
            chunk_name: file.filename,
            // 保存切片路径
            chunk_path: path,
            // 保存切片大小
            chunk_size: file.size,
            // 保存切片hash
            file_hash,
            // 保存文件名
            file_name,
            // 保存文件大小
            file_size,
            // 保存文件类型
            file_type,
            // 保存切片总数
            file_chunks_length,
            // 保存文件uid
            file_uid
        };
        let result = await this.uploadService.saveFileChunk(chunkInfo, user_id);

        // 保存切片到数据库
        return {
            file_url: path
        };
    }
    // 合并切片
    @Post('merge_chunks')
    async mergeChunks(@Body('file_uid') fileUid: string, @Body('user_id', ParseIntPipe) userId: number) {
        return await this.uploadService.mergeFileChunks(userId, fileUid);
    }
    @Post('get_chunk_by_file_uid')
    async getChunkByFileUID(@Query('file_uid') fileUID: string) {
        const user_id = 2;
        return this.uploadService.getChunkByFileUID(user_id, fileUID);
    }
    @Post('test')
    async test(@Body('file_hash') fileHash: string) {
        return this.uploadService.test(fileHash);
    }
}
