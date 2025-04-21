import { VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { PrismaClient } from '@prisma/client';
import { ZodValidate } from './common/pipes/zodValidate.pipe';
import { AppModule } from './modules/app.module';
import './utils/bigInt_tostring';
const prisma = new PrismaClient();

async function bootstrap() {
    const app: NestExpressApplication = await NestFactory.create(AppModule);
    // let prismaService = app.get(PrismaService);
    // 等待 prismaService 初始化连接到数据库后，再监听端口
    // await prismaService.onModuleInit();
    app.enableVersioning({
        type: VersioningType.HEADER,
        header: 'version'
    });
    // 设置静态文件目录
    app.useStaticAssets('static', {
        prefix: '/static'
    });
    app.enableCors({
        origin: '*',
        allowedHeaders: ['Authorization', 'content-type'],
        methods: 'GET,POST,HEAD,PUT,PATCH,POST,DELETE'
    });

    console.log('NestJS 应用启动成功，监听端口 3000');
    let config = app.get(ConfigService);
    // app.useGlobalGuards(new GlobalGuard());
    // app.useGlobalPipes(
    //     new ZodValidate()
    // );
    await app.listen(3000);
}

bootstrap()
    .then(async () => {
        console.log('bootstrap');
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
