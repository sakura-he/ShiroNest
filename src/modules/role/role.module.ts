import { PrismaService } from '@/prisma/prisma.service';
import { Module } from '@nestjs/common';
import { MenuService } from '../menu/menu.service';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';

@Module({
    controllers: [RoleController],
    providers: [RoleService,MenuService, PrismaService],
    exports:[RoleService]
})
export class RoleModule {}
