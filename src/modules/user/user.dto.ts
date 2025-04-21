import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

enum UserEnum {
    ENABLE = 1,
    DISABLE = 2
}

export const CreateUserSchema = z.object({
    email: z.union([z.string().trim().min(1), z.null()]),
    username: z.string().trim().min(1),
    password: z.string().trim().min(1),
    avatar: z.union([z.string().trim().min(1), z.null()]),
    phone: z.union([z.string().trim().min(1), z.null()]),
    nickname: z.union([z.string().trim().min(1), z.null()]),
    remark: z.union([z.string().trim().min(1), z.null()]),
    status: z.nativeEnum(UserEnum),
    is_lock: z.boolean(),
    roles: z.array(z.number())
});
export class CreateUserDto extends createZodDto(CreateUserSchema) {}
export const UpdateUserSchema = z.object({
    email: z.union([z.string().trim().min(1), z.null()]).optional(),
    password: z.string().trim().min(1).optional(),
    avatar: z.union([z.string().trim().min(1), z.null()]).optional(),
    phone: z.union([z.string().trim().min(1), z.null()]).optional(),
    nickname: z.union([z.string().trim().min(1), z.null()]).optional(),
    remark: z.union([z.string().trim().min(1), z.null()]).optional(),
    status: z.nativeEnum(UserEnum).optional(),
    is_lock: z.boolean().optional(),
    roles: z.array(z.number())
});
export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}

export const QueryUserListSchema = z
    .object({
        username: z.coerce.string().optional(),
        status: z.nativeEnum(UserEnum).optional(),
        nickname: z.coerce.string().min(1).optional(),
        remark: z.string().optional(),
        phone: z.string().optional(),
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
export class QueryUserListDto extends createZodDto(QueryUserListSchema) {}
