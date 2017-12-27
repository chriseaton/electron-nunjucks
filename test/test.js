const Application = require('spectron').Application;
const path = require('path');
const assert = require('assert');

var electronPath = path.join(__dirname, '..', 'node_modules', '.bin', 'electron');
console.log(`Using electron at "${electronPath}".`);
if (process.platform === 'win32') {
    electronPath += '.cmd';
}

var app = new Application({
    path: electronPath,
    args: ['./test/test-app.js']
})

app.start().then(function () {
    return app.client.waitUntilWindowLoaded().getWindowCount();
}).then(function (count) {
    return assert.equal(count, 1, 'Should only be one window.');
}).catch(function (error) {
    console.error('Test Failed', error.message)
}).finally(function () {
    app.stop();
    console.info('Test Complete');
});