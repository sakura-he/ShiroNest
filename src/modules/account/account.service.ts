import { Injectable } from '@nestjs/common';
import { MenuTypeEnum, shiro_user } from '@prisma/client';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/user.service';

@Injectable()
export class AccountService {
    constructor(
        private readonly userService: UserService,
        private readonly authService: AuthService
    ) {}
    // 调用验证服务的 login 进行登录
    async login(user: { id: number; username: string }) {
        return await this.authService.login(user.id, user.username);
    }
    async getAccountMenus(id: shiro_user['id']) {
        let menus = await this.userService.getMenusByID(id);
        menus = menus.filter((menu) => menu.type !== MenuTypeEnum.Button);
        return menus;
    }

    async getAccountInfo(id: shiro_user['id']) {
        let user = await this.userService.getUserByID(id);
        let roles = await this.userService.getRolesByID(id);
        let menus = (await this.userService.getMenusByID(id)).map((menu) => menu.permission);
        return {
            user: user,
            permission: menus,
            roles
        };
    }
}
