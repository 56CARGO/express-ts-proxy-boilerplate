import { AppConfigs } from './../configs/app.config';
import { IpAddressHelper } from './ipaddress-helper';
import { OutgoingHttpHeaders } from 'http';
import { Request } from 'express';

export class HeaderHelper {

    static getHeader(req: Request): OutgoingHttpHeaders {
        const headers: OutgoingHttpHeaders = {};
        headers['content-type'] = 'application/json';
        headers['APITOKEN'] = AppConfigs.API_TOKEN;

        const ip = IpAddressHelper.getClientIP(req);
        if (ip) {
            headers['client_ip'] = ip;
        }

        const sessionKey = req.headers['sessionkey'];
        if (sessionKey) {
            headers['sessionkey'] = sessionKey;
        }

        return headers;
    }

    static getSessionKey(headers: OutgoingHttpHeaders) {
        return headers['sessionkey'];
    }

    static getToken(headers: OutgoingHttpHeaders) {
        return headers['APITOKEN'];
    }

}
