import { ErrorEnum } from '@/common/constants/error_code.constant';
import { BusinessException } from '@/common/exceptions/biz.exceptions';
import { UnauthException } from '@/common/exceptions/unauth.exceptions';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
function md5(str: string) {
    return crypto.createHash('md5').update(str).digest('hex');
}
@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly prismaService: PrismaService
    ) {}
    // 通过传入的登录信息,使用 passport-local 策略验证用户并签发 jwt
    async login(userId: number, username: string) {
        const token = await this.jwtService.signAsync({
            sub: userId,
            username: username
        });
        return token;
    }
    // 根据用户名查询用户信息,并判断用户是否合法,如果不合法,则报错并传给 passport 策略处理错误
    async validateUser(username: string) {
        const findUser = await this.getUserInfo(username);
        if (!findUser) {
            throw new UnauthException(ErrorEnum.USER_NOT_FOUND);
        }

        return findUser;
    }
    // 验证用户名和密码是否正确,验证正确后返回用户
    async validateUserPassword(username: string, password: string) {
        console.log('validateUserPassword',username,password)
        let findUser = await this.getUserInfo(username);
        if (!findUser) {
            console.log('weishao')
            throw new UnauthException(ErrorEnum.USER_NOT_FOUND);
        }
        if (findUser.password !== md5(password)) {
            throw new BusinessException(ErrorEnum.INVALID_USERNAME_PASSWORD);
        }
        return findUser
    }
    // 根据用户名查询用户信息
    async getUserInfo(username: string) {
        const findUser = await this.prismaService.shiro_user.findFirst({
            where: {
                username: username
            }
        });
        return findUser;
    }
}
