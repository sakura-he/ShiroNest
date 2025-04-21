import { ArgumentsHost, ExceptionFilter, HttpException, InternalServerErrorException } from '@nestjs/common';
import { ZodValidationException } from 'nestjs-zod';
import { BusinessException } from '../exceptions/biz.exceptions';
import { UnauthException } from '../exceptions/unauth.exceptions';
import { BusinessExceptionFilter } from './biz_exception.filter';
import { ZodValidationExceptionFilter } from './nest_zod_exception.filter';
import { UncatchExceptionFilter } from './uncatch_exception.filter';
export class AllExceptionsFilter implements ExceptionFilter {
    constructor() {}
    catch(exception: Error, host: ArgumentsHost) {
        const isDev = true;
        // 开发环境保存堆栈信息
        if (isDev) {
            // const ctx = host.switchToHttp();
            // const response = ctx.getResponse<Response>();
            // const request = ctx.getRequest<Request>();
            // let statusCode = exception.getStatus();
            // console.log('statusCode', statusCode);
            // let url = request.originalUrl;
            // console.log(
            //     `发生错误信息：
            //      请求Path: < ${decodeURI(url)} >
            //      错误类型: < ${exception.name} > 
            //      错误码: < ${resBody.code} > 
            //      错误消息: < ${resBody.message} > 
            //      错误堆栈: < ${exception.stack} > 
            //     `
            // );
        }

        // 业务异常
        if (exception instanceof BusinessException) {
            new BusinessExceptionFilter().catch(exception, host);
        } else if (exception instanceof UnauthException) {
            new BusinessExceptionFilter().catch(exception, host);
        } else if (exception instanceof InternalServerErrorException) {
            // 内部错误
        } else if (exception instanceof HttpException) {
            // http 错误
        } else if (exception instanceof ZodValidationException) {
            new ZodValidationExceptionFilter().catch(exception, host);
        } else {
            new UncatchExceptionFilter().catch(exception, host);
        }
    }
}
