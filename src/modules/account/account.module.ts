import { LocalStrategy } from '@/common/guards/strategy/local.strategy';
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';

@Module({
    imports: [ UserModule,AuthModule],
    controllers: [AccountController],
    providers: [AccountService,LocalStrategy] // 就够了喵
  })
export class AccountModule {}
