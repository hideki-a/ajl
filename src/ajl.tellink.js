(function (window, document, ajl) {
"use strict";

// ----------------------------------------------------------------------------
// TelLink: スマートフォン向け電話番号リンク
// ----------------------------------------------------------------------------
ajl.TelLink = function (elem, options) {
    this.elem = elem;
    this.defaults = {
        className: ".js-telnum",
        maxWidth: 767
    };

    this.options = ajl.util.deepExtend({}, this.defaults, options);
};

ajl.TelLink.prototype = {
    init: function () {
        var targets,
            mediaQuery = "(max-width: " + this.options.maxWidth + "px)";

        if (!window.matchMedia) {
            return;
        } else if (!window.matchMedia(mediaQuery).matches) {
            return;
        }

        targets = this.elem.querySelectorAll(this.options.className);

        Array.prototype.forEach.call(targets, function (elem) {
            var anchor = document.createElement("a"),
                tel = elem.innerText;

            anchor.setAttribute("href", "tel:" + tel.replace(/\-/g, ""));
            anchor.innerText = tel;
            elem.parentNode.replaceChild(anchor, elem);
        });
    }
};

ajl.util.createRunner("TelLink");

}(window, document, ajl));
