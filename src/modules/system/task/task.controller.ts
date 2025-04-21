import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { TaskStatus, TaskStrategy } from '@prisma/client';
import { CreateTaskDto, DeleteTaskDto, QueryTaskListDto, UpdateTaskDto, UpdateTaskStatusDto } from './dto/task.dto';
import { TaskService } from './task.service';

/**
 * 任务控制器
 */
@Controller('system/task')
export class TaskController {
    constructor(private readonly taskService: TaskService) {}

    /**
     * 获取任务状态选项
     * @returns 任务状态选项列表
     */
    @Get('get_task_status_option')
    async getTaskStatus() {
        return [
            {
                label: '启用',
                value: TaskStatus.ENABLE,
                isEnabled: true
            },
            {
                label: '禁用',
                value: TaskStatus.DISABLE,
                isEnabled: false
            }
        ];
    }

    /**
     * 获取任务策略选项
     * @returns 任务策略选项列表
     */
    @Get('get_task_strategy_option')
    async getTaskStrategy() {
        return [
            {
                label: '手动执行',
                value: TaskStrategy.MANUAL
            },
            {
                label: '自动执行',
                value: TaskStrategy.AUTO
            },
            {
                label: '执行一次',
                value: TaskStrategy.ONCE_AUTO
            }
        ];
    }

    /**
     * 创建新任务
     * @param task 任务创建数据
     * @returns 创建的任务数据
     */
    @Post('create_task')
    async createTask(@Body() task: CreateTaskDto) {
        let taskData = await this.taskService.createTask(task);
        this.taskService.generatorCornJob(taskData);
    }

    /**
     * 更新任务配置
     * @param task 任务更新数据
     * @returns 更新后的任务数据
     */
    @Post('update_task')
    async updateTask(@Body() task: UpdateTaskDto) {
        let taskData = await this.taskService.updateTask(task);
        return taskData;
    }

    /**
     * 删除指定任务
     * @param task 要删除的任务信息
     * @returns 删除结果
     */
    @Post('delete_task')
    async deleteTask(@Body() task: DeleteTaskDto) {
        return await this.taskService.deleteTask(task.id);
    }

    /**
     * 更新任务运行状态
     * @param task 任务状态更新信息
     * @returns 更新结果
     */
    @Post('update_task_status')
    async updateTaskStatus(@Body() task: UpdateTaskStatusDto) {
        await this.taskService.swtichJobStatus(task.id, task.status);
        return {
            message: '任务状态更新成功'
        };
    }

    /**
     * 获取所有任务记录 , 分页查询
     * @param query 查询条件
     * @param query.page 页码
     * @param query.limit 每页条数
     * @param query.status 任务状态
     * @param query.name 任务名称
     * @param query.handler 任务处理器
     * @param query.created_at 任务创建时间
     * @returns 任务列表数据
     */
    @Get('get_task_list')
    async getTaskList(@Query() query: QueryTaskListDto) {
        return await this.taskService.getTaskList(query);
    }

    /**
     * 获取所有job的运行状态
     * @returns 所有job的状态信息
     */
    @Get('get_all_job_status')
    async getAllJobStatus() {
        return await this.taskService.getAllJobStatus();
    }

    /**
     * 获取指定job的运行状态
     * @param name job名称
     * @returns 指定job的状态信息
     */
    @Get('get_job_status')
    async getJobStatus(@Query('name') name: string) {
        return await this.taskService.getJobStatus(name);
    }

    /**
     * 手动执行一次指定任务
     * @param task_id 任务ID
     * @returns 任务执行结果
     */
    @Post('run_task')
    async runTask(@Body('task_id') task_id: number) {
        return await this.taskService.runTask(task_id);
    }
}
