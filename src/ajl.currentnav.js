(function (window, document, ajl) {
"use strict";

// ----------------------------------------------------------------------------
// CurrentNav: ナビゲーションの現在地を強調表示する
// ----------------------------------------------------------------------------
// TODO: 相対パスの場合の検討
ajl.CurrentNav = function (elem, options) {
    this.elem = elem;
    this.defaults = {
        replace: false
    };

    this.options = ajl.util.deepExtend({}, this.defaults, options);
};

ajl.CurrentNav.prototype = {
    init: function () {
        var currentPath = location.pathname,
            directoryIndex = /index\.(html?|php|cgi)$/,
            elem,
            content,
            parent;

        if (directoryIndex.test(currentPath)) {
            currentPath = currentPath.replace(directoryIndex, "");
        }

        elem = this.elem.querySelector("a[href=\"" + currentPath + "\"]");

        if (elem) {
            if (this.options.replace) {
                content = elem.innerHTML;
                elem.outerHTML = "<em>" + content + "</em>";
            } else {
                parent = elem.parentNode;
                content = parent.innerHTML;
                parent.innerHTML = "<em>" + content + "</em>";
            }
        }
    }
};

ajl.util.createRunner("CurrentNav");

}(window, document, ajl));
