
export class HttpPathHelper {

    static constructPathWithParams(originalPath: string, params: any) {
        let path = '';

        if (params) {
            for (const k in params) {
                if (params.hasOwnProperty(k)) {
                    path += `${k}=${params[k]}&`;
                }
            }
        }

        if (!path)
            return originalPath;

        path = path.endsWith('&') ? path.substring(0, path.length - 1) : path;
        path = path.startsWith('&') ? path.substring(1) : path;

        path = `${originalPath}${originalPath.indexOf('?') < 0 ? `?${path}` : `&${path}`}`;
        return path;
    }
}
