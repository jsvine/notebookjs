(function () {
    var root = this;
    var $controls = $("#controls input, #controls button");
    var $input = $("#github-url");
    var $load = $("#load");
    var $load_random = $("#load-random");
    var $notebook = $("#notebook-holder");
    var $loading = $("#loading");
    var base_api_url = "https://api.github.com/repos/";

    var base64_to_json = function (b64) {
        return JSON.parse(root.atob(b64));
    }; 

    var get_tree = function (url, callback) {
        var split = url.split("/");
        var pre_com = split[2].split(".").slice(-2)[0];
        var non_raw = pre_com == "github";
        var tree_index = non_raw ? 6 : 5;
        var api_url = base_api_url + 
            split.slice(3, 5)
                .concat(["git", "trees", split[tree_index]])
                .join("/") + "?recursive=1";
        $.getJSON(api_url, function (tree) {
            callback(url, tree);
        });
    };

    var get_notebook = function (url, callback) {
        window.location.hash = url;
        $controls.prop("disabled", true);
        $notebook.hide();
        $loading.show();
        get_tree(url, function (url, tree) {
            var split = url.split("/");
            var tree_index = split.indexOf(tree.sha);
            var path = split.slice(tree_index + 1)
                .join("/")
                .replace(/%20/g, " ");
            var blob = tree.tree.filter(function (blob) {
                return blob.path === path;
            })[0];
            $.getJSON(blob.url, function (blob) {
                callback(base64_to_json(blob.content));
            });
        });
    };

    var load_notebook = function (url) {
        var url = $input.val();
        if (!url.replace(/ */g, "").length) { return false; }
        get_notebook(url, function (ipynb) {
            var notebook = root.notebook = nb.parse(ipynb);
            $controls.prop("disabled", false);
            $loading.hide();
            $notebook.empty();
            $notebook.append(notebook.render());
            $notebook.show();
            Prism.highlightAll();
            MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
        });
    };

    var urls = [
        "https://github.com/ipython/ipython/blob/master/examples/Notebook/Display%20System.ipynb",
        "https://github.com/jakevdp/jakevdp.github.io/blob/master/downloads/notebooks/IPythonWidgets.ipynb",
        "https://github.com/ipython/ipython/blob/master/examples/Notebook/Animations%20Using%20clear_output.ipynb",
        "https://github.com/ipython/ipython/blob/master/examples/Notebook/Basic%20Output.ipynb",
        "https://github.com/minad/iruby/blob/master/IRuby-Example.ipynb",
        "https://github.com/CamDavidsonPilon/Probabilistic-Programming-and-Bayesian-Methods-for-Hackers/blob/master/Chapter1_Introduction/Chapter1_Introduction.ipynb",
        "https://github.com/gibiansky/IHaskell/blob/master/demo/IHaskell.ipynb",
        "https://github.com/Prooffreader/Baby_names_US_IPython/blob/master/trendiness.ipynb",
        "https://github.com/rjtavares/football-crunching/blob/master/notebooks/an%20exploratory%20data%20analysis%20of%20the%20world%20cup%20final.ipynb"
    ];

    $load.on("click", load_notebook);
    $load_random.on("click", function () {
        var url = urls[Math.floor(Math.random() * urls.length)];
        $input.val(url); 
        $load.click();
    });

    var hash = window.location.hash.slice(1);
    if (hash.slice(0, 4) === "http") {
        $input.val(hash);
    } else {
        $input.val(urls[0]);
    }

    $load.click();

}).call(this);
