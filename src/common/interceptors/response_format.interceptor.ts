import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable, Subject, tap } from 'rxjs';
import { ErrorEnum } from '../constants/error_code.constant';
/**
 * 格式化响应拦截器
 * 将响应数据格式化为统一的格式为
 * {
 *  data: any,
 *  code: string,
 *  message: string
 * }
 */
@Injectable()
export class ResponseFormatInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        let request = context.switchToHttp().getRequest();

        const now = Date.now();

        return next.handle().pipe(
            map((data) => {
                return {
                    data: data === undefined ? null : data,
                    code: Number.parseInt(ErrorEnum.RESPONSE_SUCCESS_CODE.split(':')[0]),
                    message: ErrorEnum.RESPONSE_SUCCESS_CODE.split(':')[1]
                };
            }),
            tap((data) => {
                console.log('tap', Date.now() - now + 'ms');
            })
        );
    }
}

let subject = new Subject();
