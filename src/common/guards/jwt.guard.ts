import { UserService } from '@/modules/user/user.service';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { PUBLIC_KEY } from '../constants/auth.constant';
import { ErrorEnum } from '../constants/error_code.constant';
import { UnauthException } from '../exceptions/unauth.exceptions';
@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
    constructor(
       
        private readonly reflector: Reflector,
        private readonly userService: UserService
    ) { super()}
    // canActivate -> strategy.validate -> handleRequest
    async canActivate(context: ExecutionContext): Promise<any> {
        const request: Request & { user: { id: number; username: string } } = context.switchToHttp().getRequest();
        let handler = context.getHandler();
        let classHandler = context.getClass();
        let canPass = false;

        const isPublic = this.reflector.getAllAndOverride(PUBLIC_KEY, [handler, classHandler]);
        console.log('isPublic', isPublic);
        // 控制器设置为公开，则默认通过
        if (isPublic) {
            return true;
        }
        return await super.canActivate(context);
    }
    handleRequest<TUser = any>(err: any, user: any, info: any): TUser {
        // 如果验证用户时,strategy的vlidate出现错误直接抛出
        if (err) {
            throw err;
        }

        // 如果用户不存在或身份验证失败 使用 401 http状态码返回错误
        if (info) {
            // 根据 info 的内容判断具体错误类型,info 为 passport-jwt 验证失败后的错误信息
            if (info?.name === 'TokenExpiredError') {
                throw new UnauthException(ErrorEnum.TOKEN_EXPIRED);
            }

            if (info?.name === 'JsonWebTokenError') {
                throw new UnauthException(ErrorEnum.TOKEN_INVALID);
            }
            if (info?.name === 'NotBeforeError') {
                throw new UnauthException(ErrorEnum.TOKEN_NOT_BEFORE);
            }
            if (info) {
                throw new UnauthException(info.message || info.name || ErrorEnum.TOKEN_UNDEFINED_ERROR);
            }
        }
        if (!user) {
            // 非 passport 错误,未找到用户信息
            throw new UnauthException(ErrorEnum.USER_NOT_FOUND);
        }
        // 如果用户存在， validate 返回的内容会添加到 request.user
        return user;
    }
}
