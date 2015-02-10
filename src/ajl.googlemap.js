(function (window, document, ajl) {
"use strict";

// ----------------------------------------------------------------------------
// GoogleMap: Google Mapsの表示
// ----------------------------------------------------------------------------
ajl.GoogleMap = function (elem, options) {
    this.elem = elem;
    this.mapImg = null;
    this.defaults = {
        dynamicOnly: false,
        sensor: false,
        className: "dynamicmap",
        mapOptions: null,
        collect: function (elem) {
            return elem.getElementsByTagName("img")[0];
        }
    };

    this.options = ajl.util.deepExtend({}, this.defaults, options);
};

ajl.GoogleMap.prototype = {
    loadScript: function (cbName) {
        var script = document.createElement("script"),
            src;

        src = "http://maps.googleapis.com/maps/api/js?sensor=";

        if (this.options.sensor) {
            src += "true";
        } else {
            src += "false";
        }

        if (cbName) {
            src += "&callback=" + cbName;
        }

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
        map = new google.maps.Map(div, options);
        latLngStr = params.markers.split(",");
        latLng = new google.maps.LatLng(latLngStr[0], latLngStr[1]);
        marker = new google.maps.Marker({
            position: latLng,
            map: map
        });

        div.style.height = this.mapImg.offsetHeight + "px";
        this.mapImg.parentNode.replaceChild(div, this.mapImg);
    },

    dispMap: function (self) {
        var div = document.createElement("div"),
            map,
            marker,
            options = {};

        div.className = self.options.className;

        // var styledMapId = "style" + Math.floor(Math.random() * 1000);
        // var styledMap = new google.maps.StyledMapType(
        //     this.options.mapOptions.mapStyles,
        //     { name: styledMapId }
        // );

        options.center = new google.maps.LatLng(
            self.options.mapOptions.lat,
            self.options.mapOptions.lng
        );
        options.zoom = self.options.mapOptions.zoom;
        options.mapTypeId = self.options.mapType;
        // options.mapTypeControlOptions = {};
        // options.mapTypeControlOptions.mapTypeIds = self.options.mapOptions.mapType;

        map = new google.maps.Map(div, options);
        // latLngStr = params.markers.split(",");
        // latLng = new google.maps.LatLng(latLngStr[0], latLngStr[1]);
        marker = new google.maps.Marker({
            position: options.center,
            map: map
        });

        // map.mapTypes.set("map_style", styledMap);
        // map.setMapTypeId("map_style");

        // div.style.height = self.mapImg.offsetHeight + "px";
        self.elem.appendChild(div);
     },

    init: function () {
        var self = this,
            id;

        if (this.options.dynamicOnly) {
            if (ajl.cb.gmap) {
                ajl.event.add(window, "gmaploaded", ajl.util.proxy(this, function () {
                    this.dispMap(this);
                }));
            } else {
                id = "AJL_GMAP_" + Math.floor(Math.random() * 1000000);
                ajl.cb.gmap = {};
                ajl.cb.gmap[id] = ajl.util.proxy(this, function () {
                    ajl.event.trigger(window, "gmaploaded");
                    return this.dispMap(this);
                });
                this.loadScript("ajl.cb.gmap." + id);
            }

            return;
        }

        this.mapImg = this.options.collect(this.elem);
        ajl.event.add(this.mapImg, "click", ajl.util.proxy(this, this.replaceMap));
    }
};

ajl.util.createRunner("GoogleMap");

}(window, document, ajl));
