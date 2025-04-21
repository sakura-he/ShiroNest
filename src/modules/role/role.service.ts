import { ErrorEnum } from '@/common/constants/error_code.constant';
import { BusinessException } from '@/common/exceptions/biz.exceptions';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { shiro_menu, shiro_role } from '@prisma/client';
import dayjs from 'dayjs';
import { intersection, xor } from 'es-toolkit';
import { MenuService } from '../menu/menu.service';
import { CreateRoleDto, QueryRoleListDto, UpdateRoleDto } from './dto/role.dto';
@Injectable()
export class RoleService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly menuService: MenuService
    ) {}

    // 查询所有角色 分页查询
    async getAllRoles(query: QueryRoleListDto) {
        console.log(query);
        const [records, pagination] = await this.prismaService.shiro_role.findManyAndCount({
            take: query.page_size,
            skip: query.page ? (query.page - 1) * query.page_size! : undefined,
            where: {
                name: {
                    contains: query.name
                },
                status: query.status,
                created_at: query.created_at
                    ? {
                          gte: dayjs(query.created_at[0], 'YYYY-MM-DD HH:mm:ss').toDate(),
                          lte: dayjs(query.created_at[1], 'YYYY-MM-DD HH:mm:ss').toDate()
                      }
                    : undefined
            },
            include: {
                menus: {
                    include: {
                        menu: true
                    }
                }
            }
        });

        return {
            records,
            pagination
        };
    }

    // 创建角色, 并分配权限
    async createRole(createRoleDto: CreateRoleDto) {
        const { menus, ...role } = createRoleDto;
        const findRole = await this.findByCode(role.code);
        if (findRole) {
            throw new BusinessException(ErrorEnum.ROLE_NAME_ALREADY_EXISTS);
        }
        await this.menuService.checkHasMenus(menus);
        const newRole = await this.prismaService.shiro_role.create({
            data: {
                ...role,
                menus: {
                    create: menus.map((menu) => ({ menu_id: menu }))
                }
            }
        });
        return newRole;
    }

    // 更新指定角色信息
    async updateRole(id: number, updateRoleDto: UpdateRoleDto) {
        let { menus, ...data } = updateRoleDto;
        const role = await this.prismaService.shiro_role.findFirst({
            where: {
                id
            }
        });
        if (!role) {
            throw new BusinessException(ErrorEnum.ROLE_NOT_FOUND);
        }
        await this.menuService.checkHasMenus(menus);
        // 更新角色信息
        let newRole = await this.prismaService.shiro_role.update({
            where: {
                id
            },
            data: {
                ...data,
                menus: {
                    deleteMany: {},
                    create: menus.map((menu) => ({ menu_id: menu }))
                }
            }
        });
        return newRole;
    }
    // 获取指定角色被那些用户关联
    async getUsersByRole(id: shiro_role['id']) {
        return (
            await this.prismaService.shiro_user_role.findMany({
                where: {
                    role_id: id
                },
                include: {
                    user: {
                        select: {
                            username: true,
                            id: true
                        }
                    }
                }
            })
        ).map((role_user) => role_user.user);
    }
    // 删除指定角色
    async deleteRole(id: number) {
        // 查询该角色是否被别的用户关联
        let users = await this.getUsersByRole(id);
        if (users.length > 0) {
            let refUsers = users.map((user) => {
                return `用户名: ${user.username} , 用户ID:  ${user.id}`;
            });
            throw new BusinessException(`${ErrorEnum.DELETE_ROLE_FAILD_ROLE_REF}${refUsers.join(',')}`);
        }
        return await this.prismaService.shiro_role.delete({
            where: {
                id
            }
        });
    }

    // 查询单个角色 通过 name 查询
    async findByCode(code: string) {
        return await this.prismaService.shiro_role.findUnique({
            where: { code }
        });
    }

    // 查询单个角色 通过id 查询
    async findOne(id: number) {
        return await this.prismaService.shiro_role.findUnique({
            where: { id }
        });
    }
    // 检测传入的角色 ids 是否存在
    async checkHasRoles(roles: shiro_role['id'][]) {
        // 获取数据库中所有的角色id
        const findRoleIDs = (
            await this.prismaService.shiro_role.findMany({
                where: { id: { in: roles } }
            })
        ).map((role) => role.id);
        if (roles.length && (!findRoleIDs || findRoleIDs.length === 0)) {
            throw new BusinessException(ErrorEnum.PERMISSION_NOT_FOUND);
        }
        // 求传入的要分配的角色数组和根据角色数组在库中所有的角色取交集,判断是否数量一致
        const istArr = intersection(findRoleIDs, roles);
        // 判断交集的数量是否和要分配的角色 id数组数量相等,不想等说明数据库中缺少要分配的角色 id
        if (istArr.length < roles.length) {
            // 获取数据库中缺少要分配的角色 id
            // 求共有的 id和要分配的角色 id 差集,求出数据库中缺少的要分配的角色 id
            let lackMenuIDs = xor(istArr, roles);
            throw new BusinessException(ErrorEnum.ROLE_ASSIGNMENT_MENU_NOT_FOUND_ID + lackMenuIDs.join(','));
        }
    }
    // 分配权限
    async assignMenu(id: shiro_role['id'], menus: shiro_menu['id'][]) {
        const role = await this.findOne(id);
        if (!role) {
            throw new BusinessException(ErrorEnum.ROLE_NOT_FOUND);
        }
        await this.menuService.checkHasMenus(menus);
        // 分配权限
        // 获取当前角色拥有的权限
        const currentRoleMenusIds = (
            await this.prismaService.shiro_role_menu.findMany({
                where: {
                    role_id: id
                },
                select: {
                    menu_id: true
                }
            })
        ).map((menu) => menu.menu_id);
        // 计算需要分配的权限 当前[234] 新的[345] 差集[2,5] 新增的:[2,5]和新的[345]取交集 删除的:[2,5]和旧的[234]取交集
        const OldXORNew = xor(currentRoleMenusIds, menus);
        const addMenus = intersection(OldXORNew, menus);
        const deleteMenus = intersection(OldXORNew, currentRoleMenusIds);
        return await this.prismaService.$transaction([
            this.prismaService.shiro_role_menu.deleteMany({
                where: {
                    role_id: id,
                    menu_id: { in: deleteMenus }
                }
            }),
            this.prismaService.shiro_role_menu.createMany({
                data: addMenus.map((menu) => ({
                    role_id: id,
                    menu_id: menu
                }))
            })
        ]);
    }
    //
    // 查询角色所拥有的权限
    async getRoleMenus(id: number) {
        return this.prismaService.shiro_role_menu.findMany({
            where: { role_id: id },
            include: {
                menu: true
            }
        });
    }
}
