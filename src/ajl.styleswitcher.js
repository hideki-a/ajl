(function (window, document, ajl) {
"use strict";

// ----------------------------------------------------------------------------
// StyleSwitcher: スタイルシートの切り替え
// ----------------------------------------------------------------------------
ajl.StyleSwitcher = function (elem, options) {
    this.elem = elem;
    this.styles = null;
    this.styleTitles = [];
    this.activeTitle = null;
    this.targets = {
        links: {}
    };
    this.defaults = {
        collect: function (parent) {
            return parent.querySelectorAll("a");
        },
        key: "styleswitch"
    };

    this.options = ajl.util.deepExtend({}, this.defaults, options);
};

ajl.StyleSwitcher.prototype = {
    _altStyles: [],

    temp2: function (title) {
        if (title !== this.activeTitle) {
            document.querySelector("link[title='" + this.activeTitle + "']").disabled = true;
            document.querySelector("link[title='" + title + "']").disabled = false;
            this.activeTitle = title;

            // 初期ロード時は不要
            ajl.cookie.setItem(this.options.key, title);
        }
    },

    temp: function (e) {
        // console.log(e.target);
        var target = e.target;
        var title = target.getAttribute("href").replace("#", "");

        e.preventDefault();

        if (title !== this.activeTitle) {
            document.querySelector("link[title='" + this.activeTitle + "']").disabled = true;
            document.querySelector("link[title='" + title + "']").disabled = false;
            this.activeTitle = title;
            ajl.cookie.setItem(this.options.key, title);
        }
    },

    init: function () {
        this.styles = this.options.collect.call(this, this.elem);
        Array.prototype.forEach.call(this.styles, ajl.util.proxy(this, function (elem) {
            this.styleTitles.push(elem.getAttribute("href").replace("#", ""));    // e.g) Blue
        }));

        if (!ajl.StyleSwitcher.prototype._altStyles.length) {
            var styles = document.querySelectorAll("html > head > link[rel='alternate stylesheet']");
            Array.prototype.forEach.call(styles, ajl.util.proxy(this, function (elem) {
                var href = elem.getAttribute("href");
                var title = elem.getAttribute("title");    // e.g) Blue
                var link = document.createElement("link");

                if (this.styleTitles.indexOf(title)) {
                    link.setAttribute("rel", "stylesheet");
                    link.setAttribute("href", href);
                    link.setAttribute("title", title);
                    link.disabled = true;
                    elem.parentNode.replaceChild(link, elem);
                    ajl.StyleSwitcher.prototype._altStyles.push(title);
                }
            }));
        }

        this.styleTitles.forEach(ajl.util.proxy(this, function (title) {
            if (ajl.StyleSwitcher.prototype._altStyles.indexOf(title) === -1) {
                this.activeTitle = title;
            }
        }));

        ajl.event.add(this.elem, "click", ajl.util.proxy(this, this.temp));

        if (ajl.cookie.hasItem(this.options.key)) {
            var title = ajl.cookie.getItem(this.options.key);
            this.temp2(title);
        }
    }
};

ajl.util.createRunner("StyleSwitcher");

}(window, document, ajl));
