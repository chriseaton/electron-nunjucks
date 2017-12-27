# Electron-Nunjucks
Render nunjucks templates in your [Electron](https://electronjs.org/) application. This package makes it extremely easy and leverages nunjucks asynchronous rendering so you can utilize it to it's maximum potential.

## Installing

Add the package to your project.

```npm install electron-nunjucks --save```

Import the package into your electron app setup code.

```
const electron = require('electron');
const nunjucks = require('electron-nunjucks');

...

nunjucks.install(electron.app, {
    path: 'my-templates/',
    //other options here...
});

```

### Options

Within the install function, you can include nearly all [nunjucks standard options](https://mozilla.github.io/nunjucks/api.html#configure) (```web``` and ```express``` are ignored) as well as some extras.

- path: The directory root of your nunjucks template files. Defaults to the current working directory. It is recomended to set this.
- protocol: The protocol to listen on, you can customize this if you wish.
- ext: Array of file extensions to be processed by nunjucks.
- renderErrors: Indicates errors should be rendered to the response renderer.
- For all other settings, please see: [nunjucks configuration](https://mozilla.github.io/nunjucks/api.html#configure)

#### All Options &amp; Defaults
```
{
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
}
```

## Running Unit Tests
Unit tests require the dev-dependancy ```spectron```. You can run a quick test by executing ```npm run test```. If you want to verify the nunjucks templates are rendering, you can run ```npm run test-app```.