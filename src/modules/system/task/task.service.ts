import { ErrorEnum } from '@/common/constants/error_code.constant';
import { BusinessException } from '@/common/exceptions/biz.exceptions';
import { PrismaService } from '@/prisma/prisma.service';
import { ClearChunksTaskService } from '@/tasks/clear_chunks_task';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { shiro_task, TaskStatus, TaskStrategy } from '@prisma/client';
import { CronJob } from 'cron';
import dayjs from 'dayjs';
import { QueryTaskListDto, TaskDto, UpdateTaskDto } from './dto/task.dto';
/* 一个 handler 对应多个 job, 一个 job 对应一个任务 */
@Injectable()
export class TaskService implements OnModuleInit {
    private handlers: Map<string, Function> = new Map();
    constructor(
        private readonly prismaService: PrismaService,
        private schedulerRegistry: SchedulerRegistry,
        private readonly clearChunksTaskService: ClearChunksTaskService
    ) {
        this.handlers.set('ClearMergeFilesChunksTask', this.clearChunksTaskService.clearMergeFilesChunksTask);
    }
    async onModuleInit() {
        /* 初始化时从数据库获取所有任务记录并生成对应的定时任务 */
        const tasks = await this.prismaService.shiro_task.findMany();

        tasks.forEach((task) => {
            this.generatorCornJob(task);
        });
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
    async getTaskList(query: QueryTaskListDto) {
        const [records, pagination] = await this.prismaService.shiro_task.findManyAndCount({
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
            }
        });
        return {
            records,
            pagination
        };
    }

    /**
     * 手动执行一次指定任务
     * @param task_id 任务ID
     * @returns 任务执行结果
     */
    async runTask(task_id: number) {
        const task = await this.prismaService.shiro_task.findFirst({
            where: {
                id: task_id
            }
        });
        if (!task) {
            throw new BusinessException(ErrorEnum.TASK_NOT_FOUND);
        }
        const handler = this.handlers.get(task.handler);
        if (handler) return handler(...(Array.isArray(task.params) ? task.params : []));
        throw new BusinessException(ErrorEnum.TASK_HANDLER_NOT_FOUND);
    }

    /**
     * 获取指定job运行状态信息
     * @param name 任务名称
     * @returns 任务运行状态,包含运行状态、下次执行时间等信息
     */
    getJobStatus(name?: string) {
        if (name) {
            const job = this.schedulerRegistry.getCronJob(name);
            return {
                name: name,
                is_runing: job.running,
                next: job.nextDate() as any,
                last: job.lastDate() as any,
                prev: job.nextDates() as any
            };
        }
    }

    /**
     * 获取所有job的运行状态
     * @returns 所有任务的运行状态列表
     */
    getAllJobStatus() {
        let jobs: {
            name: string;
            is_runing: boolean;
            next: Date;
            last: Date | null;
            prev: Date | null;
        }[] = [];
        this.schedulerRegistry.getCronJobs().forEach((value, key) => {
            jobs.push({
                name: key,
                is_runing: value.running,
                next: value.nextDate() as any,
                last: value.lastDate() as any,
                prev: value.nextDates() as any
            });
        });
        return jobs;
    }

    /**
     * 根据任务配置生成job实例
     * @param task 任务配置信息
     * @returns 生成的CronJob实例
     */
    generatorCornJob(task: shiro_task) {
        const { cron, handler, strategy, status, params, name } = task;
        let JobOptions = task.options as any;
        if (typeof JobOptions !== 'object') {
            JobOptions = {} as any;
        }
        const TaskHandler = this.handlers.get(handler);
        if (!TaskHandler) {
            throw new BusinessException(ErrorEnum.TASK_HANDLER_NOT_FOUND);
        }
        const job = CronJob.from({
            cronTime: cron, // 任务执行时间
            onTick: () => {
                let result: any = undefined;

                if (Array.isArray(params)) {
                    result = TaskHandler(...params);
                }
                if (strategy !== TaskStrategy.AUTO) {
                    job.stop();
                }
                result = TaskHandler();
                return result;
            },

            start: false,
            runOnInit: strategy === TaskStrategy.ONCE_AUTO ? true : false,
            waitForCompletion: JobOptions?.waitForCompletion ?? false,
            errorHandler: JobOptions?.errorHandler ?? undefined
        });
        this.schedulerRegistry.addCronJob(name, job);
        // 如果任务状态为启用,并且策略为自动执行或执行一次,则启动任务
        if (status === TaskStatus.ENABLE && (strategy === TaskStrategy.AUTO || strategy === TaskStrategy.ONCE_AUTO)) {
            job.start();
        }
        return job;
    }

    /**
     * 更新定时任务配置
     * @param task 更新的任务信息
     * @returns 更新后的任务数据
     */
    async updateTask(task: UpdateTaskDto) {
        const { id, ...rest } = task;
        if (rest.handler) this.hasCronHandler(rest.handler);
        const oldTaskData = await this.prismaService.shiro_task.findFirst({
            where: { id },
            omit: {
                created_at: true,
                updated_at: true
            }
        });
        if (!oldTaskData) {
            throw new BusinessException(ErrorEnum.TASK_NOT_FOUND);
        }
        this.schedulerRegistry.deleteCronJob(oldTaskData.name);
        const taskData = await this.prismaService.shiro_task.update({
            where: { id },
            // @ts-ignore
            data: {
                ...oldTaskData,
                ...rest
            }
        });

        this.generatorCornJob(taskData);
        return taskData;
    }

    /**
     * 删除指定任务
     * @param id 任务ID
     */
    async deleteTask(id: number) {
        const delteTask = await this.prismaService.shiro_task.delete({
            where: {
                user_id: 1,
                id
            }
        });
        this.schedulerRegistry.deleteCronJob(delteTask.name);
    }

    /**
     * 创建新的定时任务
     * @param task 任务配置信息
     * @returns 创建的任务数据
     */
    async createTask(task: TaskDto) {
        if (task.handler) this.hasCronHandler(task.handler);

        return await this.prismaService.shiro_task.create({
            // @ts-ignore
            data: {
                user_id: 1,
                ...task
            }
        });
    }

    /**
     * 检查指定的job handler是否存在
     * @param handlerName 处理器名称
     * @returns true表示存在,否则抛出异常
     */
    hasCronHandler(handlerName: string) {
        if (this.handlers.has(handlerName)) {
            return true;
        }
        throw new BusinessException(ErrorEnum.TASK_HANDLER_NOT_FOUND);
    }

    /**
     * 切换任务的启用/禁用状态
     * @param task_id 任务ID
     * @param status 目标状态
     */
    swtichJobStatus = async (task_id: number, status: TaskStatus) => {
        const task = await this.prismaService.shiro_task.findFirst({
            where: {
                id: task_id
            }
        });
        if (!task) throw new BusinessException(ErrorEnum.TASK_NOT_FOUND);
        const job = this.schedulerRegistry.getCronJob(task.name);

        if (status === TaskStatus.ENABLE) {
            job.start();
        } else {
            job.stop();
        }
        await this.prismaService.shiro_task.update({
            where: {
                id: task_id
            },
            data: {
                status
            }
        });
    };
}
