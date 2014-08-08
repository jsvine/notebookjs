# Notebook.js

Notebook.js parses raw [IPython](http://ipython.org/)/[Jupyter](http://jupyter.org/) notebooks, and lets you render as HTML. See the [working demo here](https://jsvine.github.io/notebookjs/demo/).

## Usage

Notebook.js works in the browser and in Node.js. Usage is fairly straightforward.

### Browser Usage

First, provide access to `nb` via a script tag:

```html
<script src="notebook.js"></script>
```

Then parse, render, and (perhaps) append:

```
var notebook = nb.parse(raw_ipynb_json_string);
var rendered = notebook.render();
document.body.appendChild(rendered);
```

### Node.js Usage

To install:

```sh
npm install notebookjs
```

Then parse, render, and (perhaps) print:

```js
var fs = require ("fs");
var nb = require("notebookjs");
var ipynb = JSON.parse(fs.readFileSync("path/to/notebook.ipynb"));
var notebook = nb.parse(ipynb);
console.log(notebook.render().outerHTML);
```

## Support for Markdown and ANSI-coloring

By default, notebook.js supports [marked](https://github.com/chjj/marked) for Markdown rendering, and [ansi_up](https://github.com/drudru/ansi_up) for ANSI-coloring. It does not, however, ship with those libraries, so you must `<script>`-include or `require` them before initializing notebook.js.

To support other Markdown or ANSI-coloring engines, set `nb.markdown` and/or `nb.ansi` to functions that accept raw text and return rendered text.

## MathJax and Code-Highlighting

Notebook.js doesn't have any special support for pre-rendering mathematical notation via MathJax, or highlighting/styling code-blocks, but plays well with those libraries. See [the demo code](demo/js/demo.js) for an example.
