import { ErrorEnum } from '@/common/constants/error_code.constant';
import { BusinessException } from '@/common/exceptions/biz.exceptions';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { shiro_menu, shiro_role, shiro_user } from '@prisma/client';
import * as crypto from 'crypto';
import dayjs from 'dayjs';
import { intersection, isNil, xor } from 'es-toolkit';
import { RoleService } from '../role/role.service';
import { CreateUserDto, QueryUserListDto, UpdateUserDto } from './user.dto';
function md5(str: string) {
    return crypto.createHash('md5').update(str).digest('hex');
}
@Injectable()
export class UserService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly roleService: RoleService
    ) {}

    // 通过 username 获取指定用户
    async getUser(username: string) {
        const user = await this.prismaService.shiro_user.findFirst({
            where: {
                username
            },
            omit: {
                password: true,
                psalt: true
            }
        });
        if (!user) {
            throw new BusinessException(ErrorEnum.USER_NOT_FOUND);
        }
        return user;
    }
    // 通过 ID 获取指定用户
    async getUserByID(id: number) {
        const user = await this.prismaService.shiro_user.findFirst({
            where: {
                id
            },
            include: {
                roles: false
            },
            omit: {
                password: true,
                psalt: true
            }
        });
        if (!user) {
            throw new BusinessException(ErrorEnum.USER_NOT_FOUND);
        }
        return user;
    }
    /**
     * 获取所有任务记录及其运行状态
     * @param query 查询条件
     * @param query.page 页码
     * @param query.limit 每页条数
     * @param query.status 任务状态
     * @param query.name 任务名称
     * @param query.handler 任务处理器
     *
     * @returns {
     *  tasks: 任务列表,包含任务信息和对应job状态
     *  pagination: 分页信息
     * }
     */
    async getUserList(query: QueryUserListDto) {
        const [records, pagination] = await this.prismaService.shiro_user.findManyAndCount({
            take: query.page_size,
            skip: query.page ? (query.page - 1) * query.page_size! : undefined,
            where: {
                username: {
                    contains: query.username
                },
                phone: query.phone,
                nickname: query.nickname,
                remark: query.remark,
                status: query.status,
                created_at: query.created_at
                    ? {
                          gte: dayjs(query.created_at[0], 'YYYY-MM-DD HH:mm:ss').toDate(),
                          lte: dayjs(query.created_at[1], 'YYYY-MM-DD HH:mm:ss').toDate()
                      }
                    : undefined
            },
            include: {
                roles: true
            },
            omit: {
                password: true,
                psalt: true
            }
        });
        return {
            records,
            pagination
        };
    }
    // 新建用户
    async createUser(createUserDto: CreateUserDto) {
        let created_by = 1; // 1 表示系统创建
        let { password, roles, ...data } = createUserDto;
        if (!data.nickname) {
            data.nickname = data.username; // 如果没有输入直接使用用户名
        }

        const isUserNameExist = await this.prismaService.shiro_user.findFirst({
            where: {
                username: data.username
            }
        });
        if (isUserNameExist) {
            throw new BusinessException('用户名已存在');
        }
        await this.roleService.checkHasRoles(roles);
        const newUser = await this.prismaService.shiro_user.create({
            data: {
                ...data,
                created_by,
                password: md5(password),
                roles: {
                    create: roles.map((role_id) => ({ role_id }))
                }
            },
            include: {
                roles: true
            },
            omit: {
                password: true,
                psalt: true
            }
        });
        return newUser;
    }
    // 更新用户信息
    async updateUser(id: number, updateUserDto: UpdateUserDto) {
        console.log(id, updateUserDto);
        let { password, roles, ...data } = updateUserDto;
        const hasUser = await this.prismaService.shiro_user.findFirst({
            where: { id }
        });
        if (!hasUser) {
            throw new BusinessException(ErrorEnum.USER_NOT_FOUND);
        }
        await this.roleService.checkHasRoles(roles);
        const user = await this.prismaService.shiro_user.update({
            where: { id },
            data: {
                ...data,
                password: isNil(password) ? password : md5(password),
                roles: {
                    deleteMany: {}, // 先删除全部
                    create: roles.map((role_id) => ({ role_id }))
                }
            }
        });
        return user;
    }
    // 删除指定用户
    async deleteUser(id: shiro_user['id']) {
        return await this.prismaService.shiro_user.delete({
            where: {
                id
            }
        });
    }
    // 分配角色
    async assignRole(id: shiro_user['id'], roles: shiro_role['id'][]) {
        const user = await this.getUserByID(id);
        if (!user) {
            throw new BusinessException(ErrorEnum.USER_NOT_FOUND);
        }
        await this.roleService.checkHasRoles(roles);
        // 获取当前用户拥有的角色
        const currentUserRoleIds = (
            await this.prismaService.shiro_user_role.findMany({
                where: {
                    user_id: id
                },
                select: {
                    role_id: true
                }
            })
        ).map((role) => role.role_id);
        // 计算需要分配的角色 当前[234] 新的[345] 差集[2,5] 新增的:[2,5]和新的[345]取交集 删除的:[2,5]和旧的[234]取交集
        const OldXORNew = xor(currentUserRoleIds, roles);
        const addMenus = intersection(OldXORNew, roles);
        const deleteMenus = intersection(OldXORNew, currentUserRoleIds);
        return await this.prismaService.$transaction([
            this.prismaService.shiro_user_role.deleteMany({
                where: {
                    user_id: id,
                    role_id: { in: deleteMenus }
                }
            }),
            this.prismaService.shiro_user_role.createMany({
                data: addMenus.map((role) => ({
                    user_id: id,
                    role_id: role
                }))
            })
        ]);
    }
    // 获取指定用户的所有权限
    async getMenusByID(userID: number) {
        // 第一步：查询用户的所有角色ID
        let roleIDs = (
            await this.prismaService.shiro_user_role.findMany({
                where: {
                    user_id: userID
                },
                select: {
                    role_id: true
                }
            })
        ).map((role) => role.role_id);

        if (roleIDs.length === 0) return [];

        // 通过角色ID查询所有菜单
        const roleMenus = await this.prismaService.shiro_role_menu.findMany({
            where: {
                role_id: { in: roleIDs }
            },
            include: {
                menu: true
            }
        });

        // 返回菜单数组
        let menus = new Set<shiro_menu>();
        roleMenus.forEach((rm) => menus.add(rm.menu));
        return [...menus];
    }
    // 获取指定用户的所有角色
    async getRolesByID(userID: number) {
        let findRoles = await this.prismaService.shiro_user_role.findMany({
            where: {
                user_id: userID
            },
            include: {
                role: true
            }
        });
        if (!findRoles) return [];
        return findRoles.map((user_role) => user_role.role.code);
    }
}
