# Electron-Nunjucks
Render nunjucks templates in your [Electron](https://electronjs.org/) application. All nunjuck templates are rendered
asynchronously. In addition, a context object is included automatically that contains information about the template 
loaded so you can leverage it within your templates, you can even set custom context data.

## Installing

Add the package to your project.

```npm install electron-nunjucks --save```

Import the package into your electron app setup code and call the ```install``` function as shown below.

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

Within the install function, you can include nearly all [nunjucks standard options](https://mozilla.github.io/nunjucks/api.html#configure) 
(```web``` and ```express``` are ignored) as well as some extras.

- ```path```: The directory root of your nunjucks template files. Defaults to the current working directory. It is 
              recomended to set this.
- ```protocol```: The protocol to listen on, you can customize this if you wish.
- ```ext```: Array of file extensions to be processed by nunjucks.
- ```renderErrors```: Indicates errors should be rendered to the response renderer.
- ```debug```: Enables console output of debugging information and errors.
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
    renderErrors: true,
    debug: false,
    extensions: null,
    filters: null,
    globals: null
}
```

#### Extensions
Extensions can be included by populating the configuration ```extensions``` object with each extension as a key-values. The key being the name of the extension, and the value being the extension instance. More information [here](https://mozilla.github.io/nunjucks/api.html#custom-tags).

#### Filters
Filters can be passed in under the configuration ```filters``` array. More information [here](https://mozilla.github.io/nunjucks/api.html#custom-filters).

Example
```
...
filters: [
    {
        name: 'slug',
        func: function (str) {
            return str && str.replace(/\s/g, '-', str).toLowerCase();
        },
        async: false
    }
]
```

#### Globals
Globals may be set by passing them into the configuration ```globals``` as a simple key-value object.

Example
```
...
globals: {
    'myglobal': 123,
    'otherglobal': "This is global!"
}
```

## Context
All templates are rendered with a context object containing template information and any custom data you've set in
eplicitely using the ```setContext``` function.

```
{
    data: { /* Your custom context data. */ },
    template: {
        path: /* The full template file path. */,
        fileName: /* The file name only (no path). */,
        dir: /* The full template directory path. */,
        dirName: /* The parent directory name. */,
        ext: /* The template file extension. */,
        mime: /* The mime type of the template (typically "text/html"). */
    }
}
```

### Custom Data
Custom data is stored by the template file name and is tied to the application instance. This means that context data
will be the same for multiple ```BrowserWindow``` ```loadURL``` calls, even across windows. Therefore, it is good
practice to set your custom context data just before calling ```loadURL``` with the affected template.

You can remove context data by calling ```clearContext```, optionally passing a specific template file path for
clearing a specific template's context data.

#### Example
Node.JS
```
nunjucks.setContext('templates/index.njk', {
    message: "Hello World!",
    title: "My App",
    value: 12345
});
win.loadURL(`file://${__dirname}/templates/index.njk`);
```

Nunjucks Template
```
<h1>{{data.title}}</h1>
<p>
    {{data.message}}
</p>
```

HTML Output
```
<h1>My App</h1>
<p>
    Hello World!
</p>
```

## Running Unit Tests
Unit tests require the dev-dependancy ```spectron```. You can run a quick test by executing ```npm run test```. If you 
want to verify the nunjucks templates are rendering, you can run ```npm run test-app```.