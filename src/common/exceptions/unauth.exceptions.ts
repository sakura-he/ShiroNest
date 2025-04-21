import { HttpStatus, UnauthorizedException } from '@nestjs/common';
interface ErrorBody {
    message: string;
    code: number;
}

/**
 * 业务异常
 * error 为错误信息,如果error中不包含:则视为警告,但是返回的code还是为成功
 * 如果error中包含:则视为错误,返回的code为错误码
 */
export class UnauthException extends UnauthorizedException {
    // 错误对象的内部错误码和错误消息
    bizCode: number; // 业务码
    bizMessage: string; // 业务消息
    originalError: string; // 原始错误信息
    constructor(error: string) {
        console.error(error)
        // 自定义
        let _bizCode = HttpStatus.UNAUTHORIZED;
        let _bizMessage = '';
        //  授权异常返回的 http 状态码为 401,出现这个错误意味着客户端要退出登录了
        let statusCode: HttpStatus = HttpStatus.UNAUTHORIZED;

        // 非预定的错误,则视为警告,但是返回的业务错误码bizCode还是为401
        if (!error.includes(':')) {
            _bizMessage = error;
            _bizCode = HttpStatus.UNAUTHORIZED;
        } else {
            // 预定的错误码,则视为错误,业务错误码bizCode为错误码
            let [errorCode, errorMessage] = error.split(':');
            _bizMessage = errorMessage;
            _bizCode = Number.parseInt(errorCode);
        }

        super(_bizMessage);
        // 更换 message 属性还有内部业务错误码
        this.message = _bizMessage;
        this.bizCode = _bizCode;
        this.bizMessage = _bizMessage;
        this.originalError = error;
    }
}
