import { ErrorEnum } from '@/common/constants/error_code.constant';
import { BusinessException } from '@/common/exceptions/biz.exceptions';
import { isEmpty } from '@/utils';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../../../modules/auth/auth.service';
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService) {
        super();
    }

    async validate(username: string, password: string): Promise<any> {
        // 密码或账号格式不正确
        if (isEmpty(username) || isEmpty(password)) {
            throw new BusinessException(ErrorEnum.INVALID_USERNAME_PASSWORD);
        }
        // 调用 authService 的 validateUser 方法验证用户名和密码
        const findUser = await this.authService.validateUserPassword(username,password);
        if (!findUser) {
            return null;
        }
         
        const { password: _password, ...userInfo } = findUser;
        return userInfo; // 返回用户信息会传给 AuthGuard(local).handleRequest 方法
    }
}
