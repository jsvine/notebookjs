# notebook.js `v0.8.3`

Notebook.js parses raw [Jupyter](http://jupyter.org/)/[IPython](http://ipython.org/) notebooks, and lets you render them as HTML. See a __[working demo here](https://jsvine.github.io/nbpreview/)__.

## Usage

Notebook.js works in the browser and in Node.js. Usage is fairly straightforward.

### Browser Usage

First, provide access to `nb` via a script tag:

```html
<script src="notebook.js"></script>
```

Then parse, render, and (perhaps) append:

```
var notebook = nb.parse(JSON.parse(raw_ipynb_json_string));
var rendered = notebook.render();
document.body.appendChild(rendered);
```

### Node.js Usage

To install:

```sh
npm install notebookjs
```

Then parse, render, and write:

```js
var fs = require("fs");
var nb = require("notebookjs");
var ipynb = JSON.parse(fs.readFileSync("path/to/notebook.ipynb"));
var notebook = nb.parse(ipynb);
console.log(notebook.render().outerHTML);
```

## Markdown and ANSI-coloring

On Node.js, notebook.js uses [marked](https://github.com/markedjs/marked) for Markdown rendering, and [ansi_up](https://github.com/drudru/ansi_up) for ANSI-coloring.

The browser-based version does not, however, ship with those libraries, so you must `<script>`-include or `require` them before initializing notebook.js.

To support other Markdown or ANSI-coloring engines, set `nb.markdown` and/or `nb.ansi` to functions that accept raw text and return rendered text.

## HTML and Markdown Sanitization

On Node.js, notebook.js runs all HTML and Markdown outputs through [DOMPurify](https://github.com/cure53/DOMPurify). The browser-based version, however, does not ship with this library; to enable the default behavior, you must `<script>`-include or `require` it before initializing notebook.js.

Alternative sanitizers can be passed by setting `nb.sanitizer` to a function that accepts a raw HTML string and returns a sanitized version. (To disable sanitization, set `nb.sanitizer = function (x) { return x; };`.)

## Code-Highlighting

Notebook.js plays well with code-highlighting libraries. See [NBPreview](https://github.com/jsvine/nbpreview) for an example of how to add support for your preferred highlighter. However, if you wish to inject your own highlighting, you can install a custom highlighter function by adding it under the `highlighter` name in an `notebookjs` instance. For instance, here is an implementation which colorizes languages using [Prismjs](http://prismjs.com) during page generation for a static site:

```js
var Prism = require('prismjs');

var highlighter = function(code, lang) {
    if (typeof lang === 'undefined') lang = 'markup';

    if (!Prism.languages.hasOwnProperty(lang)) {
        try {
            require('prismjs/components/prism-' + lang + '.js');
        } catch (e) {
            console.warn('** failed to load Prism lang: ' + lang);
            Prism.languages[lang] = false;
        }
    }

    return Prism.languages[lang] ? Prism.highlight(code, Prism.languages[lang]) : code;
};

var nb = require("notebookjs");
nb.highlighter = function(text, pre, code, lang) {
        var language = lang || 'text';
        pre.className = 'language-' + language;
        if (typeof code != 'undefined') {
            code.className = 'language-' + language;
        }
        return highlighter(text, language);
    };
```

A `highlighter` function takes up to four arguments:

* `text` -- text of the cell to highlight
* `pre` -- the DOM `<pre>` node that holds the cell
* `code` -- the DOM `<code>` node that holds the cell (if `undefined` then text is not code)
* `lang` -- the language of the code in the cell (if `undefined` then text is not code)

The function should at least return the original `text` value if it cannot perform any highlighting.

## MathJax / LaTeX / KaTeX

Notebook.js currently doesn't support all of MathJax's syntaxes (MathML, AsciiMath, LaTeX). In the browser, however, it does support a significant subset of LaTeX via [KaTeX](https://github.com/Khan/KaTeX). To enable this functionality, the webpage must have the following JavaScript and CSS libraries (or their equivalents, from other sources) loaded:

- `https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.12.0/katex.min.js`
- `https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.12.0/contrib/auto-render.min.js`
- `https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.12.0/katex.min.css`
- [KaTeX fonts](https://katex.org/docs/font.html)

## JavaScript Support
JavaScript in notebooks is not executed by default, because it opens the door for XSS attacks when using untrusted notebooks.
If you want to enable to run JavaScript set the `executeJavaScript` option to true.

```
var nb = require("notebookjs");
// Run the JavaScript in notebook. Ensure you only use this for trusted notebooks
nb.executeJavaScript = true;
var notebook = nb.parse(ipynb);
```

## Styling Rendered Notebooks

The HTML rendered by notebook.js (intentionally) does not contain any styling. But each key element has fairly straightfoward CSS classes that make styling your notebooks a cinch. See [`nbpreview`](https://github.com/jsvine/nbpreview)'s [stylesheet](https://github.com/jsvine/nbpreview/blob/master/css/nbpreview.css) for an example implementation.

## Thanks

Many thanks to the following users for catching bugs, fixing typos, and proposing useful features:

- [@bradhowes](https://github.com/bradhowes)
- [@HavenZhang](https://github.com/HavenZhang)
- [@mrueegg](https://github.com/mrueegg)
- [@jithurjacob](https://github.com/jithurjacob)
- [@rubenv](https://github.com/rubenv)
- [@Sumukh](https://github.com/Sumukh)
- [@H-Plus-Time](https://github.com/H-Plus-Time)
- [@vgsantoniazzi](https://github.com/vgsantoniazzi)
- [@dereklieu](https://github.com/dereklieu)
- [@micmcg](https://github.com/micmcg)
- [@mhrvol](https://github.com/mhrvol)
- [@ingodahn](https://github.com/ingodahn)
- [@srmibextesting](https://github.com/srmibextesting)
- [@roman-mibex-2](https://github.com/roman-mibex-2)
