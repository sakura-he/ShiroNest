import { ZodValidationPipe } from '@/common/pipes/zodValidate.pipe';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { z } from 'zod';
import { CreateRoleDto, QueryRoleListDto, UpdateRoleDto } from './dto/role.dto';
import { RoleService } from './role.service';

@Controller('role')
export class RoleController {
    constructor(private readonly roleService: RoleService) {}
    // 查询所有角色
    @Get('get_all_roles')
    async getAllRoles(@Query() query: QueryRoleListDto) {
        return await this.roleService.getAllRoles(query);
    }

    // 创建角色
    @Post('create_role')
    async createRole(@Body() createRoleDto: CreateRoleDto) {
        console.log('createRoleDto', createRoleDto);
        return await this.roleService.createRole(createRoleDto);
    }

    //更新指定角色
    @Post('update_role')
    async updateRole(@Query('id', new ZodValidationPipe(z.coerce.number())) id: number, @Body() data: UpdateRoleDto) {
        return await this.roleService.updateRole(id,data);
    }

    // 删除指定角色
    @Post('delete_role')
    async deleteRole(@Query('id', new ZodValidationPipe(z.coerce.number())) id: number) {
        return await this.roleService.deleteRole(id);
    }

    // 查询角色所拥有的权限
    @Get('get_role_menus')
    getRoleMenus(@Query('id', new ZodValidationPipe(z.coerce.number())) id: number) {
        return this.roleService.getRoleMenus(id);
    }
}
