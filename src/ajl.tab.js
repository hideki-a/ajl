(function (window, document, ajl) {
"use strict";

// ----------------------------------------------------------------------------
// Tab: タブ
// ----------------------------------------------------------------------------
ajl.Tab = function (elem, options) {
    this.elem = elem;
    this.tabPanelsRoot = null;
    this.tabPanels = null;
    this.tabListRoot = null;
    this.tabListItem = null;
    this.tabList = null;
    this.tabPanelsIds = [];
    this.activeTabNumber = null;
    this.nTabPanels = null;
    this.methodStack = [];
    this.defaults = {
        tabEnabledClassName: ".tab-enabled",
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
        this.tabList[tabNumber].setAttribute("tabindex", -1);
        this.tabList[tabNumber].setAttribute("aria-selected", "false");
    },

    active: function (tab) {
        var tabNumber,
            hash;

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
        this.tabList[tabNumber].setAttribute("tabindex", 0);
        this.tabList[tabNumber].setAttribute("aria-selected", "true");
        this.activeTabNumber = tabNumber;

        if (this.elem.id) {
            hash = typeof(tab) === "number" ? '#' + this.tabPanels[tabNumber].id : tab;
            window.sessionStorage.setItem(
                'ajl_tab_' + this.elem.id + '_active_tab',
                hash
            );
        }
    },

    activeHandler: function (e) {
        var targetId = e.target.getAttribute("href");

        e.preventDefault();
        this.active(targetId);
    },

    keydownHandler: function (e) {
        var tabNumber = null;

        switch (e.keyCode) {
            case ajl.def.keyCode.LEFT:
            case ajl.def.keyCode.UP:
                e.preventDefault();

                if (this.activeTabNumber - 1 > -1) {
                    tabNumber = this.activeTabNumber - 1;
                }

                break;

            case ajl.def.keyCode.RIGHT:
            case ajl.def.keyCode.DOWN:
                e.preventDefault();

                if (this.activeTabNumber + 1 < this.nTabPanels) {
                    tabNumber = this.activeTabNumber + 1;
                }

                break;
            case ajl.def.keyCode.ENTER:
                e.preventDefault();

                this.tabPanels[this.activeTabNumber].focus();

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
        this.tabPanelsRoot = this.elem.querySelector(this.options.tabPanelsRootClassName);
        this.tabPanels = this.tabPanelsRoot.children;

        nTabList = this.tabList.length;
        this.nTabPanels = this.tabPanels.length;

        if (this.nTabPanels !== nTabList) {
            throw new Error("タブの数とタブリストの数が一致しません。");
        }
    },

    destroy: function () {
        var i,
            tab;

        this.elem.classList.remove(this.options.tabEnabledClassName.replace(".", ""));

        // ul要素にrole="tablist"を付与
        this.tabListRoot.removeAttribute("role");

        // タブを包含する要素にrole="presentation"を付与
        this.tabPanelsRoot.removeAttribute("role");

        // li要素にrole="presentation"を付与
        for (i = 0; i < this.nTabPanels; i += 1) {
            this.tabListItem[i].removeAttribute("role");
        }

        for (i = 0; i < this.nTabPanels; i += 1) {
            tab = this.tabPanels[i];
            tab.removeAttribute("tabindex");
            tab.removeAttribute("role");
            tab.removeAttribute("aria-hidden");

            this.tabList[i].removeAttribute("role");
            this.tabList[i].removeAttribute("tabindex");
            this.tabList[i].removeAttribute("aria-controls");
            this.tabList[i].removeAttribute("aria-selected");

            ajl.event.remove(
                this.tabList[i],
                "click",
                this.methodStack.activeHandler,
                false
            );
            ajl.event.remove(
                this.tabList[i],
                "keydown",
                this.methodStack.keydownHandler,
                false
            );
        }
    },

    init: function () {
        var i,
            tab,
            hash = location.hash,
            savedHash;

        this.methodStack.activeHandler = ajl.util.proxy(this, this.activeHandler);
        this.methodStack.keydownHandler = ajl.util.proxy(this, this.keydownHandler);
        
        // 要素収集
        this.collectElem();

        this.elem.classList.add(this.options.tabEnabledClassName.replace(".", ""));

        // ul要素にrole="tablist"を付与
        this.tabListRoot.setAttribute("role", "tablist");

        // タブを包含する要素にrole="presentation"を付与
        this.tabPanelsRoot.setAttribute("role", "presentation");

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
                this.methodStack.activeHandler,
                false
            );
            ajl.event.add(
                this.tabList[i],
                "keydown",
                this.methodStack.keydownHandler,
                false
            );
        }

        if (hash && this.tabPanelsIds.indexOf(hash.replace(/^#/, "")) > -1) {
            this.active(hash);
            return;
        }

        savedHash = window.sessionStorage.getItem('ajl_tab_' + this.elem.id + '_active_tab');
        if (savedHash && this.elem.id) {
            this.active(savedHash);
            return;
        }

        this.active(0);
    }
};

ajl.util.createRunner("Tab");

}(window, document, ajl));
