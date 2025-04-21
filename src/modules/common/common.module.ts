import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

import { UploadModule } from './upload/upload.module';
import { DictModule } from './dict/dict.module';
@Module({
    imports: [
        UploadModule,
        RouterModule.register([
            {
                path: 'common',
                module: CommonModule,
                children: [UploadModule]
            }
        ]),
        DictModule
    ],
    exports: []
})
export class CommonModule {
    constructor() {}
}
