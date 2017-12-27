const electron = require('electron');
const nunjucks = require('../index.js');

const app = electron.app;
let mainWindow;

nunjucks.install(app, {
	path: 'templates/',
	filters: [
		{
			name: 'slug',
			func: function (str) {
				return str && str.replace(/\s/g, '-', str).toLowerCase();
			},
			async: false
		}
	],
	globals: {
		'myglobal': 'Look ma! I\'m global!'
	}
});

function onClosed() {
	mainWindow = null;
}

function createMainWindow() {
	const win = new electron.BrowserWindow({
		width: 600,
		height: 400
	});
	nunjucks.setContext(`${__dirname}/templates/index.html`, 'ABC, 123... Baby you and me!');
	win.loadURL(`file://${__dirname}/templates/index.html`, { test: 12345 });
	win.on('closed', onClosed);
	return win;
}

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (!mainWindow) {
		mainWindow = createMainWindow();
	}
});

app.on('ready', () => {
	mainWindow = createMainWindow();
});