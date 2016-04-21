(function (window, document, ajl) {
"use strict";

// ----------------------------------------------------------------------------
// GoogleMap: Google Mapsの表示
// ----------------------------------------------------------------------------
// todo: コントロールUIの変更について要検討
//       https://developers.google.com/maps/documentation/javascript/controls?hl=ja#DefaultControls
// 
//       スタイルの変更について
//       変更しても見にくいだけではないか？
//       https://developers.google.com/maps/documentation/javascript/styling?hl=ja
ajl.GoogleMap = function (elem, options) {
    this.elem = elem;
    this.map = null;
    this.mapImg = null;
    this.markers = [];
    this.state = {
        openedInfoWindow: null
    };
    this.defaults = {
        dynamicOnly: false,
        sensor: false,
        className: "dynamicmap",
        mapOptions: null,
        language: "ja",
        collect: function (elem) {
            return elem.getElementsByTagName("img")[0];
        }
    };

    this.options = ajl.util.deepExtend({}, this.defaults, options);
};

ajl.GoogleMap.prototype = {
    _loadScript: function (cbName) {
        var script = document.createElement("script"),
            src;

        src = "http://maps.googleapis.com/maps/api/js?sensor=";

        if (this.options.sensor) {
            src += "true";
        } else {
            src += "false";
        }

        if (this.options.key) {
            src += "key=" + this.options.key;
        }

        if (cbName) {
            src += "&callback=" + cbName;
        }

        src += "&language=" + this.options.language;

        script.src = src;
        document.body.appendChild(script);
    },

    _getParams: function () {
        var params = {},
            paramStr = this.mapImg.src.replace(/https?:\/\/[a-zA-Z0-9\/\.]*\?/, ""),
            paramsArray = paramStr.split("&"),
            i,
            nParams = paramsArray.length,
            keyValuePair;

        for (i = 0; i < nParams; i += 1) {
            keyValuePair = paramsArray[i].split("=");
            params[keyValuePair[0]] = keyValuePair[1];
        }

        return params;
    },

    _ctrlInfoWindow: function (markerObj, obj) {
        if (obj.state.openedInfoWindow) {
            obj.state.openedInfoWindow.close();
        }
        markerObj.infoWindow.open(obj.map, markerObj);
        obj.state.openedInfoWindow = markerObj.infoWindow;
    },

    _setMarkers: function () {
        var self = this,
            latLng,
            nMarkers = this.options.markers.length,
            i,
            infoWindow,
            handler = function () {
                self._ctrlInfoWindow(this, self);
            };

        for (i = 0; i < nMarkers; i += 1) {
            latLng = new google.maps.LatLng(
                this.options.markers[i].lat,
                this.options.markers[i].lng
            );
            this.markers[i] = new google.maps.Marker({
                position: latLng,
                title: this.options.markers[i].title,
                icon: this.options.markers[i].icon ? this.options.markers[i].icon : "",
                map: this.map
            });

            if (this.options.markers[i].content) {
                infoWindow = this.markers[i].infoWindow = new google.maps.InfoWindow({
                    content: this.options.markers[i].content
                });
                google.maps.event.addListener(
                    this.markers[i],
                    "click",
                    handler
                );
                google.maps.event.addListener(
                    infoWindow,
                    "closeclick",
                    function () {
                        google.maps.event.addListenerOnce(this.markers[i], "click", function () {
                            infoWindow.open(this.map, this.markers[i]);
                        });
                    }
                );

                if (this.options.markers[i].openOnLoad) {
                    infoWindow.open(this.map, this.markers[i]);
                }
            }
        }
    },

    replaceMap: function () {
        var div = document.createElement("div"),
            params = this._getParams(),
            latLngStr,
            latLng,
            zoom,
            map,
            marker,
            options;

        latLngStr = params.center.split(",");
        latLng = new google.maps.LatLng(latLngStr[0], latLngStr[1]);
        zoom = parseInt(params.zoom, 10);
        options = {
            zoom: zoom,
            center: latLng,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        div.className = this.options.className;
        div.style.height = this.mapImg.offsetHeight + "px";
        this.mapImg.parentNode.replaceChild(div, this.mapImg);    // 先にappendしないと表示にバグ発生

        this.map = new google.maps.Map(div, options);
        latLngStr = params.markers.split(",");
        latLng = new google.maps.LatLng(latLngStr[0], latLngStr[1]);
        marker = new google.maps.Marker({
            position: latLng,
            map: this.map
        });
    },

    dispMap: function (self) {
        var div = document.createElement("div"),
            map,
            marker,
            options = {};

        div.className = self.options.className;
        options.center = new google.maps.LatLng(
            self.options.mapOptions.lat,
            self.options.mapOptions.lng
        );
        options.zoom = self.options.mapOptions.zoom;
        options.mapTypeId = self.options.mapType;
        this.map = new google.maps.Map(div, options);
        this._setMarkers();

        // div.style.height = self.mapImg.offsetHeight + "px";
        self.elem.appendChild(div);
     },

    init: function () {
        var id;

        if (this.options.dynamicOnly) {
            ajl.event.add(window, "gmaploaded", ajl.util.proxy(this, function () {
                this.dispMap(this);
            }));

            if (!ajl.cb.gmap) {
                id = "AJL_GMAP_" + Math.floor(Math.random() * 1000000);
                ajl.cb.gmap = {};
                ajl.cb.gmap[id] = ajl.util.proxy(this, function () {
                    ajl.event.trigger(window, "gmaploaded");
                });
                this._loadScript("ajl.cb.gmap." + id);
            }
        } else {
            this.mapImg = this.options.collect(this.elem);
            ajl.event.add(window, "gmaploaded", ajl.util.proxy(this, function () {
                ajl.event.add(this.mapImg, "click", ajl.util.proxy(this, this.replaceMap));
            }));

            if (!ajl.cb.gmap) {
                id = "AJL_GMAP_" + Math.floor(Math.random() * 1000000);
                ajl.cb.gmap = {};
                ajl.cb.gmap[id] = ajl.util.proxy(this, function () {
                    ajl.event.trigger(window, "gmaploaded");
                });
                this._loadScript("ajl.cb.gmap." + id);
            }
        }
    }
};

ajl.util.createRunner("GoogleMap");

}(window, document, ajl));
