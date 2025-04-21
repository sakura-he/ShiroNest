import { BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { ErrorEnum } from '../constants/error_code.constant';
import { BusinessException } from '../exceptions/biz.exceptions';

export function validationClassValidateExceptionFactory(errors: ValidationError[]) {
    // 获取所有的未通过的字段
    let errorMessage = errors
        .map((ValidationError) => {
            // 获取单独错误元素的属性
            let validateField = ValidationError.property;
            let validateValue = ValidationError.value;
            // 获取收到的验证约束数组
            let errorConstraints = ValidationError.constraints!;
            // 将约束提示属性转换为key+value 的字符串    ，必须满足: [${errorConstraintsMessage}]
            let errorConstraintsMessage = Object.entries(errorConstraints)
                .map(([key, value]) => {
                    return `${key}: ${value}`;
                })
                .join(', ');
            return `字段[${validateField}]验证失败! 当前值: [${validateValue}]，必须满足: [${errorConstraintsMessage}]`;
        })
        .join('; ');
    return new BadRequestException(errorMessage);
}
export function ParseIntPipeError(param: any) {
    return function (error: any) {
        return new BusinessException(`${ErrorEnum.PARAMETER_INVALID} 参数${param}转换错误}`);
    };
}
