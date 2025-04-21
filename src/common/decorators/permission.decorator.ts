import { SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../constants/auth.constant';
// 定义definePermission函数返回值类型
type TupleToObject<T extends string, P extends ReadonlyArray<string>> = {
    [K in Uppercase<P[number]>]: `${T}:${Lowercase<K>}`;
};
type AddPrefixToObjectValue<T extends string, P extends Record<string, string>> = {
    [K in keyof P]: K extends string ? `${T}:${P[K]}` : never;
};
export const Roles = Reflector.createDecorator<string[]>();

/**
 * 附加模块或控制器所需权限 支持权限字符串,权限数组,表达式
 *  使用示例
 *  1.定义接口需要 Perm:system.user.add 权限: 传入Perm:system.user.add
 *  2.定义接口需要 Perm:system.user.add 与 Perm:system.user.remove 权限: 传入[Perm:system.user.add,Perm:system.user.remove]
 *  3.定义接口为表达式, 如这个接口需要 admin 角色或 为 user角色但要有Perm:system.user.remove与Perm:system.user.add 权限:
 *     传入 Role:admin || (Role:User && Perm:system.user.remove && Perm:system.user.add)
 *  注意: 表达式方式比较耗费性能, 只有在定义复杂权限规则的时候使用
 * @param permissions string string[]
 * @returns
 */
export function AttachPermissions(permissions: string[] | string) {
    return SetMetadata(PERMISSIONS_KEY, permissions);
}
// 判断是否是标准对象
export function isPlainObject(value: any) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * definePermission(prefix,permissions)
 * 将所需权限转换成标准格式
 * @param prefix 前缀        例如：system:user
 * @param permissions 权限组 例如：[list, delete] 或 {list: 'list'}
 * @returns 转换后的权限对象   例如：{LIST: 'system:user:list'}
 */
export function definePermission<T extends string, P extends ReadonlyArray<string>>(
    prefix: T,
    permissions: P
): TupleToObject<T, P>;
export function definePermission<T extends string, P extends Record<string, string>>(
    prefix: T,
    permissions: P
): AddPrefixToObjectValue<T, P>;
export function definePermission(prefix: string, permissions: string[] | Record<string, string>) {
    // 判断传入的是数组  {LIST:'system:user:list'}
    if (Array.isArray(permissions)) {
        const prefixPremissionss = permissions.map((permission) => `${prefix}.${permission}`);
        return prefixPremissionss.reduce((permissionsObject, currentValue, index, array) => {
            (permissionsObject as Record<string, string>)[permissions[index].toUpperCase()] = currentValue;
            return permissionsObject;
        }, {});
    }
    // 判断是否是 Object 类型 {LIST:'system:user:list'}
    if (isPlainObject(permissions)) {
        const permissionsObject = {};
        Object.entries(permissions).forEach(([key, value]) => {
            permissionsObject[key.toUpperCase()] = `${prefix}.${value.toLowerCase()}`;
        });
        return permissionsObject;
    }
}
