const fs = require('fs');
const mime = require('mime');
const path = require('path');
const url = require('url');
const { protocol } = require('electron');
const nunjucks = require('nunjucks');

//https://github.com/bowheart/ejs-electron/blob/master/index.js

module.exports = {

    /**
     * @param {Electron.App} app
     */
    install: function (app, config) {
        let en = new ElectronNunjucks(config);
        app.on('ready', function () {
            protocol.interceptBufferProtocol(en.config.protocol, function(reqUrl) {
                en.intercept(reqUrl);
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
            tags: null
        }, config);
    }

    parseFilePath(reqUrl) {
        let parsedUrl = url.parse(reqUrl);
        let decPath = decodeURIComponent(parsedUrl.pathname);
        //remove windows initial slash
        if (process.platform === 'win32' && !parsedUrl.host.trim()) {
            decPath = decPath.substr(1);
        }
        return decPath;
    }

    intercept(request, callback) {
        try {
            let pathname = this.parseFilePath(request.url);
            let ext = path.extname(pathname);
            let mimeType = mime.getType(ext);
            console.info(`pathname: ${pathname}, ext: ${ext}, mime: ${mime}`);
            let buf = fs.readFileSync(pathname);
            if (this.config.ext.indexOf(ext) >= 0) {
                //buf = compile(pathname, buf);
                //TODO
                if (!mimeType) {
                    mimeType = 'text/html';
                }
            }
            console.error(callback);
            return callback({
                data: buf,
                mimeType: mimeType
            });
        } catch (ex) {
            console.error(ex);
            // if (ex.code.startsWith('PUG:')) {
            //     return callback({ data: new Buffer(`<pre style="tab-size:1">${ex}</pre>`), mimeType: 'text/html' });
            // }
            if (ex.code === 'ENOENT') { // NET_ERROR(FILE_NOT_FOUND, -6)
                return callback(6);
            }
            return callback(2); // NET_ERROR(FAILED, -2) (generic)
        }
    }

};