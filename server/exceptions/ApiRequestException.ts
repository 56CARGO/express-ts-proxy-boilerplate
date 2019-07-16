import { ServerError } from '../models/error';


export class ApiRequestException {
    constructor(public code: string,
                public message: string,
                public status: number,
                public nativeError?: ServerError | Error) {

    }
}
