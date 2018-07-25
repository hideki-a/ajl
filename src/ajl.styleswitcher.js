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

    _getAnchor: function (title) {
        return document.querySelector("a[href='#" + title + "']");
    },

    _setActiveClass: function (afterElem, beforeElem) {
        afterElem.classList.add("active");

        if (beforeElem) {
            beforeElem.classList.remove("active");
        }
    },

    changeStyle: function (title) {
        var d = document;

        d.querySelector("link[title='" + this.activeTitle + "']").disabled = true;
        d.querySelector("link[title='" + title + "']").disabled = false;
        this.activeTitle = title;
    },

    changeStyleHandler: function (e) {
        var target = e.target;
        var title = target.getAttribute("href").replace("#", "");

        e.preventDefault();

        if (title !== this.activeTitle) {
            this._setActiveClass(target, this._getAnchor(this.activeTitle));
            this.changeStyle(title);
            ajl.cookie.setItem(this.options.key, title);
        }
    },

    init: function () {
        var styles;

        if (!ajl.StyleSwitcher.prototype._altStyles.length) {
            styles = document.querySelectorAll("link[rel='alternate stylesheet']");
            Array.prototype.forEach.call(styles, ajl.util.proxy(this, function (elem) {
                var href = elem.getAttribute("href"),
                    title = elem.getAttribute("title"),
                    link = document.createElement("link");

                link.setAttribute("rel", "stylesheet");
                link.setAttribute("href", href);
                link.setAttribute("title", title);
                link.disabled = true;
                elem.parentNode.replaceChild(link, elem);
                ajl.StyleSwitcher.prototype._altStyles.push(title);
            }));
        }

        this.styles = this.options.collect.call(this, this.elem);
        Array.prototype.forEach.call(this.styles, ajl.util.proxy(this, function (elem) {
            var title = elem.getAttribute("href").replace("#", "");

            this.styleTitles.push(title);

            if (ajl.StyleSwitcher.prototype._altStyles.indexOf(title) === -1) {
                this.activeTitle = title;
                this._setActiveClass(elem);
            }
        }));

        ajl.event.add(
            this.elem,
            "click",
            ajl.util.proxy(this, this.changeStyleHandler)
        );

        if (ajl.cookie.hasItem(this.options.key)) {
            var title = ajl.cookie.getItem(this.options.key);

            if (title !== this.activeTitle) {
                this._setActiveClass(
                    this._getAnchor(title),
                    this._getAnchor(this.activeTitle)
                );
                this.changeStyle(title);
            }
        }
    }
};

ajl.util.createRunner("StyleSwitcher");

}(window, document, ajl));
