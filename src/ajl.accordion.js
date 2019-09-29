(function (window, document, ajl) {
"use strict";

// ----------------------------------------------------------------------------
// Accordion: アコーディオン
// ----------------------------------------------------------------------------
ajl.Accordion = function (elem, options) {
    this.elem = elem;
    this.stack = {
        containerElem: null,
        buttonElem: null,
        contentElem: null
    };
    this.defaults = {
        containerClassName: ".container",
        containerActiveClassName: ".-is-active",
        titleClassName: ".title",
        contentClassName: ".content",
        enabledClassName: ".enable"
    };

    this.settings = ajl.util.deepExtend({}, this.defaults, options);
};

ajl.Accordion.prototype = {
    _togglePanel: function (e) {
        var buttonElem = e.target;
        var containerElem = buttonElem.closest(this.settings.containerClassName);
        var contentElem = buttonElem.closest(this.settings.titleClassName).nextElementSibling;
        var newHiddenState = null;

        // 今までに開いている要素の処理
        if (this.stack.buttonElem && buttonElem !== this.stack.buttonElem) {
            newHiddenState = true;
            this.stack.containerElem.classList.remove(this.settings.containerActiveClassName.replace(/^./, ""))
            this.stack.buttonElem.setAttribute("aria-expanded", String(!newHiddenState));
            this.stack.contentElem.setAttribute("aria-hidden", String(newHiddenState));
        }

        // クリックしたボタンに関連する要素の処理
        if (contentElem.getAttribute("aria-hidden") === "true") {
            newHiddenState = false;
            containerElem.classList.add(this.settings.containerActiveClassName.replace(/^./, ""))
            buttonElem.setAttribute("aria-expanded", String(!newHiddenState));
            contentElem.setAttribute("aria-hidden", String(newHiddenState));
            this.stack.containerElem = containerElem;
            this.stack.buttonElem = buttonElem;
            this.stack.contentElem = contentElem;
        } else {
            newHiddenState = true;
            containerElem.classList.remove(this.settings.containerActiveClassName.replace(/^./, ""))
            buttonElem.setAttribute("aria-expanded", String(!newHiddenState));
            contentElem.setAttribute("aria-hidden", String(newHiddenState));
            this.stack.containerElem = null;
            this.stack.buttonElem = null;
            this.stack.contentElem = null;
        }
    },

    init: function () {
        var titleElems = this.elem.querySelectorAll(this.settings.titleClassName);
        var contentElems = this.elem.querySelectorAll(this.settings.contentClassName);

        this.elem.classList.add(this.settings.enabledClassName.replace(/^./, ""));

        // タイトル要素の処理
        [].forEach.call(titleElems, function (elem) {
            var html = elem.innerHTML;
            var button = document.createElement("button");
            button.setAttribute("aria-expanded", "false");
            button.innerHTML = html;
            button.addEventListener("click", this._togglePanel.bind(this));

            while (elem.firstChild) {
                elem.removeChild(elem.firstChild);
            }

            elem.appendChild(button);
        }, this);

        // コンテンツ要素の処理
        [].forEach.call(contentElems, function (elem) {
            var id;
            var parentElem = elem.parentNode;
            var buttonElem = parentElem.querySelector(this.settings.titleClassName + " button");

            elem.setAttribute("aria-hidden", "true");

            if (elem.id) {
                id = elem.id;
            } else {
                id = ajl.util.makeIdStr("AJLAccordion_");
                elem.id = id;
            }

            buttonElem.setAttribute("aria-controls", id);
        }, this);
    }
};

ajl.util.createRunner("Accordion");

}(window, document, ajl));
