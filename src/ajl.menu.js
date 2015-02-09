(function (window, document, ajl) {
"use strict";

// ----------------------------------------------------------------------------
// Menu: 開閉メニュー
// ----------------------------------------------------------------------------
ajl.Menu = function (elem, options) {
    this.elem = elem;
    this.allMenuItems = [];
    this.nodeFirstIds = [];
    this.nodeLastIds = [];
    this.generateId = "AJL_MENU_" + Math.floor(Math.random() * 1000000);
    this.timerId = null;
    this.stack = [];
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
    clearTimer: function () {
        window.clearTimeout(this.timerId);
    },

    hideMenu: function () {
        if (this.stack.length > 0) {
            this.timerId = setTimeout(ajl.util.proxy(this, function () {
                var openMenu = this.stack.shift();

                openMenu.classList.remove(this.options.activeClassName);
                openMenu.setAttribute("aria-expanded", "false");
                openMenu.setAttribute("aria-hidden", "true");
            }), this.options.closeWaitTime);
        }
    },

    showMenu: function (e) {
        var targetMenu = e.target.nextElementSibling,
            openMenu;

        if (this.stack.length > 0) {
            this.clearTimer();
            openMenu = this.stack.shift();
            openMenu.classList.remove(this.options.activeClassName);
            openMenu.setAttribute("aria-expanded", "false");
            openMenu.setAttribute("aria-hidden", "true");
        }

        if (targetMenu) {
            targetMenu.classList.add(this.options.activeClassName);
            targetMenu.setAttribute("aria-expanded", "true");
            targetMenu.setAttribute("aria-hidden", "false");
            this.stack.push(targetMenu);
        }
    },

    keydownEventHandler: function (e) {
        var elem,
            menuId = parseInt(e.target.getAttribute("data-item"), 10),
            nextFocusId,
            nextKey,
            prevKey;

        switch (this.options.direction) {
            case "down":
                nextKey = ajl.def.keyCode.DOWN;
                prevKey = ajl.def.keyCode.UP;
                break;
        }

        if (e.keyCode === nextKey) {
            if (e.target.nextElementSibling && e.target.nextElementSibling.tagName.toLowerCase() === "ul") {
                nextFocusId = menuId + 1;
                this.allMenuItems[nextFocusId].focus();
                this.clearTimer();
            } else if (e.target.parentNode.nextElementSibling) {
                nextFocusId = menuId + 1;
                this.allMenuItems[nextFocusId].focus();
            }
        } else if (e.keyCode === prevKey) {
            if (e.target.parentNode.previousElementSibling) {
                nextFocusId = menuId - 1;
                this.allMenuItems[nextFocusId].focus();
            } else if (e.target.parentNode.parentNode !== this.elem) {
                nextFocusId = menuId - 1;
                this.allMenuItems[nextFocusId].focus();
            }
        }
    },

    destory: function () {
        var i,
            j,
            nItems,
            menuItems,
            subMenu,
            subMenuItems,
            nSubMenuItems,
            menuId = 0;

        ajl.util.removeClass(this.elem, "ajl-menu-enabled");
        menuItems = this.options.collect(this.generateId);
        this.elem.id = "";
        this.stack = [];

        for (i = 0, nItems = menuItems.length; i < nItems; i += 1) {
            subMenu = menuItems[i].nextElementSibling;

            ajl.event.remove(
                menuItems[i],
                "mouseover, focus",
                this.showMenu,
                false
            );

            if (subMenu) {
                menuItems[i].removeAttribute("aria-haspopup");
                subMenu.removeAttribute("tabindex");
                subMenu.removeAttribute("aria-expanded");
                subMenu.removeAttribute("aria-hidden");
                ajl.event.remove(
                    menuItems[i],
                    "mouseout, blur",
                    this.hideMenu,
                    false
                );
                ajl.event.remove(
                    menuItems[i],
                    "keydown",
                    this.keydownEventHandler,
                    false
                );
                ajl.event.remove(
                    subMenu,
                    "mouseover, focus",
                    this.clearTimer,
                    false
                );
                ajl.event.remove(
                    subMenu,
                    "mouseout, blur",
                    this.hideMenu,
                    false
                );

                subMenuItems = subMenu.querySelectorAll("li a");
                for (j = 0, nSubMenuItems = subMenuItems.length; j < nSubMenuItems; j += 1) {
                    subMenuItems[j].removeAttribute("tabindex");
                    ajl.event.remove(
                        subMenuItems[j],
                        "keydown",
                        ajl.util.proxy(this, this.keydownEventHandler),
                        false
                    );
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
            menuId = 0;

        ajl.util.addClass(this.elem, "ajl-menu-enabled");
        this.elem.id = this.generateId;
        this.elem.setAttribute("role", "menu");
        menuItems = this.options.collect(this.generateId);

        for (i = 0, nItems = menuItems.length; i < nItems; i += 1) {
            this.allMenuItems.push(menuItems[i]);
            menuItems[i].setAttribute("role", "menuitem");
            menuItems[i].setAttribute("data-item", menuId);
            menuId += 1;
            subMenu = menuItems[i].nextElementSibling;

            ajl.event.add(
                menuItems[i],
                "mouseover, focus",
                ajl.util.proxy(this, this.showMenu),
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
                    ajl.util.proxy(this, this.hideMenu),
                    false
                );
                ajl.event.add(
                    menuItems[i],
                    "keydown",
                    ajl.util.proxy(this, this.keydownEventHandler),
                    false
                );
                ajl.event.add(
                    subMenu,
                    "mouseover, focus",
                    ajl.util.proxy(this, this.clearTimer),
                    false
                );
                ajl.event.add(
                    subMenu,
                    "mouseout, blur",
                    ajl.util.proxy(this, this.hideMenu),
                    false
                );

                subMenuItems = subMenu.querySelectorAll("li a");
                for (j = 0, nSubMenuItems = subMenuItems.length; j < nSubMenuItems; j += 1) {
                    this.allMenuItems.push(subMenuItems[j]);
                    subMenuItems[j].setAttribute("tabindex", "-1");
                    subMenuItems[j].setAttribute("data-item", menuId);
                    menuId += 1;
                    ajl.event.add(
                        subMenuItems[j],
                        "keydown",
                        ajl.util.proxy(this, this.keydownEventHandler),
                        false
                    );
                }
            }
        }
    }
};

ajl.util.createRunner("Menu");

}(window, document, ajl));
