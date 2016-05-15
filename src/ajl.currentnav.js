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
        depth: null,
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
            searchPath = "/",
            i,
            emElem;

        // 既にカレント処理がされている場合は終了
        if (this.elem.querySelector("em")) {
            return;
        }

        // ファイル名の除去
        if (this.options.dirIndexPattern.test(currentPath)) {
            currentPath = currentPath.replace(this.options.dirIndexPattern, "");
        }

        // 検索パスの決定
        if (this.options.depth) {
            // 階層ごとに分割して配列に格納
            paths = currentPath.replace(/^\//, "").split("/");

            // depth設定値に応じてパスを生成
            for (i = 0; i < this.options.depth; i += 1) {
                if (paths[i]) {
                    searchPath += paths[i] + "/";
                }
            }

            // dirIndexPattern以外のファイル名の場合はsearchPathに追加
            // if (/\.\w+$/.test(paths[this.options.depth])) {
            //     searchPath += paths[this.options.depth];
            // }
        } else {
            searchPath = currentPath;
        }

        // マッチするアイテムを検索
        elem = this.elem.querySelector("a[href$=\"" + searchPath + "\"]");

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
