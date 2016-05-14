(function (window, document, ajl) {
"use strict";

// ----------------------------------------------------------------------------
// FontsizeScaler: フォントサイズの拡大・縮小
// ----------------------------------------------------------------------------
ajl.FontsizeScaler = function (elem, options) {
    this.elem = elem;
    this.docElem = document.querySelector("body");
    this.fontsize = null;
    this.baseFontsize = null;
    this.bodyFontsize = null;
    this.maximumFontsize = null;
    this.minimumFontsize = null;
    this.defaults = {
        collect: function (parent) {
            return parent.querySelectorAll("a");
        },
        key: "fontsizescaler"
    };

    this.options = ajl.util.deepExtend({}, this.defaults, options);
};

ajl.FontsizeScaler.prototype = {
    setDefaultFontsize: function () {
        this.fontsize = this.bodyFontsize;
        ajl.cookie.setItem(this.options.key, this.fontsize);
        this.docElem.style.fontSize = "";
    },

    _scaleFontsize: function (fontsize) {
        var relativeSize = (fontsize / this.baseFontsize).toFixed(5);

        this.fontsize = fontsize;
        ajl.cookie.setItem(this.options.key, fontsize);
        this.docElem.style.fontSize = relativeSize + "em";
    },

    _scaleFontsizeHandler: function (e) {
        var scaleType = e.target.getAttribute("href").replace("#", "");
        var targetSize;

        e.preventDefault();

        if (scaleType === "large") {
            targetSize = parseInt(this.fontsize, 10) + 2;

            if (targetSize <= this.maximumFontsize) {
                this._scaleFontsize(targetSize);
            }
        } else if (scaleType === "small") {
            targetSize = parseInt(this.fontsize, 10) - 2;

            if (this.minimumFontsize <= targetSize) {
                this._scaleFontsize(targetSize);
            }
        } else {
            this.setDefaultFontsize();
        }
    },

    init: function () {
        var buttons = this.options.collect.call(this, this.elem);
        var htmlElem = document.querySelector("html");
        var bodyElem = document.querySelector("body");
        var htmlElemFontsize;
        var bodyElemFontsize;

        Array.prototype.forEach.call(buttons, ajl.util.proxy(this, function (elem) {
            ajl.event.add(
                elem,
                "click",
                ajl.util.proxy(this, this._scaleFontsizeHandler)
            );
        }));

        htmlElemFontsize = ajl.style.getPropValue(htmlElem, "fontSize").replace("px", "");
        bodyElemFontsize = ajl.style.getPropValue(bodyElem, "fontSize").replace("px", "");
        this.baseFontsize = htmlElemFontsize || bodyElemFontsize;
        this.bodyFontsize = bodyElemFontsize;
        this.maximumFontsize = bodyElemFontsize * 2;

        if (htmlElemFontsize < 12) {
            this.minimumFontsize = htmlElemFontsize;
        } else if (bodyElemFontsize < 12) {
            this.minimumFontsize = bodyElemFontsize;
        } else {
            this.minimumFontsize = 12;
        }

        if (ajl.cookie.hasItem(this.options.key)) {
            this.fontsize = ajl.cookie.getItem(this.options.key);
            this._scaleFontsize(parseInt(this.fontsize, 10));
        } else {
            this.fontsize = bodyElemFontsize;
        }
    }
};

ajl.util.createRunner("FontsizeScaler");

}(window, document, ajl));
