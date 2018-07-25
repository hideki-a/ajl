(function (window, document, ajl) {
"use strict";

// ----------------------------------------------------------------------------
// Accordion: アコーディオン
// ----------------------------------------------------------------------------
ajl.Accordion = function (elem, options) {
    this.elem = elem;
    this.stack = {
        buttonElem: null,
        contentElem: null
    };
    this.defaults = {
        titleClassName: ".title",
        contentClassName: ".content",
        enabledClassName: ".enable"
    };

    this.settings = ajl.util.deepExtend({}, this.defaults, options);
};

ajl.Accordion.prototype = {
    _togglePanel: function (e) {
        const buttonElem = e.target;
        const contentElem = buttonElem.closest(this.settings.titleClassName).nextElementSibling;

        // 今までに開いている要素の処理
        if (this.stack.buttonElem && buttonElem !== this.stack.buttonElem) {
            const newHiddenState = true;
            this.stack.buttonElem.setAttribute("aria-expanded", String(!newHiddenState));
            this.stack.contentElem.setAttribute("aria-hidden", String(newHiddenState))
        }

        // クリックしたボタンに関連する要素の処理
        if (contentElem.getAttribute("aria-hidden") === "true") {
            const newHiddenState = false;
            buttonElem.setAttribute("aria-expanded", String(!newHiddenState));
            contentElem.setAttribute("aria-hidden", String(newHiddenState));
            this.stack.buttonElem = buttonElem;
            this.stack.contentElem = contentElem;
        } else {
            const newHiddenState = true;
            buttonElem.setAttribute("aria-expanded", String(!newHiddenState));
            contentElem.setAttribute("aria-hidden", String(newHiddenState));
            this.stack.buttonElem = null;
            this.stack.contentElem = null;
        }
    },

    init: function () {
        const titleElems = this.elem.querySelectorAll(this.settings.titleClassName);
        const contentElems = this.elem.querySelectorAll(this.settings.contentClassName);

        this.elem.classList.add(this.settings.enabledClassName.replace(/^./, ""));

        // タイトル要素の処理
        [].forEach.call(titleElems, function (elem) {
            const html = elem.innerHTML;
            const button = document.createElement("button");
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
            let id;
            const parentElem = elem.parentNode;
            const buttonElem = parentElem.querySelector(this.settings.titleClassName + " button");

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
