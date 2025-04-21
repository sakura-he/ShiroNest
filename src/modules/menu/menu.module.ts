import { PrismaModule } from '@/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { RoleModule } from '../role/role.module';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';

@Module({
    imports:[RoleModule,PrismaModule],
    controllers: [MenuController],
    providers: [MenuService],
    exports:[MenuService]
})
export class MenuModule {}
