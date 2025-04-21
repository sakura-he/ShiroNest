import { PrismaService } from '@/prisma/prisma.service';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';

@Module({
    providers: [AuthService, PrismaService],
    exports:[AuthService,PrismaService]
})
export class AuthModule {}
