(function (window, document, ajl) {
"use strict";

// ----------------------------------------------------------------------------
// SocialButtons: ソーシャルボタンの非同期読み込み
// ----------------------------------------------------------------------------
ajl.SocialButtons = function (elem, options) {
    this.elem = elem;
    this.scrollChecker = null;
    this.isLoaded = false;
    this.defaults = {
        fbAppId: null
    };

    this.options = ajl.util.deepExtend({}, this.defaults, options);
};

ajl.SocialButtons.prototype = {
    pretreatmentFunc: {
        facebook: function () {
            var div = document.createElement("div");

            div.id = "fb-root";
            this.elem.parentNode.insertBefore(div, this.elem);

            window.fbAsyncInit = function () {
                FB.Event.subscribe("edge.create", function (targetUrl) {
                    if (window.ga) {
                        ga("send", "social", "facebook", "like", targetUrl);
                    }
                });
            };
        },

        google: function () {
            window.___gcfg = { lang: 'ja' };
        }
    },

    aftertreatmentFunc: {
        twitter: function () {
            window.twttr = window.twttr || {
                _e: [],
                ready: function (f) {
                    window.twttr._e.push(f);
                }
            };

            window.twttr.ready(function (twttr) {
                twttr.events.bind("tweet", function (intentEvent) {
                    if (intentEvent && window.ga) {
                        ga("send", "social", "twitter", "tweet", location.href);
                    }
                });
            });
        }
    },

    loadJS: function () {
        var fbAppIdStr = this.options.fbAppId ? "&appId=" + this.options.fbAppId : "",
            scripts = [
                {
                    "src": "//platform.twitter.com/widgets.js",
                    "id": "twitter-wjs",
                    "aftertreatment": "twitter"
                },
                {
                    "src": "//connect.facebook.net/ja_JP/sdk.js#xfbml=1" + fbAppIdStr + "&version=v2.0",
                    "id": "facebook-jssdk",
                    "pretreatment": "facebook"
                },
                {
                    "src": "https://apis.google.com/js/plusone.js",
                    "pretreatment": "google"
                }
            ],
            i,
            nScript = scripts.length,
            fScript = document.getElementsByTagName("script")[0],
            script;

        for (i = 0; i < nScript; i += 1) {
            if (scripts[i].pretreatment) {
                this.pretreatmentFunc[scripts[i].pretreatment].call(this);
            }

            script = document.createElement("script");
            script.async = true;
            script.src = scripts[i].src;
            if (scripts[i].id) {
                script.id = scripts[i].id;
            }
            fScript.parentNode.insertBefore(script, fScript);

            if (scripts[i].aftertreatment) {
                this.aftertreatmentFunc[scripts[i].aftertreatment].call();
            }
        }
    },

    dispSocial: function () {
        var pos = (document.documentElement.scrollTop || document.body.scrollTop) +
                  (window.innerHeight || document.documentElement.clientHeight),
            containerPosY = this.elem.offsetTop;

        if (pos >= (containerPosY - 100)) {
            this.loadJS();
            this.isLoaded = true;

            if (this.scrollChecker) {
                ajl.event.remove(window, "scroll", this.scrollChecker, false);
            }
        }
    },

    init: function () {
        this.dispSocial();

        if (!this.isLoaded) {
            this.scrollChecker = ajl.util.proxy(this, this.dispSocial);
            ajl.event.add(window, "scroll", this.scrollChecker, false);
            this.isScrollCheck = true;
        }
    }
};

ajl.util.createRunner("SocialButtons");

}(window, document, ajl));
