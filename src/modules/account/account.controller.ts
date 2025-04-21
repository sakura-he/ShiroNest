import { Public } from '@/common/decorators/public.decorator';
import { LocalGuard } from '@/common/guards/local.guard';
import { LocalStrategy } from '@/common/guards/strategy/local.strategy';
import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { shiro_user } from '@prisma/client';
import { Request } from 'express';
import { UserService } from '../user/user.service';
import { AccountService } from './account.service';
import { GetResetPaswordUserIDByUsernameDto, ResetPasswordDto } from './dto/account.dto';
@Controller('account')
export class AccountController {
    constructor(
        private readonly accountService: AccountService,
        private readonly localStrategy: LocalStrategy,
        private readonly userService: UserService
    ) {}

    // 登录,使用 passport-local 策略
    @Public()
    @UseGuards(LocalGuard)
    @Post('login')
    async login(@Req() req: Request & { user: any }) {
        const token = await this.accountService.login(req.user);
        // 生成 token
        return {
            token
        };
    }

    // 获取要重置密码的用户的 id
    @Public()
    @Get('reset_password')
    async getResetPasswordUserIDByUsername(@Query('username') username: GetResetPaswordUserIDByUsernameDto) {
        return (await this.userService.getUser(username)).id;
    }
    // 重置密码
    @Public()
    @Post('reset_password')
    async resetPassword(@Body() data:ResetPasswordDto) {
        // this.localStrategy.validate(data.)
    }

    // 获取当前用户的菜单
    @Get('get_user_menus')
    async getAccountMenus(req: Request & { user: shiro_user }) {
        console.log(req.user);
        return await this.accountService.getAccountMenus(req.user.id);
    }

    // 获取当前用户信息,返回用户信息,权限
    @Get('get_account_info')
    async getAccountInfo(@Req() req: Request & { user: shiro_user }) {
        console.log(req.user);
        return await this.accountService.getAccountInfo(req.user.id);
    }
}
