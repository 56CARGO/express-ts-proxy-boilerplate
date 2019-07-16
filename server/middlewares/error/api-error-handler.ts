import { ClientError } from './../../models/error';
import { ErrorMiddlewareBase } from '../base/MiddlewareBase';
import { Request, Response, NextFunction } from 'express';
import { GloablLogger } from '../../helpers/logger';
import { ApiRequestException } from '../../exceptions/ApiRequestException';
import { ServerError } from '../../models/error';




export class ApiErrorHandlingMiddleware extends ErrorMiddlewareBase {


    static outputError(res: Response, error: ClientError) {
        res.status(error.status || 500)
           .json({ error });
    }

    use(err: any, req: Request, res: Response, next: NextFunction) {

        let errorResult: ClientError = {} as ClientError;

        if (err instanceof ApiRequestException) {
            const nativeErr: ServerError | Error
            = err.nativeError || {} as (ServerError | Error);

            errorResult = {
                errorId: (nativeErr as ServerError).ErrorId || -1,
                errorCode: (nativeErr as ServerError).ErrorCode || err.code || 'Unknown Error',
                errorMsg: err.message || (nativeErr as ServerError).Message,
                status: err.status
            };

            GloablLogger.error(JSON.stringify(errorResult), 'Error Message:');
        } else {
            GloablLogger.fatal(err.stack);
        }

        ApiErrorHandlingMiddleware.outputError(res, errorResult);
    }


}
