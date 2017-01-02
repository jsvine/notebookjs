var VERSION = "0.2.6";

const katex = require('katex');
katex.renderMathInElement = require('katex/dist/contrib/auto-render.min.js');
class Input {
    constructor(raw, cell) {
        this.raw = raw;
        this.cell = cell;
    }

    render () {
        if (!this.raw.length) { return nb.makeElement("div"); }
        var holder = nb.makeElement("div", [ "input" ]);
        var cell = this.cell;
        if (typeof cell.number === "number") {
            holder.setAttribute("data-prompt-number", this.cell.number);
        }
        var pre_el = nb.makeElement("pre");
        var code_el = nb.makeElement("code");
        var notebook = cell.worksheet.notebook;
        var m = notebook.metadata;
        console.log(notebook);
        var lang = this.cell.raw.language || m.language || m.language_info.name;
        code_el.setAttribute("data-language", lang);
        code_el.className = "lang-" + lang;
        code_el.innerHTML = nb.escapeHTML(nb.joinText(this.raw));
        pre_el.appendChild(code_el);
        holder.appendChild(pre_el);
        this.el = holder;
        return holder;
    }
}

class Output {
    constructor(raw, cell) {
        this.raw = raw;
        this.cell = cell;
        this.type = raw.output_type;
        this.display = {
            "text/plain":  this.text,
            "text/html":  this.genericJoinedText.bind(this, "html"),
            "text/markdown":  this.marked,
            "text/svg+xml":  this.genericJoinedText.bind(this, "svg"),
            "text/latex":  this.genericJoinedText.bind(this, "latex"),
            "application/javascript":  this.javascript,
            "png":  this.imageCreator("png"),
            "image/png":  this.imageCreator("png"),
            "jpeg":  this.imageCreator("jpeg"),
            "image/jpeg":  this.imageCreator("jpeg")
        };
        this.display_priority = [
            "png", "image/png", "jpeg", "image/jpeg",
            "svg", "text/svg+xml", "html", "text/html",
            "text/markdown", "latex", "text/latex",
            "javascript", "application/javascript",
            "text", "text/plain"
        ];
    }

    imageCreator(format) {
        return function (data) {
            var el = nb.makeElement("img", [ "image-output" ]);
            el.src = "data:image/" + format + ";base64," + nb.joinText(data).replace(/\n/g, "");
            return el;
        };
    }

    text (text) {
        var el = nb.makeElement("pre", [ "text-output" ]);
        el.innerHTML = nb.escapeHTML(nb.joinText(text));
        return el;
    }
    marked(md) {
        return this.genericJoinedText("html", nb.markdown(nb.joinText(md)));
    }

    // applies to html, svg, latex
    genericJoinedText(type, content) {
        var el = nb.makeElement("div", [ type + "-output" ]);
        el.innerHTML = nb.joinText(content);
        return el;
    }

    javascript(js) {
        var el = nb.makeElement("script");
        el.innerHTML = js;
        return el;
    }

    render_display_data() {
        var o = this;
        var formats = this.display_priority.filter(function (d) {
            return o.raw.data ? o.raw.data[d] : o.raw[d];
        });
        var format = formats[0];
        if (format) {
            if (this.display[format]) {
                return this.display[format](o.raw[format] || o.raw.data[format]);
            }
        }
        return nb.makeElement("div", [ "empty-output" ]);
    }

    render_error() {
        var el = nb.makeElement("pre", [ "pyerr" ]);
        var raw = this.raw.traceback.join("\n");
        el.innerHTML = nb.ansi(nb.escapeHTML(raw));
        return el;
    }

    render() {
        var outer = nb.makeElement("div", [ "output" ]);
        if (typeof this.cell.number === "number") {
            outer.setAttribute("data-prompt-number", this.cell.number);
        }
        var inner;
        switch(this.type) {
            case "pyerr":
                inner = this.render_error();
                break;
            case "error":
                inner = this.render_error();
                break;
            case "stream":
                inner = nb.makeElement("pre", [ (this.raw.stream || this.raw.name) ]);
                var raw = nb.joinText(this.raw.text);
                inner.innerHTML = nb.ansi(nb.escapeHTML(raw));
                break;
            default:
                inner = this.render_display_data();
                break;
        }
        outer.appendChild(inner);
        return outer;
    }
}

class Cell {
    constructor(raw, worksheet) {
        this.raw = raw;
        this.worksheet = worksheet;
        this.type = raw.cell_type;
        if (this.type == "code") {
            this.number = raw.prompt_number > -1 ? raw.prompt_number : raw.execution_count;
        }
        this.input = new nb.Input(raw.input || [ raw.source ], this);
        var raw_outputs = (this.raw.outputs || []).map((output) => {
            return new nb.Output(output, this);
        });
        this.outputs = this.coalesceStreams(raw_outputs);
    }

    coalesceStreams(outputs) {
        if (!outputs.length) { return outputs; }
        var last = outputs[0];
        var new_outputs = [ last ];
        outputs.slice(1).forEach((o) => {
            if (o.raw.output_type === "stream" &&
                last.raw.output_type === "stream" &&
                o.raw.stream === last.raw.stream) {
                last.raw.text = last.raw.text.concat(o.raw.text);
            } else {
                new_outputs.push(o);
                last = o;
            }
        });
        return new_outputs;
    }

    render() {
        var el = nb.makeElement("div", [ "cell", this.type + "-cell" ]);
        switch(this.type) {
            case "markdown":
                console.log("Actual markdown");
                // find TeX

                el.innerHTML = nb.markdown(nb.joinText(this.raw.source));
                nb.katex.renderMathInElement(el, {delimiters: [
                    {left: "$$", right: "$$", display: true},
                    {left: "\\[", right: "\\]", display: true},
                    {left: "\\(", right: "\\)", display: false},
                    {left: "$", right: "$", display: false}
                ]});
                console.log(el.innerHTML);
                break;
            case "code":
                el.appendChild(this.input.render());
                this.outputs.map((output) => el.appendChild(output.render()) );
                break;
            default:
                el.innerHTML = nb.joinText(this.raw.source);
                break;
        }
        return el;
    }
}

class Worksheet {
    constructor(raw, notebook) {
        this.raw = raw;
        this.notebook = notebook;
        this.cells = raw.cells.map((cell) => new nb.Cell(cell, this) );
    }

    render() {
        let worksheet_el = nb.makeElement("div", ["worksheet"]);
        this.cells.map((cell) => worksheet_el.appendChild(cell.render()) );
        return worksheet_el;
    }
}

class Notebook {
    constructor(raw, config) {
        this.config = config;
        this.raw = raw;
        this.metadata = raw.metadata;
        let worksheets = raw.worksheets || [ { cells: raw.cells } ];
        this.worksheets = worksheets.map((ws) => new nb.Worksheet(ws, this));
        this.sheet = this.worksheets[0];
    }

    render() {
        let notebook_el = nb.makeElement("div", [ "notebook" ]);
        this.worksheets.forEach((w) => notebook_el.appendChild(w.render()) );

        return notebook_el;
    }
}

var nb = {
    prefix: 'nb-',
    markdown: require('marked'),
    ansi: require('ansi_up').ansi_to_html,
    VERSION: VERSION,
    ident(x) {
        return x;
    },

    makeElement(tag, classNames) {
        var el = document.createElement(tag);
        el.className = (classNames || []).map((cn) => `${this.prefix}${cn}`);
        return el;
    },

    escapeHTML(raw) {
        return raw.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    },

    joinText(text) {
        return text.join ? text.map(nb.joinText).join("") : text;
    },
    parse: (nbjson, config) => new nb.Notebook(nbjson, config),
    katex: katex
};

nb.Notebook = Notebook;
nb.Worksheet = Worksheet;
nb.Cell = Cell;
nb.Output = Output;
nb.Input = Input;

module.exports = nb;
