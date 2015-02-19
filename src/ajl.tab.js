(function (window, document, ajl) {
"use strict";

// ----------------------------------------------------------------------------
// Tab: タブ
// ----------------------------------------------------------------------------
ajl.Tab = function (elem, options) {
    this.elem = elem;
    this.tabPanels = null;
    this.tabListRoot = null;
    this.tabListItem = null;
    this.tabList = null;
    this.tabPanelsIds = [];
    this.activeTabNumber = null;
    this.nTabPanels = null;
    this.defaults = {
        tabListClassName: ".tablist",
        tabPanelsRootClassName: ".tabs"
    };

    this.options = ajl.util.deepExtend({}, this.defaults, options);
};

ajl.Tab.prototype = {
    _getTabIndex: function (tabId) {
        var i;

        tabId = tabId.replace("#", "");

        for (i = 0; i < this.nTabPanels; i += 1) {
            if (this.tabPanels[i].id === tabId) {
                return i;
            }
        }

        return null;
    },

    hide: function (tabNumber) {
        this.tabPanels[tabNumber].setAttribute("tabindex", -1);
        this.tabPanels[tabNumber].setAttribute("aria-hidden", "true");
        ajl.util.removeClass(this.tabPanels[tabNumber], "active");
        this.tabList[tabNumber].setAttribute("tabindex", -1);
        this.tabList[tabNumber].setAttribute("aria-selected", "false");
        ajl.util.removeClass(this.tabListItem[tabNumber], "active");
    },

    active: function (tab) {
        var tabNumber;

        if (this.activeTabNumber !== null) {
            this.hide(this.activeTabNumber);
        }

        if (typeof(tab) !== "number") {
            tabNumber = this._getTabIndex(tab);
        } else {
            tabNumber = tab;
        }

        this.tabPanels[tabNumber].setAttribute("tabindex", 0);
        this.tabPanels[tabNumber].setAttribute("aria-hidden", "false");
        ajl.util.addClass(this.tabPanels[tabNumber], "active");
        this.tabList[tabNumber].setAttribute("tabindex", 0);
        this.tabList[tabNumber].setAttribute("aria-selected", "true");
        ajl.util.addClass(this.tabListItem[tabNumber], "active");
        this.activeTabNumber = tabNumber;
    },

    activeHandler: function (e) {
        var targetId = e.target.getAttribute("href");

        e.preventDefault();
        this.active(targetId);
    },

    keydownHandler: function (e) {
        var tabNumber = null;

        switch (e.keyCode) {
            case 37:
            case 38:
                if (this.activeTabNumber - 1 > -1) {
                    tabNumber = this.activeTabNumber - 1;
                }

                break;

            case 39:
            case 40:
                if (this.activeTabNumber + 1 <= this.nTabPanels) {
                    tabNumber = this.activeTabNumber + 1;
                }

                break;
        }

        if (typeof(tabNumber) === "number") {
            this.active(tabNumber);
            this.tabList[tabNumber].focus();
        }
    },

    collectElem: function () {
        var tabListRoot,
            nTabList;

        tabListRoot = this.elem.querySelectorAll(this.options.tabListClassName);

        if (tabListRoot.length > 1) {
            throw new Error("タブリストが2つ以上あります。");
        }

        this.tabListRoot = tabListRoot[0];
        this.tabListItem = this.tabListRoot.getElementsByTagName("li");
        this.tabList = this.tabListRoot.getElementsByTagName("a");
        this.tabPanels = this.elem.querySelector(this.options.tabPanelsRootClassName).children;

        nTabList = this.tabList.length;
        this.nTabPanels = this.tabPanels.length;

        if (this.nTabPanels !== nTabList) {
            throw new Error("タブの数とタブリストの数が一致しません。");
        }
    },

    init: function () {
        var i,
            tab,
            hash = location.hash;

        // 要素収集
        this.collectElem();

        ajl.util.addClass(this.elem, "tab-enabled");

        // ul要素にrole="tablist"を付与
        this.tabListRoot.setAttribute("role", "tablist");

        // li要素にrole="presentation"を付与
        for (i = 0; i < this.nTabPanels; i += 1) {
            this.tabListItem[i].setAttribute("role", "presentation");
        }

        for (i = 0; i < this.nTabPanels; i += 1) {
            tab = this.tabPanels[i];
            this.tabPanelsIds.push(tab.id);
            tab.setAttribute("tabindex", -1);
            tab.setAttribute("role", "tabpanel");
            tab.setAttribute("aria-hidden", "true");

            this.tabList[i].setAttribute("role", "tab");
            this.tabList[i].setAttribute("tabindex", -1);
            this.tabList[i].setAttribute("aria-controls", tab.id);
            this.tabList[i].setAttribute("aria-selected", "false");

            ajl.event.add(
                this.tabList[i],
                "click",
                ajl.util.proxy(this, this.activeHandler),
                false
            );
            ajl.event.add(
                this.tabList[i],
                "keydown",
                ajl.util.proxy(this, this.keydownHandler),
                false
            );
        }

        if (!window.attachEvent && hash) {    // IE8以下ではURLにタブのハッシュが付いていても無視する
            if (this.tabPanelsIds.indexOf(hash)) {
                this.active(hash);
                return;
            }
        }

        this.active(0);
    }
};

ajl.util.createRunner("Tab");

}(window, document, ajl));
