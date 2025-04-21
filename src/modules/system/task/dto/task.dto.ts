import { TaskStatus, TaskStrategy } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const TaskSchema = z.object({
    name: z.coerce.string().min(1).optional(),
    cron: z.coerce.string().min(1).optional(),
    handler: z.coerce.string().min(1).optional(),
    remark: z.coerce.string().min(1).optional(),
    options: z.coerce
        .string()
        .refine((str) => {
            try {
                JSON.parse(str);
                return true;
            } catch {
                return false;
            }
        })
        .optional(),
    params: z.coerce
        .string()
        .refine((str) => {
            try {
                JSON.parse(str);
                return true;
            } catch {
                return false;
            }
        })
        .optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    strategy: z.nativeEnum(TaskStrategy).optional()
});
export class TaskDto extends createZodDto(TaskSchema) {}

export const CreateTaskSchema = TaskSchema;
export class CreateTaskDto extends createZodDto(CreateTaskSchema) {}

export const UpdateTaskSchema = TaskSchema.and(
    z.object({
        id: z.coerce.number()
    })
);
export class UpdateTaskDto extends createZodDto(UpdateTaskSchema) {}

export const DeleteTaskSchema = z.object({
    id: z.coerce.number()
});
export class DeleteTaskDto extends createZodDto(DeleteTaskSchema) {}

export const UpdateTaskStatusSchema = z.object({
    id: z.coerce.number(),
    status: z.nativeEnum(TaskStatus)
});
export class UpdateTaskStatusDto extends createZodDto(UpdateTaskStatusSchema) {}

export const QueryTaskListSchema = z
    .object({
        name: z.coerce.string().optional(),
        status: z.nativeEnum(TaskStatus).optional(),
        handler: z.coerce.string().min(1).optional(),
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
export class QueryTaskListDto extends createZodDto(QueryTaskListSchema) {}

export type Pagination = {
    total: number;
    page: number;
    limit: number;
};
