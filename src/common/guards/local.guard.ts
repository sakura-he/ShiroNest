import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ErrorEnum } from '../constants/error_code.constant';
import { BusinessException } from '../exceptions/biz.exceptions';
import { UnauthException } from '../exceptions/unauth.exceptions';
// 本地认证守卫,使用 passport-local 策略
export class LocalGuard extends AuthGuard('local') {
    canActivate(context: ExecutionContext) {
        return super.canActivate(context);
    }
    handleRequest(err: any, user: any, info: any) {
        if (err) {
            throw err;
        }
        // 如果错误信息为Missing credentials代表账户或密码错误
        if (info) {
            if (info.message === 'Missing credentials') {
                throw new BusinessException(ErrorEnum.INVALID_USERNAME_PASSWORD);
            }
            throw new BusinessException(info.name || ErrorEnum.TOKEN_UNDEFINED_ERROR);
        }
        if (!user) {
            throw new UnauthException(ErrorEnum.USER_NOT_FOUND);
        }

        return user;
    }
}
