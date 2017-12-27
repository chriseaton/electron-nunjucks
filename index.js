const fs = require('fs');
const mime = require('mime');
const path = require('path');
const url = require('url');
const { protocol } = require('electron');
const nunjucks = require('nunjucks');

let contextRegister = {};

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
    },

    /**
     * Sets custom context data that becomes accessible within the nunjucks template during (nunjucks) rendering.
     * @param {String} templateFilePath - The file path to the template (don't include the protocol).
     * @param {*} data - The custom data to set. This will be available to the template under the variable "data".
     */
    setContext: function (templateFilePath, data) {
        //normalizpe the path
        templateFilePath = path.resolve(templateFilePath);
        //set the context data 
        contextRegister[templateFilePath] = data;
    },

    /**
     * Removes the context data for the specified template, or, clears *all* template context data from the app. 
     * @param {String} [templateFilePath] - Optionally specify a template to remove context data for. If not set, all 
     *                                      template context data in the app will be cleared.
     */
    clearContext: function(templateFilePath) {
        if (templateFilePath) {
            delete contextRegister[templateFilePath];
            return;
        }
        contextRegister = {};
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
            renderErrors: true,
            debug: false
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
            if (self.config.debug) {
                console.info(`Electron-Nunjucts (Evaluating): pathname= ${pathname}, ext= ${ext}, mime= ${mimeType}`);
            }
            let buf = fs.readFileSync(pathname);
            if (this.config.ext.indexOf(ext) >= 0) {
                if (!mimeType) {
                    mimeType = 'text/html';
                }
                if (self.config.debug) {
                    console.info(`Electron-Nunjucts (Rendering): ${pathname}`);
                }
                let context = {
                    data: contextRegister[pathname] || null,
                    template: {
                        path: pathname,
                        fileName: path.basename(pathname),
                        dir: path.dirname(pathname),
                        dirName: path.basename(path.dirname(pathname)),
                        ext: ext,
                        mime: mimeType
                    }
                };
                nunjucks.render(pathname, context, function (err, res) {
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
        if (this.config.debug) {
            console.error(`Electron-Nunjucts (Error):\n${err}`);
        }
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