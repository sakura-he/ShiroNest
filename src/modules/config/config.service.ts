import { PrismaService } from '@/prisma/prisma.service';
import { Inject, Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'node:path';
@Injectable()
export class ConfigService {
    private readonly envConfig: any;
    constructor(
        private readonly prismaService: PrismaService,
        @Inject('CONFIG_OPTIONS') private readonly options: any
    ) {
        console.log('options11:', this.options);
        const filePath = `${process.env.NODE_ENV || 'development'}.env`;
        console.log('__dirname:', __dirname);
        const envFile = path.resolve(__dirname, '../../', this.options.folder, filePath);
        console.log('envFile:', envFile);
        this.envConfig = dotenv.parse(fs.readFileSync(envFile));
        console.log('prismaService:', this.prismaService);
    }
    async getPrismaService() {
        return this.prismaService.shiro_user.findFirst({
            where: {
                id: 1
            }
        });
    }
}
