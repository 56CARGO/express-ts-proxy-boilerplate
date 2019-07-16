import { OutgoingHttpHeaders } from 'http';
import { HeaderHelper } from './header.helper';


export class QueryHelper {

    static supplementRequestQuery(originalQuery: any, headers: OutgoingHttpHeaders) {
        const query = {
            APITOKEN: HeaderHelper.getToken(headers),
            sessionkey: HeaderHelper.getSessionKey(headers),
            ...originalQuery
        };

        return query;
    }
}
