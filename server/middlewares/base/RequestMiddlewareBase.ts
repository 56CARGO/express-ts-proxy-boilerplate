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
        this.getReqestBody(req).then(body => this.logRequest(req, body));
    }

    private getReqestBody(req: Request): Promise<any> {
        return new Promise((resolve, reject) => {
            if (req.body || req.method !== 'POST') {
                resolve(req.body);
                return;
            }
            const chunks = [];
            req.on('data', c => chunks.push(c))
               .on('end', () => {
                    const buffer = Buffer.concat(chunks);
                    const body = JsonHelper.deserialze(buffer.toString());
                    resolve(body);
                });
        });
    }

    private logRequest(req: Request, body: any) {
        const msg = 'Request path: ' + req.originalUrl + EOL +
                    'Request body:' + EOL + JsonHelper.serialize(body) + EOL +
                    'Request params:' + EOL + JsonHelper.serialize(req.params) + EOL +
                    'Request headers:' + EOL + JsonHelper.serialize(req.headers);

        GloablLogger.info(msg);
    }

}
