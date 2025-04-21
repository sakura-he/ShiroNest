import { PrismaService } from '@/prisma/prisma.service';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable, tap } from 'rxjs';
import { SAVE_LOG_KEY } from '../constants/auth.constant';
interface ILog {
    user_id: number;
    user_info: any;
    ip: string;
    request: string;
    response: string;
    status: number;
    handler: string;
}
@Injectable()
export class LogInterceptor implements NestInterceptor {
    constructor(
        private reflector: Reflector,
        private prismaService: PrismaService
    ) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        console.log('LogInterceptor start');
        // 判断接口是否有需要日志记录标志: __LOG_KEY__
        const handler = context.getHandler();
        const classHandler = context.getClass();
        const hasSaveLog = this.reflector.getAllAndOverride(SAVE_LOG_KEY, [handler, classHandler]);

        if (hasSaveLog) {
            return next.handle().pipe(
                tap((data) => {
                    this.savelog(context, data);
                })
            );
        }
        return next.handle();
    }
    // 保存日志
    async savelog(context: ExecutionContext, data: any) {
        const ctx = context.switchToHttp();
        const handler = context.getHandler();
        const classHandler = context.getClass();
        const request = ctx.getRequest<Request>();
        // 记录下用户请求信息
        const { method, url, body, query, params } = request;
        const userAgent = request.headers['user-agent'] || '';
        // 获取用户id
        let logUserId = 0;
        const logIp = request.ip || request.headers['x-forwarded-for'] || request.headers['x-real-ip'] || request.ip;
        // 获取用户信息
        let logUserInfo = { name: 'admin', id: 1 };
        // 获取请求处理器
        let logHandler = `${classHandler.name}.${handler.name}`;
        // 获取请求参数
        const logRequest = {
            method: method.toUpperCase(),
            url,
            body,
            query,
            params,
            userAgent
        };
        let logData: ILog = {
            user_id: logUserId,
            user_info: logUserInfo,
            ip: JSON.stringify(logIp),
            request: JSON.stringify(logRequest),
            response: JSON.stringify(data),
            status: data.code,
            handler: logHandler
        };
        try {
            await this.prismaService.shiro_user_log.create({
                data: {
                    ...logData
                }
            });
        } catch (error) {
            console.log('LogInterceptor:Save Log to Database By Prisma; Error:', error);
        }
    }
}
