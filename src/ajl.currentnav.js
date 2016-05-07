(function (window, document, ajl) {
"use strict";

// ----------------------------------------------------------------------------
// CurrentNav: ナビゲーションの現在地を強調表示する
// ----------------------------------------------------------------------------
// TODO: 相対パスの場合の検討
ajl.CurrentNav = function (elem, options) {
    this.elem = elem;
    this.defaults = {
        replace: false,
        dirIndexPattern: /index\.(html|php|cgi)$/
    };

    this.options = ajl.util.deepExtend({}, this.defaults, options);
};

ajl.CurrentNav.prototype = {
    init: function () {
        var currentPath = location.pathname,
            elem,
            content,
            parent,
            paths,
            i,
            emElem;

        // ファイル名の除去
        if (this.options.dirIndexPattern.test(currentPath)) {
            currentPath = currentPath.replace(filename, "");
        }

        // マッチするアイテムを検索
        elem = this.elem.querySelector("a[href=\"" + currentPath + "\"]");

        if (elem) {
            if (this.options.replace) {
                content = elem.innerHTML;
                elem.outerHTML = "<em>" + content + "</em>";
            } else {
                parent = elem.parentNode;
                content = parent.getElementsByTagName("a")[0];
                emElem = document.createElement("em");
                emElem.appendChild(content);
                parent.insertAdjacentHTML("afterbegin", emElem.outerHTML);
            }
        }
    }
};

ajl.util.createRunner("CurrentNav");

}(window, document, ajl));
