(function (window, document) {
"use strict";

// ----------------------------------------------------------------------------
// 名前空間作成
// ----------------------------------------------------------------------------
var ajl;

if (!ajl) {
    ajl = window.ajl = {
        version: "1.0.0"    // コアバージョン
    };
}


// ----------------------------------------------------------------------------
// 機能許可インタフェース（簡易実行ラッパー）格納用
// ----------------------------------------------------------------------------
ajl.enable = {};


// ----------------------------------------------------------------------------
// 各種定義
// ----------------------------------------------------------------------------
ajl.def = {
    keyCode: {
        UP: 38,
        RIGHT: 39,
        DOWN: 40,
        LEFT: 37,
        PAGE_DOWN: 34,
        PAGE_UP: 33,
        SPACE: 32,
        TAB: 9
    }
};


// ----------------------------------------------------------------------------
// webAPI
// ----------------------------------------------------------------------------
ajl.webAPI = {
    rAF: (function () {
        window.requestAnimationFrame =
            window.requestAnimationFrame || 
            window.webkitRequestAnimationFrame || 
            function (callback) {
                window.setTimeout(callback, 16.66666);
            };
    }())
};


// ----------------------------------------------------------------------------
// ユーティリティ
// ----------------------------------------------------------------------------
ajl.util = {
    decapitalize: function (str) {
        return str.charAt(0).toLowerCase() + str.slice(1);
    },

    deepExtend: function (out) {
        var i;

        out = out || {};

        for (i = 1; i < arguments.length; i += 1) {
            var obj = arguments[i],
                key;

            if (!obj) {
                continue;
            }

            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    // ECMAScript 5.1では、typeof /s/ === 'object';
                    // if (!/^\/.*\/$/.test(obj[key]) && typeof obj[key] === "object") {
                    //     ajl.util.deepExtend(out[key], obj[key]);
                    // } else {
                        out[key] = obj[key];
                    // }
                }
            }
        }

        return out;
    },

    proxy: function (obj, fn) {
        return function () {
            fn.apply(obj, arguments);
        };
    },

    addClass: function (elem, className) {
        if (elem.classList) {
            elem.classList.add(className);
        } else {
            elem.className += " " + className;
        }
    },

    removeClass: function (elem, className) {
        var before = elem.className,
            after;

        if (elem.classList) {
            elem.classList.remove(className);
        } else {
            after = before.replace(
                new RegExp("(^|\\b)" + className.split(" ").join("|") + "(\\b|$)", "gi"),
                " "
            );

            if (before !== after) {
                if (/\s+/.test(after)) {
                    elem.removeAttribute("class");
                } else {
                    elem.className = after;
                }
            }
        }
    },

    getRunner: function (NewObj) {
        return function (className, options) {
            var elems = document.querySelectorAll(className),
                nElems = elems.length,
                ret = new Array(nElems),
                e;

            for (e = 0; e < nElems; e += 1) {
                ret[e] = new NewObj(elems[e], options);
                ret[e].init();
            }

            return ret;
        };
    },

    createRunner: function (newObjName) {
        ajl.enable[ajl.util.decapitalize(newObjName)] = ajl.util.getRunner(ajl[newObjName]);
    }
};


// ----------------------------------------------------------------------------
// Event
// ----------------------------------------------------------------------------
ajl.event = {
    _stack: [],

    add: function (elem, type, listener, useCapture) {
        var events = [],
            nEvents,
            i;

        if (elem.addEventListener) {
            if (type.indexOf(",") > -1) {
                events = type.split(",");
                for (i = 0, nEvents = events.length; i < nEvents; i += 1) {
                    // String.prototype.trim(): IE9+
                    // See Also: https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/String/trim
                    elem.addEventListener(events[i].trim(), listener, useCapture);
                }
            } else {
                elem.addEventListener(type, listener, useCapture);
            }
        } else if (elem.attachEvent) {
            elem.attachEvent("on" + type, listener);
        }

        if (type !== "unload") {
            ajl.event._stack.push([elem, type, listener, useCapture]);
        }
    },

    remove: function (elem, type, listener, useCapture) {
        var events = [],
            nEvents,
            i;

        if (elem.removeEventListener) {
            if (type.indexOf(",") > -1) {
                events = type.split(",");
                for (i = 0, nEvents = events.length; i < nEvents; i += 1) {
                    // Support IE9+
                    elem.removeEventListener(events[i].trim(), listener, useCapture);
                }
            } else {
                elem.removeEventListener(type, listener, useCapture);
            }
        } else if (elem.dettachEvent) {
            elem.detachEvent("on" + type, listener);
        }
    },

    trigger: function (elem, type, data) {
        var e,
            detailObj = {};

        if (data) {
            detailObj.detail = data; 
        }

        e = document.createEvent("CustomEvent");
        e.initCustomEvent(type, true, true, data);
        elem.dispatchEvent(e);
    } 
};

// ------------------------------------
// メモリリーク防止（IE6-8 custom event）
// ------------------------------------
ajl.event.add(window, "unload", function () {
    var stacks = ajl.event._stack,
        nStacks = stacks.length,
        s;

    for (s = 0; s < nStacks; s += 1) {
        ajl.event.remove.apply(ajl.event, stacks[s]);
    }
});


// ----------------------------------------------------------------------------
// スタイル
// ----------------------------------------------------------------------------
ajl.style = {
    getPropValue: function (elem, property) {
        var style = getComputedStyle(elem);

        return style[property];
    },

    getOuterHeight: function (elem, containMargin) {
        var height = elem.offsetHeight,
            style;

        if (containMargin) {
            style = getComputedStyle(elem);
            height += parseInt(style.marginTop) + parseInt(style.marginBottom);
        }

        return height + "px";
    }
};


// ----------------------------------------------------------------------------
// 外部API呼び出し時のコールバック格納
// ----------------------------------------------------------------------------
ajl.cb = {};

}(window, document));
