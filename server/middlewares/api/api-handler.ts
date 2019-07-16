import { GloablLogger } from './../../helpers/logger';
import { RequestOptions, IncomingMessage } from 'http';
import * as httpsProxyAgent from 'https-proxy-agent';
import * as httpProxyAgent from 'http-proxy-agent';
import { Request, Response, NextFunction } from 'express';
import { request as httpRequest } from 'http';
import { request as httpsRequest } from 'https';
import { AppConfigs } from '../../configs/app.config';
import { HeaderHelper } from '../../helpers/header.helper';
import { QueryHelper } from '../../helpers/query.helper';
import { HttpPathHelper } from '../../helpers/http-path.helper';
import { ApiRequestException } from '../../exceptions/ApiRequestException';
import { ServerError } from '../../models/error';
import { RequestMiddlewareBase } from '../base/RequestMiddlewareBase';


export class ApiMiddleware extends RequestMiddlewareBase {

    execute(req: Request, res: Response, next: NextFunction) {

        const path = `/api${req.path || '/'}`;
        const options: RequestOptions = {
            path,
            port: AppConfigs.HTTPS ? 443 : AppConfigs.API_PORT,
            hostname: AppConfigs.API_HOST,
            method: req.method,
        };

        // 是否使用翻墙代理
        if (process.env.USE_PROXY) {
            options.agent = AppConfigs.HTTPS ? new httpsProxyAgent(AppConfigs.agentHost)
                                             : new httpProxyAgent(AppConfigs.agentHost);
        }

        // 处理请求头
        const headers = HeaderHelper.getHeader(req);
        const query = QueryHelper.supplementRequestQuery(req.query, headers);
        if (query) {
            options.path = HttpPathHelper.constructPathWithParams(options.path, query);
        }
        options.headers = headers;

        // http or https
        const request = AppConfigs.HTTPS ? httpsRequest : httpRequest;

        // 发起请求
        const clientReq = request(options, apiRes => {
            // 处理Response
            this.getResponseData(apiRes)
                .then(
                    responseData => {
                        const data = this.handleResponse(apiRes.statusCode, responseData);
                        if (data instanceof ApiRequestException)
                            next(data);
                        else
                            res.json({ data });
                    },
                    err => next(new ApiRequestException('UnknownError', err.message, res.statusCode, err))
                );
        });

        clientReq.on('error', err => {
            next(new ApiRequestException('RequestError', 'API Request Error', 404, err));
        });

        if (req.body && req.body.data) {
            const postData = JSON.stringify(req.body.data);
            clientReq.end(postData);
        } else {
            clientReq.end();
        }
    }

    private getResponseData(res: IncomingMessage): Promise<string> {
        return new Promise((resolve, reject) => {
            const datas = [];
            let size = 0;
            res.on('error', err => reject(err));
            res.on('data', (chunk) => {
                datas.push(chunk);
                size += chunk.length;
            });
            res.on('end', () => {
                const buffer = Buffer.concat(datas, size);
                const data = buffer.toString();
                resolve(data);
            });
        });
    }

    private handleResponse(statusCode: number, responseData: string): any | ApiRequestException {

        GloablLogger.info(responseData, 'Reponse Data:');

        let result: any  = {};
        if (responseData) {
            try {
                result = JSON.parse(responseData);
                if (result === null || result === undefined)
                    result = {};
            } catch (e) {
                return new ApiRequestException('JSONParseError', responseData, statusCode || 500);
            }
        }

        const serverError = result as ServerError;
        if (statusCode !== 200 || serverError.ErrorId || serverError.ErrorCode || serverError.Message) {
            if (statusCode === 404) {
                return new ApiRequestException('ApiNotFound', 'API请求失败,找不到该API路径', statusCode, serverError);
            } else {
                return new ApiRequestException(
                    serverError.ErrorCode,
                    serverError.Message,
                    statusCode !== 200 ? statusCode : 500,
                    result
                );
            }
        }

        return result;
    }

}



