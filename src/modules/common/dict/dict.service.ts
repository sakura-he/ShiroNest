import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
@Injectable()
export class DictService {
    constructor(private readonly prisma: PrismaService) {}

    async getDictList(category: string) {
        return this.prisma.shiro_dict.findMany({
            where: { category }
        });
    }

    async getDictListByCategoryAndCode(category: string, code: string) {
        return this.prisma.shiro_dict.findFirst({
            where: { category }
        });
    }

    async getDictListByCategory(category: string) {
        return this.prisma.shiro_dict.findMany({
            where: { category }
        });
    }

    // 新增字典
    async createDict(dict: any) {
        return this.prisma.shiro_dict.create({
            data: dict
        });
    }

    // 更新字典
    async updateDict(id: number, dict: any) {
        return this.prisma.shiro_dict.update({
            where: { id },
            data: dict
        });
    }

    // 删除字典
    async deleteDict(id: number) {
        return this.prisma.shiro_dict.delete({
            where: { id }
        });
    }

    // 批量删除字典
    async deleteDicts(ids: number[]) {
        return this.prisma.shiro_dict.deleteMany({
            where: { id: { in: ids } }
        });
    }
}
