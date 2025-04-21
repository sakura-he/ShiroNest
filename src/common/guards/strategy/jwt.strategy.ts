import { ErrorEnum } from '@/common/constants/error_code.constant';
import { UnauthException } from '@/common/exceptions/unauth.exceptions';
import { isEmpty } from '@/utils';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../../../modules/auth/auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private readonly authService: AuthService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: true,
            secretOrKey: configService.get('JWT_SECRET') as string
        });
    }
    async validate(payload: any) {
        if (isEmpty(payload) || isEmpty(payload.username) || isEmpty(payload.sub)) {
            throw new UnauthException(ErrorEnum.TOKEN_INVALID);
        }
        // 根据解码jwt 后获取到的username查询用户信息
        const user = await this.authService.validateUser(payload.username);
        if (!user) {
            return null;
        }
        const { password: _password, ...userInfo } = user;
        return userInfo;
    }
}
