import { AttachPermissions, definePermission } from '@/common/decorators/permission.decorator';
import { Body, Controller, Get, Headers, Post, Query, Req, Version } from '@nestjs/common';
import { Request } from 'express';
import { ZodValidationPipe } from 'nestjs-zod';
import { z } from 'zod';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto, QueryUserListDto, UpdateUserDto } from './user.dto';
import { UserService } from './user.service';
export const permissions = definePermission('Prim:system:user', {
    LIST: 'list',
    CREATE: 'create',
    READ: 'read',
    UPDATE: 'update',
    DELETE: 'delete',
    PASSWORD_UPDATE: 'password:update',
    PASSWORD_RESET: 'pass:reset'
} as const);

@Controller({
    path: 'user'
})
// @SaveLog()
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly authService: AuthService
    ) {}

    @Get('get_user_list')
    async getUserList(@Query() query: QueryUserListDto) {
        return this.userService.getUserList(query);
    }

    @Post('create_user')
    async create(@Body() data: CreateUserDto) {
        console.log('data', data);
        return this.userService.createUser(data);
    }

    @Post('update_user')
    async updateUser(@Query('id', new ZodValidationPipe(z.coerce.number())) id: number, @Body() data: UpdateUserDto) {
        return await this.userService.updateUser(id, data);
    }

    @Post('delete_user')
    async deleteUser(@Query('id', new ZodValidationPipe(z.coerce.number())) id: number) {
        return await this.userService.deleteUser(id);
    }

    @Get()
    async getVersion(@Headers('version') version: string) {
        return 'A';
    }
    @Version('2')
    @Get()
    async getVersion2(@Headers('version') version: string) {
        console.log('version2', version);
        return 'B';
    }

    /**
     * 测试权限
     * @returns
     */
    @AttachPermissions('( Perm:demo.index.index && Role:superadmin ) || Role:test')
    @Get('test')
    async test(@Req() req: Request & { user: any }) {
        console.log('@user.controller.ts test', req.user);
        return req.user;
    }
}
