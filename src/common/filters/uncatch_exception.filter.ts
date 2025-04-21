import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { ErrorEnum } from '../constants/error_code.constant';
import { ShiroErrorResponse } from './types';
// 返回体结构
// {
//     data: null,
//     code: number, http 错误取 http 错误码, 业务错误取业务错误码
//     message: string,
//     stack?: string  isDev
// }, statusCode
export class UncatchExceptionFilter implements ExceptionFilter {
    constructor() {}
    catch(exception: Error, host: ArgumentsHost) {
        console.log(exception);
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const [errorCode, errorMessage] = ErrorEnum.DEFAULT.split(':');
        let resBody: ShiroErrorResponse = {
            data: null,
            code: +errorCode,
            message: `${errorMessage}:${exception.message}`
        };
        // 记录错误信息
        response.status(500).json(resBody);
    }
}
