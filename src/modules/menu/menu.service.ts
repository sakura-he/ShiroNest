import { ErrorEnum } from '@/common/constants/error_code.constant';
import { BusinessException } from '@/common/exceptions/biz.exceptions';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { MenuTypeEnum, shiro_menu } from '@prisma/client';
import { intersection, isNil, xor } from 'es-toolkit';
import { CreateMenuDto, UpdateMenuDto } from './dto/menu.dto';
@Injectable()
export class MenuService {
    constructor(private readonly prismaService: PrismaService) {}
    // 创建权限 权限值示例: 模块:菜单:动作 例如: common:user:create
    async create_menu(createMenuDto: CreateMenuDto) {
        // 检查创建的菜单是否合法
        await this.checkMenu(createMenuDto);
        return await this.prismaService.shiro_menu.create({
            data: createMenuDto
        });
    }

    // 查询所有权限
    async findAll() {
        return await this.prismaService.shiro_menu.findMany();
    }

    // 查询单个权限
    async findOne(id: number) {
        return await this.prismaService.shiro_menu.findUnique({
            where: { id }
        });
    }

    // 更新权限
    async update(updateMenuDto: UpdateMenuDto) {
        const { id, ...rest } = updateMenuDto;
        return await this.prismaService.shiro_menu.update({
            where: { id },
            data: rest
        });
    }

    // 删除权限
    async remove(id: number) {
        return await this.prismaService.shiro_menu.delete({
            where: { id }
        }); 
    }
     // 删除指定角色
     async deleteMenu(id: number) {
        // 查询该角色是否被别的用户关联
        let roles = await this.getRolesByMenu(id);
        if (roles.length > 0) {
            let refUsers = roles.map((roles) => {
                return `角色名: ${roles.name} , 角色id:  ${roles.id}`;
            });
            throw new BusinessException(`${ErrorEnum.DELETE_ROLE_FAILD_ROLE_REF}${refUsers.join(',')}`);
        }
        return await this.prismaService.shiro_role.delete({
            where: {
                id
            }
        });
    }
     // 获取指定菜单被那些角色关联
    async getRolesByMenu(id: shiro_menu['id']) {
        return (
            await this.prismaService.shiro_role_menu.findMany({
                where: {
                    menu_id: id
                },
                include: {
                    role: {
                        select: {
                            name: true,
                            code:true,
                            id: true
                        }
                    }
                }
            })
        ).map((menu_role) => menu_role.role);
    }
    // 检测库中是否有指定的 ids 菜单
    async checkHasMenus(menus: shiro_menu['id'][]) {
        // 获取数据库中所有的角色id
        const findRoleIDs = (
            await this.prismaService.shiro_menu.findMany({
                where: { id: { in: menus } }
            })
        ).map((role) => role.id);
        if (menus.length && (!findRoleIDs || findRoleIDs.length === 0)) {
            throw new BusinessException(ErrorEnum.PERMISSION_NOT_FOUND);
        }
        // 求传入的要分配的角色数组和根据角色数组在库中所有的角色取交集,判断是否数量一致
        const istArr = intersection(findRoleIDs, menus);
        // 判断交集的数量是否和要分配的角色 id数组数量相等,不想等说明数据库中缺少要分配的角色 id
        if (istArr.length < menus.length) {
            // 获取数据库中缺少要分配的角色 id
            // 求共有的 id和要分配的角色 id 差集,求出数据库中缺少的要分配的角色 id
            let lackMenuIDs = xor(istArr, menus);
            throw new BusinessException(ErrorEnum.ROLE_ASSIGNMENT_MENU_NOT_FOUND_ID + lackMenuIDs.join(','));
        }
    }
    // 检查创建的菜单是否合法
    async checkMenu(menu: CreateMenuDto) {
        if (isNil(menu.pid)) {
            // 目录和菜单的父级可以为空,为空不做父级检测,但是按钮不能为空
            if (menu.type === MenuTypeEnum.Button) {
                throw new BusinessException(ErrorEnum.MENU_PARENT_NOT_FOUND);
            }
        } else {
            // 获取菜单父节点
            let parent: shiro_menu | null = null;
            parent = await this.prismaService.shiro_menu.findUnique({ where: { id: menu.pid } });
            if (isNil(parent)) {
                // 父级不存在
                throw new BusinessException(ErrorEnum.MENU_PARENT_NOT_FOUND);
            }
            // 判断父节点的类型是否合法

            // 按钮的上级只能为页面类型的节点
            if (menu.type === MenuTypeEnum.Button && parent.type !== MenuTypeEnum.Page) {
                throw new BusinessException(ErrorEnum.MENU_BUTTON_PARENT_MUST_PAGE);
            }
            // 页面的父级只能为目录类型的节点
            if (menu.type === MenuTypeEnum.Page && parent.type !== MenuTypeEnum.Catalog) {
                throw new BusinessException(ErrorEnum.MENU_PAGE_PARENT_MUST_CATALOG_ROOT);
            }
            // 目录的父级只能为目录类型的节点
            if (menu.type === MenuTypeEnum.Catalog && parent.type !== MenuTypeEnum.Catalog) {
                throw new BusinessException(ErrorEnum.MENU_CATALOG_PARRENT_MUST_CATALOG_OR_NULL);
            }
        }
    }
}
