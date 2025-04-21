import { HttpException, HttpStatus } from '@nestjs/common';
interface ErrorBody {
    message: string;
    code: number;
}
const RESPONSE_SUCCESS_CODE = 200;

/**
 * 业务异常
 * error 为错误信息,如果error中不包含:则视为警告,但是返回的code还是为成功
 * 如果error中包含:则视为错误,返回的code为错误码
 */
export class BusinessException extends HttpException {
    // 错误对象的内部错误码和错误消息
    bizCode: number; // 业务码
    bizMessage: string; // 业务消息
    constructor(error: string) {
        // 自定义
        let _bizCode = RESPONSE_SUCCESS_CODE;
        let _bizMessage = '';
        //  业务异常返回的 http 状态码为 200
        let statusCode: HttpStatus = HttpStatus.OK;

        // 非预定的错误,则视为警告,但是返回的业务错误码bizCode还是为业务成功
        if (!error.includes(':')) {
            _bizMessage = error;
            _bizCode = RESPONSE_SUCCESS_CODE;
        } else {
            // 预定的错误码,则视为错误,业务错误码bizCode为错误码
            let [errorCode, errorMessage] = error.split(':');
            _bizMessage = errorMessage;
            _bizCode = Number.parseInt(errorCode);
        }

        super(_bizMessage, statusCode);
        // 更换 message 属性还有内部业务错误码
        this.message = _bizMessage;
        this.bizCode = _bizCode;
        this.bizMessage = _bizMessage;
    }
}
