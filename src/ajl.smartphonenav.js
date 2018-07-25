(function (window, document, ajl) {
"use strict";

// ----------------------------------------------------------------------------
// SmartphoneNav: スマートフォン向けグローバルナビゲーション
// ----------------------------------------------------------------------------
ajl.SmartphoneNav = function (elem, options) {
    this.btn = elem;
    this.menu = null;
    this.animateElem = null;
    this.btnOpenLabel = null;
    this.btnCloseLabel = null;
    this.defaults = {
        controlTarget: ".js-menu",
        animationTarget: null,
        direction: "vertical",
        btnCloseLabel: null,
        showClassName: "is-show",
        hideClassName: "is-hide",
        closeAnimClassName: "is-closeanimation"
    };

    this.options = ajl.util.deepExtend({}, this.defaults, options);
};

ajl.SmartphoneNav.prototype = {
    _setARIAState: function (menuState) {
        var state = menuState === "show" ? true : false;

        this.menu.setAttribute("aria-expanded", state);
        this.btn.setAttribute("aria-expanded", state);
    },

    _setBtnLabel: function (menuState) {
        if (this.options.btnCloseLabel !== null) {
            if (menuState === "show") {
                this.btn.innerHTML = this.btnCloseLabel;
            } else {
                this.btn.innerHTML = this.btnOpenLabel;
            }
        }
    },

    _preloadImg: function () {
        var re = /src=["|'](.*?)["|']/g,
            result,
            nResult,
            i,
            imgObj = [];

        result = this.options.btnCloseLabel.match(re);

        for(i = 0, nResult = result.length; i < nResult; i += 1) {
            imgObj[i] = new Image();
            imgObj[i].src = result[i].replace(/src=["|'](.*?)["|']/i, "$1");
        }
    },

    toggleMenu: function (e) {
        var menuHeight;

        e.preventDefault();

        if (this.animateElem.classList.contains(this.options.hideClassName)) {
            // 非表示→表示
            this.animateElem.classList.remove(this.options.hideClassName);
            this.animateElem.classList.add(this.options.showClassName);

            if (this.options.direction === "horizontal") {
                this.menu.classList.remove(this.options.hideClassName);
            }

            if (this.options.direction === "vertical") {
                menuHeight = this.animateElem.children[0].offsetHeight;
                this.animateElem.style.maxHeight = menuHeight + "px";
            }

            this.menu.setAttribute("tabindex", "0");
            this.menu.focus();
            this._setARIAState("show");
            this._setBtnLabel("show");
        } else {
            // 表示->非表示
            if (this.options.direction === "vertical") {
                this.animateElem.style.maxHeight = "0";
            }

            this.animateElem.classList.remove(this.options.showClassName);
            this.animateElem.classList.add(this.options.closeAnimClassName);

            this.menu.setAttribute("tabindex", "-1");
            this.btn.focus();
            this._setARIAState();
            this._setBtnLabel();
        }
    },

    onTransitionEnd: function () {
        if (this.animateElem.classList.contains(this.options.closeAnimClassName)) {
            this.animateElem.classList.add(this.options.hideClassName);
            this.animateElem.classList.remove(this.options.closeAnimClassName);

            if (this.options.direction === "horizontal") {
                this.menu.classList.add(this.options.hideClassName);
            }
        }
    },

    init: function () {
        this.menu = document.querySelector(this.options.controlTarget);

        if (this.options.direction === "horizontal") {
            this.animateElem = document.querySelector(this.options.animationTarget);
            this.menu.classList.add(this.options.hideClassName);
        } else {
            this.animateElem = this.menu;
        }

        this.animateElem.classList.add("js-menu-enable");
        this.animateElem.classList.add(this.options.hideClassName);
        ajl.event.add(
            this.animateElem,
            "webkitTransitionEnd, transitionend",
            ajl.util.proxy(this, this.onTransitionEnd)
        );

        ajl.event.add(this.btn, "click", ajl.util.proxy(this, this.toggleMenu));
        this.btn.setAttribute("aria-controls", this.menu.id);
        this._setARIAState();

        if (this.options.btnCloseLabel !== null) {
            this.btnOpenLabel = this.btn.innerHTML;
            this.btnCloseLabel = this.options.btnCloseLabel;
            this._preloadImg();
        }
    }
};

ajl.util.createRunner("SmartphoneNav");

}(window, document, ajl));
