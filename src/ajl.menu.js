(function (window, document, ajl) {
"use strict";

// ----------------------------------------------------------------------------
// Menu: 開閉メニュー
// ----------------------------------------------------------------------------
ajl.Menu = function (elem, options) {
    this.elem = elem;
    this.firstLevelMenuItems = [];
    this.nodeFirstIds = [];
    this.nodeLastIds = [];
    this.generateId = "AJL_MENU_" + Math.floor(Math.random() * 1000000);
    this.timerId = null;
    this.stack = [];
    this.methodStack = [];
    this.defaults = {
        activeClassName: "active",
        closeWaitTime: 1000,
        direction: "down", 
        collect: function (id) {
            return document.querySelectorAll("#" + id + " > li > a");
        }
    };

    this.options = ajl.util.deepExtend({}, this.defaults, options);
};

ajl.Menu.prototype = {
    clearTimer: function (isKeyboardEvent) {
        if (this.timerId) {
            window.clearTimeout(this.timerId);
            this.timerId = null;
        } else if (isKeyboardEvent) {
            window.setTimeout(ajl.util.proxy(this, this.clearTimer, true), this.options.closeWaitTime / 4);
        }
    },

    hideMenu: function () {
        var openMenu = this.stack.shift();

        if (!openMenu) {
            return;
        }

        ajl.util.removeClass(openMenu.previousElementSibling, this.options.activeClassName);
        ajl.util.removeClass(openMenu, this.options.activeClassName);
        openMenu.setAttribute("aria-expanded", "false");
        openMenu.setAttribute("aria-hidden", "true");
        this.timerId = null;
    },

    hideMenuHandler: function () {
        if (this.stack.length > 0 && !this.timerId) {
            this.timerId = setTimeout(ajl.util.proxy(this, this.hideMenu), this.options.closeWaitTime);
        }
    },

    showMenu: function (e) {
        var targetMenu = e.currentTarget.nextElementSibling,
            openMenu;

        if (this.stack.length > 0) {
            this.clearTimer();
            openMenu = this.stack.shift();
            ajl.util.removeClass(openMenu, this.options.activeClassName);
            openMenu.setAttribute("aria-expanded", "false");
            openMenu.setAttribute("aria-hidden", "true");
        }

        if (targetMenu) {
            ajl.util.addClass(e.currentTarget, this.options.activeClassName);
            ajl.util.addClass(targetMenu, this.options.activeClassName);
            targetMenu.setAttribute("aria-expanded", "true");
            targetMenu.setAttribute("aria-hidden", "false");
            this.stack.push(targetMenu);
        }
    },

    focusMenu: function (id) {
        var nextFocusItem = document.querySelector("#" + this.generateId +
                                " a[data-item='" + id + "']");
        nextFocusItem.focus();
    },

    keydownEventHandler: function (e) {
        var elem,
            menuId = parseInt(e.target.getAttribute("data-item"), 10),
            arrayIndex,
            nextFocusId,
            nextRootKey,
            prevRootKey,
            nextChildKey,
            prevChildKey;

        switch (this.options.direction) {
            case "down":
                nextRootKey = ajl.def.keyCode.RIGHT;
                prevRootKey = ajl.def.keyCode.LEFT;
                nextChildKey = ajl.def.keyCode.DOWN;
                prevChildKey = ajl.def.keyCode.UP;
                break;
        }

        if (e.keyCode === nextChildKey) {
            e.preventDefault();

            if (e.target.nextElementSibling && e.target.nextElementSibling.tagName.toLowerCase() === "ul") {
                if (this.stack.length === 0) {
                    this.showMenu(e);
                }

                nextFocusId = menuId + 1;
                this.focusMenu(nextFocusId);
                this.clearTimer(true);
            } else if (e.target.parentNode.nextElementSibling) {
                nextFocusId = menuId + 1;

                if (this.firstLevelMenuItems.indexOf(menuId) > -1 &&
                    this.firstLevelMenuItems.indexOf(nextFocusId) > -1) {
                    return;
                }

                this.focusMenu(nextFocusId);
            }
        } else if (e.keyCode === prevChildKey) {
            e.preventDefault();

            if (e.target.parentNode.previousElementSibling) {
                nextFocusId = menuId - 1;

                if (this.firstLevelMenuItems.indexOf(menuId) > -1 &&
                    this.firstLevelMenuItems.indexOf(nextFocusId) > -1) {
                    return;
                }

                this.focusMenu(nextFocusId);
            } else if (e.target.parentNode.parentNode !== this.elem) {
                nextFocusId = menuId - 1;
                this.focusMenu(nextFocusId);
            }
        } else if (e.keyCode === nextRootKey) {
            if (e.target.getAttribute("role") === "menuitem") {
                arrayIndex = this.firstLevelMenuItems.indexOf(menuId);
                nextFocusId = this.firstLevelMenuItems[arrayIndex + 1];
                if (nextFocusId) {
                    this.hideMenu();
                    this.focusMenu(nextFocusId);
                }
            }
        } else if (e.keyCode === prevRootKey) {
            if (e.target.getAttribute("role") === "menuitem") {
                arrayIndex = this.firstLevelMenuItems.indexOf(menuId);
                nextFocusId = this.firstLevelMenuItems[arrayIndex - 1];
                if (nextFocusId > -1) {
                    this.hideMenu();
                    this.focusMenu(nextFocusId);
                }
            }
        }
    },

    destroy: function () {
        var i,
            j,
            nItems,
            menuItems,
            subMenu,
            subMenuItems,
            nSubMenuItems,
            menuId = 0,
            body = document.getElementsByTagName("body")[0];

        ajl.util.removeClass(this.elem, "ajl-menu-enabled");
        menuItems = this.options.collect(this.generateId);
        this.elem.id = "";
        this.stack = [];

        ajl.event.remove(
            body,
            "mousedown",
            this.methodStack.hide,
            false
        );

        for (i = 0, nItems = menuItems.length; i < nItems; i += 1) {
            subMenu = menuItems[i].nextElementSibling;

            // if (i > 0) {
            //     menuItems[i].removeAttribute("tabindex");
            // }

            ajl.event.remove(
                menuItems[i],
                "mouseover",
                this.methodStack.show,
                false
            );
            ajl.event.remove(
                menuItems[i],
                "keydown",
                this.methodStack.keydown,
                false
            );

            if (subMenu) {
                menuItems[i].removeAttribute("aria-haspopup");
                subMenu.removeAttribute("tabindex");
                subMenu.removeAttribute("aria-expanded");
                subMenu.removeAttribute("aria-hidden");
                ajl.util.removeClass(subMenu, this.options.activeClassName);
                ajl.event.remove(
                    menuItems[i],
                    "mouseout, blur",
                    this.methodStack.hide,
                    false
                );
                ajl.event.remove(
                    menuItems[i],
                    "keydown",
                    this.methodStack.keydown,
                    false
                );
                ajl.event.remove(
                    subMenu,
                    "mouseover, focus",
                    this.methodStack.timer,
                    false
                );
                ajl.event.remove(
                    subMenu,
                    "mouseout, blur",
                    this.methodStack.hide,
                    false
                );
                ajl.event.remove(
                    subMenu,
                    "keydown",
                    this.methodStack.keydown,
                    false
                );

                subMenuItems = subMenu.querySelectorAll("li a");
                for (j = 0, nSubMenuItems = subMenuItems.length; j < nSubMenuItems; j += 1) {
                    subMenuItems[j].removeAttribute("tabindex");
                }
            }
        }
    },

    init: function () {
        var i,
            j,
            nItems,
            menuItems,
            subMenu,
            subMenuItems,
            nSubMenuItems,
            menuId = 0,
            body = document.getElementsByTagName("body")[0];

        ajl.util.addClass(this.elem, "ajl-menu-enabled");
        this.elem.id = this.generateId;
        this.elem.setAttribute("role", "menu");
        menuItems = this.options.collect(this.generateId);

        this.methodStack.show = ajl.util.proxy(this, this.showMenu);
        this.methodStack.hide = ajl.util.proxy(this, this.hideMenuHandler);
        this.methodStack.timer = ajl.util.proxy(this, this.clearTimer);
        this.methodStack.keydown = ajl.util.proxy(this, this.keydownEventHandler);

        ajl.event.add(
            body,
            "mousedown",
            this.methodStack.hide,
            false
        );

        for (i = 0, nItems = menuItems.length; i < nItems; i += 1) {
            this.firstLevelMenuItems.push(menuId);
            menuItems[i].setAttribute("role", "menuitem");
            menuItems[i].setAttribute("data-item", menuId);
            menuId += 1;
            subMenu = menuItems[i].nextElementSibling;

            // if (i > 0) {
            //     menuItems[i].setAttribute("tabindex", "-1");
            // }

            ajl.event.add(
                menuItems[i],
                "mouseover",
                this.methodStack.show,
                false
            );
            ajl.event.add(
                menuItems[i],
                "keydown",
                this.methodStack.keydown,
                false
            );

            if (subMenu) {
                menuItems[i].setAttribute("aria-haspopup", "true");
                subMenu.setAttribute("role", "menu");
                subMenu.setAttribute("tabindex", "-1");
                subMenu.setAttribute("aria-expanded", "false");
                subMenu.setAttribute("aria-hidden", "true");
                ajl.event.add(
                    menuItems[i],
                    "mouseout, blur",
                    this.methodStack.hide,
                    false
                );
                ajl.event.add(
                    subMenu,
                    "mouseover, focus",
                    this.methodStack.timer,
                    false
                );
                ajl.event.add(
                    subMenu,
                    "mouseout, blur",
                    this.methodStack.hide,
                    false
                );
                ajl.event.add(
                    subMenu,
                    "keydown",
                    this.methodStack.keydown,
                    false
                );

                subMenuItems = subMenu.querySelectorAll("li a");
                for (j = 0, nSubMenuItems = subMenuItems.length; j < nSubMenuItems; j += 1) {
                    subMenuItems[j].setAttribute("tabindex", "-1");
                    subMenuItems[j].setAttribute("data-item", menuId);
                    menuId += 1;
                }
            }
        }
    }
};

ajl.util.createRunner("Menu");

}(window, document, ajl));
