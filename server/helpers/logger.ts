import { configure, getLogger, Logger, PatternLayout } from 'log4js';
import { EOL } from 'os';

export class GloablLogger {

    private static readonly DEBUG_PREFIX = 'Console';
    private static readonly FILE_PREFIX = 'File';

    static initialize() {
        const layout: PatternLayout = {
            type: 'pattern',
            pattern: '%[[%p][%d{yyyy-MM-dd hh:mm:ss}]%] %m%n'
        };
        const stdErrLayout: PatternLayout = {
            type: 'pattern',
            pattern: '%[[%p][%d{yyyy-MM-dd hh:mm:ss}] %m%]%n'
        };

        configure({
            appenders: {
                out: { type: 'stdout', layout },
                outErr: {type: 'stderr', layout: stdErrLayout },
                fileInfoAppender: { type: 'dateFile', filename: 'logs/infos/info.log', layout },
                errorFileAppender: { type: 'dateFile', filename: 'logs/errors/error.log', layout },
                fatalFileAppender: { type: 'dateFile', filename: 'logs/fatals/fatal.log', layout }
            },
            categories: {
                default: { appenders: ['fileInfoAppender'], level: 'info' },
                ConsoleInfo: { appenders: ['out'], level: 'info' },
                ConsoleError: { appenders: ['outErr'], level: 'error' },
                ConsoleFatal: { appenders: ['outErr'], level: 'fatal' },
                FileInfo: { appenders: ['fileInfoAppender'], level: 'info' },
                FileError: { appenders: ['errorFileAppender'], level: 'error' },
                FileFatal: { appenders: ['fatalFileAppender'], level: 'fatal' }
            }
        });
    }

    static info(msg: string, title?: string) {
        GloablLogger.CommonExec('Info', (logger, finalMsg) => logger.info(finalMsg), msg, title);
    }

    static error(msg: string, title?: string) {
        GloablLogger.CommonExec('Error', (logger, finalMsg) => logger.error(finalMsg), msg, title);
    }

    static fatal(msg: string, title?: string) {
        GloablLogger.CommonExec('Fatal', (logger, finalMsg) => logger.fatal(finalMsg), msg, title);
    }

    private static CommonExec(baseCategory: string,
                              action: (logger: Logger, finalMsg: string) => void,
                              msg: string,
                              title: string) {
        if (title) {
            msg = title + EOL + msg;
        }

        if (process.env.NODE_ENV === 'development') {
            const debugLogger = getLogger(GloablLogger.DEBUG_PREFIX + baseCategory);
            action(debugLogger, msg);
        }

        const fileLogger = getLogger(GloablLogger.FILE_PREFIX + baseCategory);
        action(fileLogger, msg);
    }
}
