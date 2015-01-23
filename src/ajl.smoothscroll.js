(function (window, document, ajl) {
"use strict";

// ----------------------------------------------------------------------------
// SmoothScroll: ページ内リンクをスムーズにスクロールする
// ----------------------------------------------------------------------------
// TODO: this.defaults.vの改名
//       フォーカスの移動
ajl.SmoothScroll = function (elem, options) {
    this.elem = elem;
    this.targetId = null;
    this.targetElem = null;
    this.start = 0;
    this.dest = 0;
    this.direction = null;
    this.defaults = {
        excludeCond: /tab_/,
        v: 20,    // The value which influences speed.
        moveFocus: false,    // 試験実装中のため
        pagetopId: "header"
    };

    this.options = ajl.util.deepExtend({}, this.defaults, options);
}

ajl.SmoothScroll.prototype = {
    startScroll: function () {
        var documentHeight = document.documentElement.scrollHeight,
            viewportHeight = document.documentElement.clientHeight;

        this.start = window.pageYOffset || document.documentElement.scrollTop;
        this.dest = this.targetElem.offsetTop;

        if (documentHeight - viewportHeight < this.dest) {
            this.dest = documentHeight - viewportHeight;
        } else if (this.dest === 0) {
            this.dest = 1;
        }

        this.direction = (this.dest - this.start > 0) ? "down" : "up";
        this.doScroll();
    },

    doScroll: function () {
        var moveY;

        if (this.direction === "up" && this.start > this.dest) {
            moveY = Math.floor(this.start - (this.start - this.dest) / this.options.v - 1);
            if (moveY <= 1) {
                moveY = 1;
            }
        } else if (this.direction === "down" && this.dest > this.start) {
            moveY = Math.ceil(this.start + (this.dest - this.start) / this.options.v + 1);
        } else {
            if (this.options.moveFocus) {
                if (this.targetId === this.options.pagetopId) {
                    this.pagetopIdsChildNodes.focus();
                } else {
                    this.targetElem.focus();
                }
            }

            return;
        }

        window.scrollTo(0, moveY);
        this.start = moveY;
        window.requestAnimationFrame(ajl.util.proxy(this, this.doScroll));
    },

    init: function () {
        this.targetId = this.elem.getAttribute("href").replace(/(https?:\/\/[a-zA-Z0-9\.%\/]+)?\#/, "");
        this.targetElem = document.getElementById(this.targetId);

        if (!this.options.excludeCond.test(this.targetId) && this.targetElem) {
            if (this.options.moveFocus) {
                if (this.targetId === this.options.pagetopId) {
                    this.pagetopIdsChildNodes = this.targetElem.children[0];
                    this.pagetopIdsChildNodes.setAttribute("tabindex", "-1");
                } else {
                    this.targetElem.setAttribute("tabindex", "-1");
                }
            }

            ajl.event.add(this.elem, "click", ajl.util.proxy(this, function (e) {
                if (e.preventDefault) {
                    e.preventDefault();
                } else if (typeof window.attachEvent === "object") {
                    event.returnValue = false;
                }

                this.startScroll();
            }), false);
        }
    }
};

ajl.util.createRunner("SmoothScroll");

}(window, document, ajl));
