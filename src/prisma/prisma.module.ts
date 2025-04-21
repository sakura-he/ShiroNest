import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
    providers: [
        {
            provide: PrismaService,
            useFactory: async () => {
                console.log('初始化 PrismaService');
                const prisma = new PrismaService();
                // 等待 prismaService 初始化连接到数据库后，模块再继续初始化
                await prisma.onModuleInit();
                return prisma;
            }
        }
    ],
    exports: [PrismaService]
})
export class PrismaModule {}
