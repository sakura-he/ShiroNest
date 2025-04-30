import { AllExceptionsFilter } from '@/common/filters/all_exception.filter';
import { ZodValidationExceptionFilter } from '@/common/filters/nest_zod_exception.filter';
import { GlobalGuard } from '@/common/guards/global.guard';
import { JwtGuard } from '@/common/guards/jwt.guard';
import { LogInterceptor } from '@/common/interceptors/log.interceptor';
import { ResponseFormatInterceptor } from '@/common/interceptors/response_format.interceptor';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { ZodValidationPipe } from 'nestjs-zod';
import { PrismaModule } from '../prisma/prisma.module';
import { AccountModule } from './account/account.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import defaultConfig from './config/default.config';
import { MenuModule } from './menu/menu.module';
import { RoleModule } from './role/role.module';
import { TaskModule } from './system/task/task.module';
import { UserController } from './user/user.controller';
import { UserModule } from './user/user.module';
import { SatModule } from './sat/sat.module';
@Module({
    imports: [
        TaskModule,
        UserModule,
        PrismaModule,
        CommonModule,
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env.development', '.env.production', '.env'],
            load: [
                () => {
                    return { name: 'name' };
                },
                defaultConfig
            ],
            cache: true
        }),
        ScheduleModule.forRoot(),
        JwtModule.registerAsync({
            global: true,
            useFactory: async (configService: ConfigService) => {
                return {
                    secret: await configService.get('JWT_SECRET')
                };
            },
            inject: [ConfigService]
        }),
        AuthModule,
        RoleModule,
        MenuModule,
        AccountModule,
        SatModule
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_GUARD,
            useClass: JwtGuard
        },
        {
            provide: APP_GUARD,
            useClass: GlobalGuard
        },
        
        {
            provide: APP_FILTER,
            useClass: AllExceptionsFilter
        },
        // 异常过滤器后注册的过滤器会覆盖前面的
        {
            provide: APP_FILTER,
            useClass: ZodValidationExceptionFilter
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: LogInterceptor
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: ResponseFormatInterceptor
        },
        {
            provide: APP_PIPE,
            useClass: ZodValidationPipe
        },
    ]
})
export class AppModule implements NestModule {
    constructor() {}
    configure(consumer: MiddlewareConsumer) {
        consumer.apply().forRoutes(UserController);
    }
}
console.log(AppModule);
