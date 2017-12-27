const fs = require('fs');
const mime = require('mime');
const path = require('path');
const url = require('url');
const { protocol } = require('electron');
const nunjucks = require('nunjucks');

module.exports = {

    /**
     * @param {Electron.App} app
     */
    install: function (app, config) {
        let en = new ElectronNunjucks(config);
        app.on('ready', function () {
            protocol.interceptBufferProtocol(en.config.protocol, function (req, callback) {
                en.intercept(req, callback);
            })
        });
    }

}

class ElectronNunjucks {
    constructor(config) {
        this.config = Object.assign({
            path: null,
            protocol: 'file',
            ext: ['.html', '.njk', '.nunjucks'],
            autoescape: true,
            throwOnUndefined: false,
            trimBlocks: false,
            lstripBlocks: false,
            noCache: false,
            tags: null,
            renderErrors: true
        }, config);
    }

    parseFilePath(reqUrl) {
        let parsedUrl = url.parse(reqUrl);
        let decPath = decodeURIComponent(parsedUrl.pathname);
        if (process.platform === 'win32' && !parsedUrl.host.trim()) {
            decPath = decPath.substr(1); //remove windows initial slash
        }
        return decPath;
    }

    intercept(req, callback) {
        let self = this;
        try {
            let pathname = this.parseFilePath(req.url);
            let ext = path.extname(pathname);
            let mimeType = mime.getType(ext);
            console.info(`pathname: ${pathname}, ext: ${ext}, mime: ${mimeType}`);
            let buf = fs.readFileSync(pathname);
            if (this.config.ext.indexOf(ext) >= 0) {
                if (!mimeType) {
                    mimeType = 'text/html';
                }
                nunjucks.render(pathname, function (err, res) {
                    if (err) {
                        self.handleException(err, callback);
                    } else {
                        return callback({
                            data: new Buffer(res, 'utf8'),
                            mimeType: mimeType
                        });
                    }
                });
                return;
            }
            return callback({
                data: buf,
                mimeType: mimeType
            });
        } catch (err) {
            return self.handleException(err, callback);
        }
    }

    /**
     * Handles an error and makes the appropriate protocol callback.
     * @param {Error} err 
     * @param {Function} callback 
     */
    handleException(err, callback) {
        console.error(err);
        if (!err.code && this.config.renderErrors) {
            return callback({
                data: new Buffer(`<h1>Error Rendering Nunjucks Template</h1><pre style="width: 100%; overflow: auto;">${err.stack ? err.stack : err}</pre>`),
                mimeType: 'text/html'
            });
        } else if (err.code === 'ENOENT') { //NET_ERROR(FILE_NOT_FOUND, -6)
            return callback(6);
        }
        return callback(2); //NET_ERROR(FAILED, -2) (generic)
    }

};