(function (window, document, ajl) {
"use strict";

// ----------------------------------------------------------------------------
// HeightEqualizer: 要素の高さ揃え
// ----------------------------------------------------------------------------
ajl.HeightEqualizer = function (elem, options) {
    this.parent = elem;
    this.docBody = null;
    this.target = null;
    this.fontSize = null;
    this.defaults = {
        collect: function (parent) {
            return parent.children;
        },
        groupBy: null,
        checkFontResize: true
    };
    this.breakPoints = null;
    this.intervalId = null;
    this.proxyFunction = null;

    this.options = ajl.util.deepExtend({}, this.defaults, options);
};

ajl.HeightEqualizer.prototype = {
    _getElemHeight: function (elem) {
        if (getComputedStyle(elem).boxSizing === "border-box") {
            return ajl.style.getOuterHeight(elem).replace("px", "");
        } else {
            return ajl.style.getPropValue(elem, "height").replace("px", "");
        }
    },

    _getArrangeHeight: function (height, nElem, groupBy) {
        var max,
            i = 0;

        if (groupBy && 0 < groupBy && groupBy < nElem) {
            // groupBy個毎に高さを揃える
            while (i < nElem) {
                if (i % groupBy === 0) {
                    max = Math.max.apply(Math, height.slice(i, i + groupBy));
                }
                height[i] = max;
                i += 1;
            }
        } else {
            // 一番高い要素の高さに揃える
            max = Math.max.apply(Math, height);
            while (i < nElem) {
                height[i] = max;
                i += 1;
            }
        }

        return height;
    },

    _setHeight: function (height, nElem) {
        var i = 0;

        while (i < nElem) {
            if (height.length > 0) {
                this.target[i].style.height = Math.ceil(height[i]) + "px";
            } else {
                this.target[i].style.height = "auto";
            }

            i += 1;
        }
    },

    doEqualize: function () {
        var height = [],
            nElem = this.target.length,
            i = 0,
            matchFlag = false,
            groupBy;

        // 設定値をクリア
        this._setHeight([], nElem);

        // 高さを収集
        while (i < nElem) {
            height.push(this._getElemHeight(this.target[i]));
            i += 1;
        }

        // 高さ揃えのグループ単位を取得
        if (this.breakPoints) {
            this.breakPoints.forEach(ajl.util.proxy(this, function (breakPoint) {
                if (!matchFlag && window.innerWidth < breakPoint) {
                    this.options.groupBy.filter(function (item) {
                        if (item.maxWidth === breakPoint) {
                            groupBy = item.groupBy;
                        }
                    });

                    matchFlag = true;
                }
            }));
        } else {
            groupBy = this.options.groupBy;
        }

        // 揃える高さを算出
        if (groupBy === 0) {
            // 高さ揃えをキャンセル
            height = [];
        } else {
            height = this._getArrangeHeight(height, nElem, groupBy);
        }

        // 要素に高さを設定
        this._setHeight(height, nElem);
    },

    checkFontSize: function () {
        var currentFontSize = ajl.style.getPropValue(this.docBody, "fontSize");

        if (this.fontSize !== currentFontSize) {
            this.fontSize = currentFontSize;
            ajl.event.trigger(window, "fontresize");
        }
    },

    defineGroupByVal: function () {
        var groupBySetting = this.options.groupBy,
            breakPoints = [];

        groupBySetting.forEach(function (setting) {
            breakPoints.push(setting.maxWidth);
        });

        breakPoints.sort(
            function compareNumbers(a, b) {
                return a - b;
            }
        );
        this.breakPoints = breakPoints;
    },

    destroy: function () {
        var nElem = this.target.length,
            i = 0;

        while (i < nElem) {
            this.target[i].style.height = 'auto';
            i += 1;
        }

        ajl.event.remove(window, "load", this.proxyFunction, false);
        ajl.event.remove(window, "resize", this.proxyFunction, false);
        ajl.event.remove(window, "fontresize", this.proxyFunction, false);

        if (this.options.checkFontResize) {
            window.clearInterval(this.intervalId);
        }
    },

    init: function () {
        this.target = this.options.collect.call(this, this.parent);

        if (this.options.groupBy && typeof(this.options.groupBy) === "object") {
            this.defineGroupByVal();
        }

        this.proxyFunction = ajl.util.proxy(this, this.doEqualize);
        ajl.event.add(window, "load", this.proxyFunction, false);
        ajl.event.add(window, "resize", this.proxyFunction, false);
        ajl.event.add(window, "fontresize", this.proxyFunction);

        if (this.options.checkFontResize) {
            // テキストサイズのみの変更を監視
            this.docBody = document.getElementsByTagName("body")[0];
            this.fontSize = ajl.style.getPropValue(this.docBody, "fontSize");
            this.intervalId = window.setInterval(ajl.util.proxy(this, this.checkFontSize), 250);
        }
    }
};

ajl.util.createRunner("HeightEqualizer");

}(window, document, ajl));
