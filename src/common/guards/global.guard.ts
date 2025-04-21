import { UserService } from '@/modules/user/user.service';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import jsep from 'jsep';
import { ONLY_LOGIN_KEY, PERMISSIONS_KEY, PUBLIC_KEY, SUPER_ADMIN_KEY } from '../constants/auth.constant';
import { ErrorEnum } from '../constants/error_code.constant';
import { UnauthException } from '../exceptions/unauth.exceptions';
@Injectable()
export class GlobalGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly userService: UserService
    ) {}
    async canActivate(context: ExecutionContext) {
        const request: Request & { user: { id: number; username: string } } = context.switchToHttp().getRequest();
        let handler = context.getHandler();
        let classHandler = context.getClass();
        let canPass = false;

        const isPublic = this.reflector.getAllAndOverride(PUBLIC_KEY, [handler, classHandler]);

        // 控制器设置为公开，则默认通过
        if (isPublic) {
            return true;
        }
        // 获取用户信息,判断是否登录
        let user = request.user;

        console.log(user);
        // 只要登录后就能访问
        const onlyLogin = this.reflector.getAllAndOverride(ONLY_LOGIN_KEY, [handler, classHandler]);
        if (onlyLogin && user) {
            return true;
        }

        // 获取接口所需权限组
        let permissions: string = this.reflector.getAllAndOverride(PERMISSIONS_KEY, [handler, classHandler]);
        console.log('获取接口所需权限组', permissions);
        // 控制器没有设置接口权限，则默认通过
        if (!permissions || permissions.length === 0) return true;
        // 获取用户的权限和角色

        let userRoles = (await this.userService.getRolesByID(user.id));
        console.log('获取用户的角色', userRoles);
        let userPermissions = (await this.userService.getMenusByID(user.id)).map((menu) => menu.permission);
        console.log('获取用户的权限', userPermissions);

        // 管理员放开所有权限
        if (userRoles.includes(SUPER_ADMIN_KEY)) return true;

        // 如果权限为字符串判断用户的权限是否包含所需权限(单权限)
        if (typeof permissions === 'string') {
            canPass = this.checkAccess(permissions, userRoles, userPermissions);
            if (canPass) return true;
        }

        // 如果权限为数组判断用户的权限是否包含接口所需所有权限
        if (Array.isArray(permissions)) {
            canPass = permissions.every((permission, index, array) => {
                return this.checkAccess(permission, userRoles, userPermissions);
            });
            if (canPass) return true;
            else permissions = permissions.join('&&');
        }
        // 表达式使用 jsep 生成 ast 进行鉴权
        canPass = this.evaluatePermissionExpression(permissions, userRoles, userPermissions);
        // 无权限, 抛出业务无权限错误码
        if (!canPass) {
            throw new UnauthException(ErrorEnum.PERMISSION_DENIED);
        }
        return true;
    }

    // 如果是 *.*.* 则则代表有这个模块下的所有权限,直接通过
    // 权限分成权限字段( 模块.子模块.接口方法(前端是模块.子模块.按钮)) 和角色字段 :user :role 这样的形式,也就是说,权限字段可以验证权限或者用户组
    // 后端 nestjs 的控制器和控制器方法 通过AttachPermissions装饰器来定义接口所需要的权限,并通过GlobalGuard守卫获取到用户的所有权限,和接口的控制器和方法定义的权限做比较判断是否通过
    // 在接口控制器或者方法上AttachPermissions装饰器可以传如下结构 AttachPermissions("perm:system.user.add||(role:user1 && perm:system.user.*)")这种过通过&&和||表示拥有 system.user.add 权限或者
    // 调用接口者有 user1 角色,且有 system.user.*这样的权限
    // 在接口控制器或者方法上AttachPermissions装饰器可以传如下结构 AttachPermissions("role:admin||((perm:system.user.list && perm:system.user.add)&&(perm:system.test.*||role:test))")这种过通过&&和||表示拥有 admin角色或者
    // 调用接口者有 system.user.list 和 system.user.add 权限,且有 system.test.* 或者是属于 test 角色  这样的权限

    // 解析权限字符串中的 || && ! () 进行判断权限
    private evaluatePermissionExpression(expression: string, roles: string[], permissions: string[]): boolean {
        jsep.addIdentifierChar(':');
        jsep.addIdentifierChar('.');
        jsep.addIdentifierChar('*');
        const ast = jsep(expression);

        const evaluate = (node: jsep.Expression): boolean => {
            switch (node.type) {
                case 'BinaryExpression': {
                    // 如果运算符左侧或右侧有子节点,遍历求值子节点
                    const left = evaluate(node.left as jsep.Expression);
                    const right = evaluate(node.right as jsep.Expression);
                    if (node.operator === '||') return left || right;
                    if (node.operator === '&&') return left && right;
                    throw new Error(`Unsupported operator ${node.operator}`);
                }
                case 'Literal': {
                    return this.checkAccess(String(node.value), roles, permissions);
                }
                case 'Identifier': {
                    // 如果节点类型为字符串,则为权限或者角色定义,检测权限或角色是否符合规则
                    return this.checkAccess((node as jsep.Identifier).name, roles, permissions);
                }
                case 'UnaryExpression': {
                    // 如果取反,求值解析到的 取反符号的.argument
                    if (node.operator === '!') return !evaluate((node as jsep.UnaryExpression).argument);
                    throw new Error(`Unsupported unary operator ${node.operator}`);
                }
                default:
                    // 传入了不支持的运算符类型
                    throw new Error(`Unsupported node type: ${node.type}`);
            }
        };

        return evaluate(ast);
    }

    private checkAccess(field: string, roles: string[], permissions: string[]): boolean {
        if (field.startsWith('Role:')) {
            console.log('ROle');
            const roleName = field.slice(5);
            return roles.includes(roleName);
        }

        if (field.startsWith('Perm:')) {
            console.log('Permi');
            const requiredPerm = field.slice(5);
            return permissions.some((userPerm) => this.matchPermission(userPerm, requiredPerm));
        }

        return false;
    }

    private matchPermission(userPermission: string, required: string): boolean {
        console.log(' 用户权限: ', userPermission, ' 需要的权限 ', required);
        if (userPermission === '*.*.*') return true;

        const upParts = userPermission.split('.');
        const rpParts = required.split('.');

        for (let i = 0; i < 3; i++) {
            if (upParts[i] === '*') continue;
            if (upParts[i] !== rpParts[i]) return false;
        }

        return true;
    }
}
