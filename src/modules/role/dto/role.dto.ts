import { RoleStatusEnum } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';

import { z } from 'zod';

// 创建角色
export const CreateRoleDataSchema = z.object({
    name: z.string().trim().min(1),
    code: z.string().trim().min(1),
    description: z.union([z.string().trim().min(1), z.null()]).optional(),
    status: z.nativeEnum(RoleStatusEnum),
    menus: z.array(z.number())
});
export class CreateRoleDataDto extends createZodDto(CreateRoleDataSchema) {}
export class CreateRoleDto extends createZodDto(CreateRoleDataSchema) {}
// 更新角色信息
export const UpdateRoleDataSchema = z.object({
    name: z.coerce.string().trim().min(1).optional(),
    code: z.coerce.string().trim().min(1).optional(),
    description: z.union([z.string().trim().min(1), z.null()]).optional(),
    status: z.nativeEnum(RoleStatusEnum).optional(),
    menus: z.array(z.number())
});
export class UpdateRoleDataDto extends createZodDto(UpdateRoleDataSchema) {}
export class UpdateRoleDto extends createZodDto(UpdateRoleDataSchema) {}
// 分页查询所有角色
export const QueryRoleListSchema = z
    .object({
        name: z.coerce.string().optional(),
        status: z.nativeEnum(RoleStatusEnum).optional(),
        // 首先验证是否为 string 类型,或者 undefind
        // 如果为 string,进行转换并验证是否为 string[]且长度为 2
        created_at: z
            .string()
            .transform((str) => {
                return str.split(',');
            })
            .pipe(z.array(z.string().datetime()).length(2))
            .optional(),
        page_size: z.coerce.number().min(1).optional(),
        page: z.coerce.number().min(1).optional()
    })
    .refine(
        (data) =>
            (data.page_size === undefined && data.page === undefined) ||
            (data.page_size !== undefined && data.page !== undefined),
        {
            message: 'Both page_size and page must be provided together or omitted together.',
            path: ['page_size', 'page']
        }
    );
export class QueryRoleListDto extends createZodDto(QueryRoleListSchema) {}
