import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs/internal/Observable';
import { FILE_FILTER_TYPE_METADATA_KEY } from '../constants/auth.constant';

// 获取定义在 handler上面的上传文件选项  :由 SetMetadata 方式添加到 handler 上的 __file_filter_metadata__,加到 request 对象上
// 然后 file.interceprots 包装返回内置的FileInterceptor拦截器,获取到 request 上面的选项
@Injectable()
export class FileFilterMetadataInterceptor implements NestInterceptor {
    constructor(private reflector: Reflector) {}
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        let request = context.switchToHttp().getRequest();
        // 获取通过 SetMedata 方式添加到 handler 上的 metadata
        let fileMetadata = this.reflector.getAllAndOverride('__file_filter_metadata__', [
            context.getHandler(),
            context.getClass()
        ]);
        // 如果 fileMetadata 为空，则使用默认值
        if (fileMetadata.length) {
        }
        // 将获取到的 metadata 添加到 request 上
        Reflect.defineMetadata(FILE_FILTER_TYPE_METADATA_KEY, fileMetadata, request);
        return next.handle();
    }
}
