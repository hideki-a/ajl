/*!
 * ajl
 *
 * Copyright 2015 Hideki Abe
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */
 /*!
 |*|
 |*|  :: cookies.js ::
 |*|
 |*|  A complete cookies reader/writer framework with full unicode support.
 |*|
 |*|  https://developer.mozilla.org/en-US/docs/DOM/document.cookie
 |*|
 |*|  Syntaxes:
 |*|
 |*|  * docCookies.setItem(name, value[, end[, path[, domain[, secure]]]])
 |*|  * docCookies.getItem(name)
 |*|  * docCookies.removeItem(name[, path])
 |*|  * docCookies.hasItem(name)
 |*|  * docCookies.keys()
 |*|
 \*/

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
        TAB: 9,
        ENTER: 13
    }
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
// Cookieユーティリティ
// https://developer.mozilla.org/ja/docs/Web/API/Document/cookie
// docCookiesをajl.cookieとして取り込み。
// ----------------------------------------------------------------------------
ajl.cookie = {
    getItem: function(sKey) {
        if (!sKey || !this.hasItem(sKey)) {
            return null;
        }
        return unescape(document.cookie.replace(new RegExp("(?:^|.*;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"), "$1"));
    },

    setItem: function(sKey, sValue, vEnd, sPath, sDomain, bSecure) {
        if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) {
            return;
        }
        var sExpires = "";
        if (vEnd) {
            switch (vEnd.constructor) {
                case Number:
                    sExpires = vEnd === Infinity ? "; expires=Tue, 19 Jan 2038 03:14:07 GMT" : "; max-age=" + vEnd;
                    break;
                case String:
                    sExpires = "; expires=" + vEnd;
                    break;
                case Date:
                    sExpires = "; expires=" + vEnd.toGMTString();
                    break;
            }
        }
        document.cookie = escape(sKey) + "=" + escape(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
    },

    removeItem: function(sKey, sPath) {
        if (!sKey || !this.hasItem(sKey)) {
            return;
        }
        document.cookie = escape(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sPath ? "; path=" + sPath : "");
    },

    hasItem: function(sKey) {
        return (new RegExp("(?:^|;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
    },

    keys: /* optional method: you can safely remove it! */ function() {
        var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
        for (var nIdx = 0; nIdx < aKeys.length; nIdx++) {
            aKeys[nIdx] = unescape(aKeys[nIdx]);
        }
        return aKeys;
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
                    if (elem === window &&
                        events[i].trim() === "load" &&
                        document.readyState === "complete") {
                        listener();
                    } else {
                        elem.addEventListener(events[i].trim(), listener, useCapture);
                    }
                }
            } else {
                if (elem === window &&
                    type === "load" &&
                    document.readyState === "complete") {
                    listener();
                } else {
                    elem.addEventListener(type, listener, useCapture);
                }
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
