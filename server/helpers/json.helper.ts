

export class JsonHelper {

    static serialize(obj: any): string {
        if (!obj)
            return '';

        let result = '';
        try {
            result = JSON.stringify(obj);
        } catch (e) {
            result = obj;
        }

        return result;
    }

    static deserialze(json: string): any {
        if (json === null || json === undefined)
            return null;

        let result: any = null;
        try {
            result = JSON.parse(json);
        } catch (e) {
        }

        return result;
    }
}
