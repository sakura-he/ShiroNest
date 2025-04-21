import { Body, Controller, Delete, Get, Post, Put, Query } from '@nestjs/common';
import { DictService } from './dict.service';

@Controller('dict')
export class DictController {
    constructor(private readonly dictService: DictService) {}

    // 获取字典列表
    @Get('list')
    async getDictList(@Query('category') category: string) {
        return this.dictService.getDictList(category);
    }
    // 更新字典
    @Put('update')
    async updateDict(@Body() dict: any, @Body('id') id: number) {
        return this.dictService.updateDict(id, dict);
    }
    // 删除字典
    @Delete('delete')
    async deleteDict(@Body('id') id: number) {
        return this.dictService.deleteDict(id);
    }
    // 创建字典
    @Post('create')
    async createDict(@Body() dict: any) {
        return this.dictService.createDict(dict);
    }
}
