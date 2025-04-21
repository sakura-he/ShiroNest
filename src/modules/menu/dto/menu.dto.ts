import { MenuLayoutTypeEnum, MenuStatusEnum, MenuTypeEnum, PageTypeEnum } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CatalogSchema = z.object({
    type: z.literal(MenuTypeEnum.Catalog), // 明确指定类型为 'Catalog'
    pid: z.union([z.number(), z.undefined(), z.null()]), // pid 可选，或 undefined
    title: z.string().min(1),
    permission: z.string().min(1),
    path: z.union([z.string().min(1), z.null()]).optional(),
    icon: z.string().min(1).optional(),
    order: z.coerce.number().optional(),
    is_menu_visible: z.boolean(),
    status: z.nativeEnum(MenuStatusEnum).optional(),
    show_children: z.boolean() // show_children 必须是 undefined
});

const PageSchema = z.object({
    type: z.literal(MenuTypeEnum.Page), // 明确指定类型为 'Page'
    pid: z.number(),
    title: z.string().min(1),
    component_path: z.string().min(1),
    component_name: z.string().min(1),
    permission: z.string().min(1),
    path: z.union([z.string().min(1), z.null()]).optional(),
    icon: z.string().min(1).optional(),
    order: z.coerce.number().optional(),
    layout: z.nativeEnum(MenuLayoutTypeEnum), // layout 必须存在
    page_type: z.nativeEnum(PageTypeEnum), // page_type 必须存在
    is_resident: z.boolean(),
    is_cache: z.boolean(),
    is_menu_visible: z.boolean(),
    is_tab_visible: z.boolean(),
    status: z.nativeEnum(MenuStatusEnum).optional(),
    
});

const ButtonSchema = z.object({
    type: z.literal(MenuTypeEnum.Button), // 明确指定类型为 'Button'
    pid: z.number(),
    title: z.string().min(1),
    permission: z.string().min(1),
    icon: z.string().min(1).optional(),
    order: z.coerce.number().optional(),
    status: z.nativeEnum(MenuStatusEnum).optional()
});

// 组合成一个通用的 schema
export const CreateMenuSchema = z.discriminatedUnion('type', [CatalogSchema, PageSchema, ButtonSchema]);
export type CreateMenuDto = z.infer<typeof CreateMenuSchema>;
// 更新菜单
const PartialCatalogSchema = CatalogSchema.extend({
    type: z.literal(MenuTypeEnum.Catalog) // 保留 type 的字面量值
}).partial({
    pid: true,
    title: true,
    permission: true,
    path: true,
    icon: true,
    order: true,
    is_menu_visible: true,
    status: true,
    show_children: true
});

const PartialPageSchema = PageSchema.extend({
    type: z.literal(MenuTypeEnum.Page)
}).partial({
    pid: true,
    title: true,
    component_path: true,
    component_name: true,
    permission: true,
    path: true,
    icon: true,
    order: true,
    layout: true,
    page_type: true,
    is_resident: true,
    is_cache: true,
    is_menu_visible: true,
    is_tab_visible: true,
    status: true,
   
});

const PartialButtonSchema = ButtonSchema.extend({
    type: z.literal(MenuTypeEnum.Button)
}).partial({
    pid: true,
    title: true,
    permission: true,
    icon: true,
    order: true,
    status: true
});
export const UpdateMenuSchema = z.intersection(
    z.discriminatedUnion('type', [PartialCatalogSchema, PartialPageSchema, PartialButtonSchema]),
    z.object({
        id: z.number()
    })
);
export type UpdateMenuDto = z.infer<typeof UpdateMenuSchema>;

// 获取所有菜单(分页)
export const QueryMenuListSchema = z
    .object({
        name: z.coerce.string().optional(),

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
export class QueryMenuListDto extends createZodDto(QueryMenuListSchema) {}
