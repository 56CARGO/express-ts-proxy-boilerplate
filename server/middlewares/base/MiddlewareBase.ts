import { Request, Response, NextFunction, Handler } from 'express';

export abstract class MiddlewareBase {

    abstract use(req: Request, res: Response, next: NextFunction): any;
    config(): Handler {
        return this.use.bind(this);
    }
}

export abstract class ErrorMiddlewareBase {

    abstract use(err: any, req: Request, res: Response, next: NextFunction): any;

    config(): Handler {
        return this.use.bind(this);
    }
}

