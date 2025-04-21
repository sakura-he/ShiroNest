import { Body, Controller, Delete, Get, OnModuleInit, Param, Post, Query } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { CreateMenuDto, CreateMenuSchema, QueryMenuListDto, UpdateMenuDto, UpdateMenuSchema } from './dto/menu.dto';
import { MenuService } from './menu.service';
@Controller('menu')
export class MenuController implements OnModuleInit {
    constructor(private readonly menuService: MenuService) {}
    onModuleInit() {
        // this.test()
    }
    // 创建权限
    @Post('create_menu')
    create_menu(@Body(new ZodValidationPipe(CreateMenuSchema)) createMenuDto: CreateMenuDto) {
        return this.menuService.create_menu(createMenuDto);
    }
    // 查询所有权限
    @Get('get_all_menus')
    findAll(@Query() query: QueryMenuListDto) {
        return this.menuService.findAll();
    }
    // 查询单个权限
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.menuService.findOne(+id);
    }
    // 更新权限
    @Post('update_menu')
    update(@Body(new ZodValidationPipe(UpdateMenuSchema)) updateMenuDto: UpdateMenuDto) {
        return this.menuService.update(updateMenuDto);
    }
    // 删除权限
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.menuService.deleteMenu(+id);
    }
}
