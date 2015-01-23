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
// webAPI
// ----------------------------------------------------------------------------
ajl.webAPI = {
    rAF: (function () {
        return ajl.rAF = window.requestAnimationFrame =
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
    capitalize: function (str) {
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
                    if (!/^\/.*\/$/.test(obj[key]) && typeof obj[key] === "object") {
                        ajl.util.deepExtend(out[key], obj[key]);
                    } else {
                        out[key] = obj[key];
                    }
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
        ajl.enable[ajl.util.capitalize(newObjName)] = ajl.util.getRunner(ajl[newObjName]);
    }
};


// ----------------------------------------------------------------------------
// Event
// ----------------------------------------------------------------------------
ajl.event = {
    _stack: [],

    add: function (elem, type, listener, useCapture) {
        if (elem.addEventListener) {
            elem.addEventListener(type, listener, useCapture);
        } else if (elem.attachEvent) {
            elem.attachEvent("on" + type, listener);
        }

        if (type !== "unload") {
            ajl.event._stack.push([elem, type, listener, useCapture]);
        }
    },

    remove: function (elem, type, listener, useCapture) {
        if (elem.removeEventListener) {
            elem.removeEventListener(type, listener, useCapture);
        } else if (elem.dettachEvent) {
            elem.detachEvent("on" + type, listener);
        }
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

}(window, document));
