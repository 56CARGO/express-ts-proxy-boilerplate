import { AppConfigs } from './configs/app.config';
import * as express from 'express';
import * as path from 'path';
import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import { ApiMiddleware } from './middlewares/api/api-handler';
import { ApiErrorHandlingMiddleware } from './middlewares/error/api-error-handler';
import { GloablLogger } from './helpers/logger';
import { DownloadMiddleware } from './middlewares/file/download-handler';

const app = express();

const PORT = AppConfigs.UI_PORT || 4300;
const DIST_FOLDER = path.join(process.cwd(), 'dist/coin-pay');
const ASSETS_FOLDER = path.join(DIST_FOLDER, 'assets');

// 日志初始化
GloablLogger.initialize();

// 处理文件下载的请求
app.use('/file/download', new DownloadMiddleware().config());

// 请求json化
app.use(bodyParser.json({ limit: '50mb' }));
// 启用gzip压缩
app.use(compression());
// Api请求
app.use('/api', new ApiMiddleware().config());
// Api请求错误处理
app.use(new ApiErrorHandlingMiddleware().config());


// 为响应头添加cache-control，启用http缓存
function cacheControl(req, res, next) {
    // instruct browser to revalidate in 60 seconds
    res.setHeader('Cache-Control', 'max-age=60');
    next();
}

// 请求assets中的资源文件
app.use('/assets', cacheControl, express.static(ASSETS_FOLDER, { maxAge: 30 }));

// 请求静态文件, html, js, css等
app.get('*.*', cacheControl, express.static(DIST_FOLDER, { index: false }));

// 其他请求，当做路由处理
app.get('*', (req, res) => {
    res.sendFile(path.join(DIST_FOLDER, 'index.html'));
});


app.listen(PORT, () => {
    console.log(`Node server listening on http://localhost:${PORT}`);
});

