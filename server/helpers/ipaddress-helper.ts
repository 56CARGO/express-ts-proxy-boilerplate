import { Request } from 'express';

export class IpAddressHelper {
    static getClientIP(req: Request): string {
        let ip = req.headers['X-FORWARDED-FOR'] ||
                 req.headers['x-forwarded-for'] ||
                 req.headers['http_cf_connecting_ip'] ||
                 req.headers['HTTP_CF_CONNECTING_IP'] ||
                 req.headers['x-real-ip'] ||
                 req.headers['REMOTE_ADDR'] ||
                 req.ip;

        ip = ip as string;

        if (ip && ip.indexOf(',') >= 0) {
            ip = ip.substring(0, ip.indexOf(','));
        }
        return ip;
    }
}