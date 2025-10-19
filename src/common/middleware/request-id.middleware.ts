import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const id = randomUUID();
        req.headers['x-request-id'] = id;
        res.setHeader('X-Request-Id', id);
        next();
    }
}

