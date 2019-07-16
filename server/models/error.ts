
// 来自真正后端（node只作为中转服务器）的错误
export interface ServerError {
    ErrorId: number;
    Message: string;
    ErrorCode?: string;
}

export interface ClientError {
    errorId: number;
    errorCode: string;
    errorMsg: string;
    status: number;
}
