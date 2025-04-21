import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { ZodValidationException } from 'nestjs-zod';
import { ErrorEnum } from '../constants/error_code.constant';
import { ShiroErrorResponse } from './types';
// zod 验证异常过滤器
@Catch(ZodValidationException)
export class ZodValidationExceptionFilter implements ExceptionFilter {
    catch(exception: ZodValidationException, host: ArgumentsHost) {
        console.log('ZodValidationExceptionFilter');
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const zodError = exception.getZodError();
        console.log('zodError', zodError);
        const formatError = zodError.flatten();
        const [errorCode, errorMessage] = ErrorEnum.PARAMETER_INVALID.split(':');
        let resBody: ShiroErrorResponse = {
            data: formatError,
            code: +errorCode,
            message: `${errorMessage}`
        };
        response.status(400).json(resBody);
    }
}
