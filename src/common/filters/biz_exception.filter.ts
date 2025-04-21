import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Request, Response } from 'express';
import { BusinessException } from '../exceptions/biz.exceptions';
import { ShiroErrorResponse } from './types';

// 返回体结构
// {
//     data: null,
//     code: number, http 错误取 http 错误码, 业务错误取业务错误码
//     message: string,
//     stack?: string  isDev
// }, statusCode
export class BusinessExceptionFilter implements ExceptionFilter {
    constructor() {}
    catch(exception: BusinessException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        let statusCode = exception.getStatus();
        console.log('statusCode', statusCode);
        let url = request.originalUrl;
        let resBody: ShiroErrorResponse = {
            data: null,
            code: exception.bizCode,
            message: exception.message
        };
        response.status(statusCode).json(resBody);
    }
}
