import { AppConfigs } from './../../configs/app.config';
import { Request, Response, NextFunction } from 'express';
import * as HttpProxy from 'http-proxy';
import { GloablLogger } from '../../helpers/logger';
import { EOL } from 'os';
import { HeaderHelper } from '../../helpers/header.helper';
import { QueryHelper } from '../../helpers/query.helper';
import * as urlParser from 'url';
import { HttpPathHelper } from '../../helpers/http-path.helper';
import { RequestMiddlewareBase } from '../base/RequestMiddlewareBase';
import * as httpsProxyAgent from 'https-proxy-agent';
import * as httpProxyAgent from 'http-proxy-agent';
import { ClientError } from '../../models/error';
import { ApiErrorHandlingMiddleware } from '../error/api-error-handler';


export class DownloadMiddleware extends RequestMiddlewareBase {

    private proxy: HttpProxy;

    constructor() {
        super();

        this.proxy = HttpProxy.createProxyServer({
            changeOrigin: true,
            prependPath: true,
            ignorePath: true,
        });

        this.proxy.on('error', (err, req, res: Response, target: any) => {
            GloablLogger.error(`path: ${target.href} ${EOL} ${err.stack}`, 'download proxy error:');
            const errorResult: ClientError = {
                errorId: -1,
                errorCode: 'DOWNLOAD_PROXY_ERROR',
                errorMsg: err.message,
                status: 500
            };
            ApiErrorHandlingMiddleware.outputError(res, errorResult);
        });

        this.proxy.on('proxyRes', (proxyRes, req, res) => {
            GloablLogger.info(`${req.url} Download success`);
        });
    }


    execute(req: Request, res: Response, next: NextFunction) {
        const headers = HeaderHelper.getHeader(req) as {[header: string]: string};
        const query = QueryHelper.supplementRequestQuery(req.query, headers);

        const originalUrl = urlParser.parse(req.path).path;
        let url = `${AppConfigs.HTTPS ? 'https' : 'http'}://${AppConfigs.API_HOST}:${AppConfigs.API_PORT}${originalUrl}`;
        url = HttpPathHelper.constructPathWithParams(url, query);

        const options: HttpProxy.ServerOptions = {
            target: url,
            headers
        };

        // 是否使用翻墙代理
        if (process.env.USE_PROXY) {
            options.agent = AppConfigs.HTTPS ? new httpsProxyAgent(AppConfigs.agentHost)
                                             : new httpProxyAgent(AppConfigs.agentHost);
        }

        this.proxy.web(req, res, options);
    }

}
