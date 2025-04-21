import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    constructor() {
        console.log('LoggerMiddleware 初始化');
    }
    use(req: Request, res: Response, next: NextFunction) {
        next();
    }
}
