import { LocalStrategy } from '@/common/guards/strategy/local.strategy';
import { LoggerMiddleware } from '@/common/middleware/logger.middleware';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtStrategy } from '../../common/guards/strategy/jwt.strategy';
import { AuthService } from '../auth/auth.service';
import { MenuModule } from '../menu/menu.module';
import { RoleModule } from '../role/role.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
    imports: [PrismaModule, MenuModule, RoleModule],
    controllers: [UserController],
    providers: [
        {
            provide: UserService,
            useClass: UserService
        },

        AuthService,
        JwtStrategy,
        LocalStrategy
    ],
    exports: [UserService]
})
export class UserModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggerMiddleware).forRoutes(UserController);
    }
}
