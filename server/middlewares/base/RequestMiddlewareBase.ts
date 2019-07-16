import { MiddlewareBase } from './MiddlewareBase';
import { Request, Response, NextFunction } from 'express';
import { EOL } from 'os';
import { JsonHelper } from '../../helpers/json.helper';
import { GloablLogger } from '../../helpers/logger';



export abstract class RequestMiddlewareBase extends MiddlewareBase {

    constructor() {
        super();
    }

    use(req: Request, res: Response, next: NextFunction) {
        this.before(req);
        this.execute(req, res, next);
    }

    abstract execute(req: Request, res: Response, next: NextFunction): any;

    protected before(req: Request) {
        if (req.method === 'POST' && !req.body) {
            const chunks = [];
            req.on('data', c => chunks.push(c));
            req.on('end', () => {
                const buffer = Buffer.concat(chunks);
                req.body = buffer.toString();
                if (req.body) {
                    req.body = JsonHelper.deserialze(req.body);
                }
                this.logRequest(req);
            });
            return;
        }

        this.logRequest(req);
    }

    private logRequest(req: Request) {
        const msg = 'Request path: ' + req.originalUrl + EOL +
                    'Request body:' + EOL + JsonHelper.serialize(req.body) + EOL +
                    'Request params:' + EOL + JsonHelper.serialize(req.params) + EOL +
                    'Request headers:' + EOL + JsonHelper.serialize(req.headers);

        GloablLogger.info(msg);
    }

}
