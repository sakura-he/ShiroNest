import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { ZodSchema } from 'zod';
import { BusinessException } from '../exceptions/biz.exceptions';

export class ZodValidationPipe implements PipeTransform {
    constructor(private schema: ZodSchema) {}

    transform(value: unknown, metadata: ArgumentMetadata) {
        try {
            const parsedValue = this.schema.parse(value);
            return parsedValue;
        } catch (error: any) {
            // 抛出业务错误
            throw new BusinessException(error.message);
        }
    }
}

@Injectable()
export class ZodValidate implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        console.log('value:', value);
        console.log('metadata:', metadata);
        console.log('sadfasdfs');
        // @ts-ignore
        const test = new metadata.metatype();
        console.log('hi', test.name);
        return value;
    }
}
