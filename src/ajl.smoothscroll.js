(function (window, document, ajl) {
"use strict";

// ----------------------------------------------------------------------------
// SmoothScroll: ページ内リンクをスムーズにスクロールする
// ----------------------------------------------------------------------------
// TODO: this.defaults.vの改名
//       フォーカスの移動
ajl.SmoothScroll = function (elem, options) {
    this.elem = elem;           // a要素
    this.targetId = null;       // a要素のhref属性に記載のID名
    this.targetElem = null;     // a要素のhref属性で指定された要素
    this.bodyElem = null;       // body要素
    this.start = 0;             // スクロール開始位置
    this.dest = 0;              // スクロール完了位置
    this.direction = null;      // スクロールの方向
    this.elapsedTime = 0;
    this.defaults = {
        excludeCond: /tab_/,
        paddingTop: 0,
        pageTop: false,
        v: 20,    // The value which influences speed.
        duration: 120,
        moveFocus: true,
        pagetopId: "header",
        easing: null
    };

    this.options = ajl.util.deepExtend({}, this.defaults, options);
};

ajl.SmoothScroll.prototype = {
    scrollFinish: function () {
        ajl.util.removeClass(this.bodyElem, "js-smoothscroll-scrolling");

        if (this.options.moveFocus && this.options.paddingTop) {
            if (this.targetId === this.options.pagetopId) {
                this.pagetopIdsChildNodes.focus();
            } else if (this.options.pageTop) {
                this.pagetopIdsChildNodes.focus();
            } else {
                this.targetElem.focus();
            }
        } else {
            window.location.hash = this.targetId;
        }
    },

    startScroll: function () {
        var documentHeight = document.documentElement.scrollHeight,
            viewportHeight = document.documentElement.clientHeight,
            rect = this.targetElem.getBoundingClientRect();

        this.elapsedTime = 0;
        this.start = window.pageYOffset || document.documentElement.scrollTop;
        this.dest = rect.top + window.pageYOffset - this.options.paddingTop;

        if (documentHeight - viewportHeight < this.dest) {
            this.dest = documentHeight - viewportHeight;
        } else if (this.dest <= 0) {
            this.dest = 1;
        }

        this.direction = (this.dest - this.start > 0) ? "down" : "up";
        ajl.util.addClass(this.bodyElem, "js-smoothscroll-scrolling");
        this.doScroll();
    },

    doScroll: function () {
        var moveY;
        var elapsedTimeRate = this.elapsedTime / this.options.duration;
        var valueChangeRate;

        if (this.direction === "up" && this.start > this.dest) {
            if (this.options.easing) {
                valueChangeRate = this.options.easing(elapsedTimeRate);
                moveY = this.start - Math.floor((this.start - this.dest) * valueChangeRate) - 1;
            } else {
                moveY = Math.floor(this.start - (this.start - this.dest) / this.options.v - 1);
            }

            if (moveY <= 1) {
                moveY = 1;
            }
        } else if (this.direction === "down" && this.dest > this.start) {
            if (this.options.easing) {
                valueChangeRate = this.options.easing(elapsedTimeRate);
                moveY = this.start + Math.ceil((this.dest - this.start) * valueChangeRate) + 1;
            } else {
                moveY = Math.ceil(this.start + (this.dest - this.start) / this.options.v + 1);
            }
        } else {
            this.scrollFinish();
            return;
        }

        window.scrollTo(0, moveY);

        if (this.options.easing) {
            this.elapsedTime += 1;
        } else {
            this.start = moveY;
        }

        if (this.direction === "up" && moveY > this.dest ||
            this.direction === "down" && moveY < this.dest) {
            window.requestAnimationFrame(ajl.util.proxy(this, this.doScroll));
        } else {
            this.scrollFinish();
            return;
        }
    },

    init: function () {
        var pageTopElem;

        this.targetId = this.elem.getAttribute("href").replace(/(https?:\/\/[a-zA-Z0-9\.%\/]+)?\#/, "");

        if (!this.targetId) {
            return;
        }

        this.targetElem = document.getElementById(this.targetId);
        this.bodyElem = document.getElementsByTagName("body")[0];

        if (!this.options.excludeCond.test(this.targetId) && this.targetElem) {
            if (this.options.moveFocus && this.options.paddingTop) {
                if (this.targetId === this.options.pagetopId) {
                    this.pagetopIdsChildNodes = this.targetElem.children[0];
                    this.pagetopIdsChildNodes.setAttribute("tabindex", "-1");
                } else if (this.options.pageTop) {
                    pageTopElem = document.getElementById(this.options.pagetopId);
                    this.pagetopIdsChildNodes = pageTopElem.children[0];
                    this.pagetopIdsChildNodes.setAttribute("tabindex", "-1");
                } else {
                    this.targetElem.setAttribute("tabindex", "-1");
                }
            } else if (this.options.moveFocus) {
                if (this.options.pageTop) {
                    pageTopElem = document.getElementById(this.options.pagetopId);
                    this.pagetopIdsChildNodes = pageTopElem.children[0];
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
