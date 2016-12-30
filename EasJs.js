/**
 * EasJs - Javascript library by Jerome DEBRAY http://www.debray-jerome.fr
 * ==> specific OFA
 */
;document.createElement("article");
document.createElement("aside");
document.createElement("footer");
document.createElement("header");
document.createElement("nav");
document.createElement("section");
document.createElement("figure");
document.createElement("figcaption");
document.createElement("hgroup");
var EasJs = {
    readyStatus: false,
    readyIncrement: 0,
    eventCallback: 'EasLoaded',
    eventCallbackSend: false,
    browsers: {
        ie: false,
        webkit: false,
        opera: false,
        firefox: false,
        safari: false,
        version: false
    },
    isTouchDevice: false,
    alwaysCaching: true,
    _touchEventInitialize: [],
    htmlTag: null,
    headTag: null,
    asynchrone: false,
    storage: false,
    init: function() {
        this.htmlTag = document.getElementsByTagName('html')[0];
        this.headTag = document.getElementsByTagName('head')[0];
        //add class for IE
        var touchDevice = ' no-touch', div, version = 'ie ', isIe9;
        if (('ontouchstart' in window)
            || (window.DocumentTouch && document instanceof DocumentTouch)
            || (navigator.maxTouchPoints > 0)
            || (navigator.msMaxTouchPoints > 0)) {
            touchDevice = ' touch';
            this.isTouchDevice = true;
        }
        if (typeof window.head === 'undefined') {
            if (document.all) {
                this.browsers.ie = true;
                if (!document.querySelector) { // IE6 et IE 7
                    if (window.XMLHttpRequest) {
                        this.browsers.version = 7;
                        version += 'ie-7 no-box-sizing';
                    } else {
                        this.browsers.version = 6;
                        version += 'ie-6 no-box-sizing';
                    }
                } else {
                    if (!document.addEventListener) { //IE8
                        this.browsers.version = 8;
                        version += 'ie-8';
                    } else { //IE 9 et 10
                        if (window.atob) {
                            this.browsers.version = 10;
                            version += 'ie-10';
                        } else {
                            this.browsers.version = 9;
                            version += 'ie-9';
                        }
                    }
                }
            } else {
                if (!!window.MSStream) {
                    this.browsers.ie = true;
                    this.browsers.version = 11;
                    version += 'ie-11';
                } else {
                    version = 'no-ie ';
                    if (!!window.opera) {
                        this.browsers.opera = true;
                        version += 'opera';
                    } else if (typeof document.mozCancelFullScreen !== "undefined") {
                        this.browsers.firefox = true;
                        version += 'firefox';
                    } else if ((!!window.chrome)) {
                        this.browsers.webkit = true;
                        version += 'webkit';
                    } else {
                        this.browsers.safari = true;
                        version += 'webkit safari';
                    }
                }
            }

            var htmlElement = document.getElementsByTagName('html')[0];

            var inlineClasses = '';

            if (typeof htmlElement.className !== 'undefined') {
                if (/(no-javascript)/.test(htmlElement.className)) {
                    htmlElement.className = '';
                }
                inlineClasses = ' ' + htmlElement.className;
            }

            htmlElement.className = version + touchDevice + inlineClasses;

        }


    },
    loadCSS: function (styles, event, media) {
        var $this = this;
        if (typeof media === 'undefined') {
            media = 'screen';
        }
        var elt = document;
        if (event === "load") {
            elt = window;
        } else {
            event = "ready";
        }

        if (event === "ready") {
            this._loadCSS(styles, media);
        } else {
            this.addEvent(elt, event, function () {
                $this._loadCSS(styles, media);
            });
        }
        return this;
    },
    _loadCSS: function (styles, media) {
        var styleTag;
        if (styles.length >= 1) {
            styleTag = document.createElement("link");
            styleTag.href = styles[0];
            styleTag.rel = "stylesheet";
            styleTag.media = media;
            //this.headTag.insertBefore(styleTag, this.headTag.getElementsByTagName("script")[0]);
            this.headTag.appendChild(styleTag);
            styles.splice(0, 1);
            this._loadCSS(styles, media);
        }
    },
    loadJs: function (scripts, callback, event, eventCallback, alwaysCache, asynchrone) {
        alwaysCache = alwaysCache === undefined ? true : alwaysCache;
        var elt = document, $this = this;
        if (event === 'load') {
            elt = window;
        } else {
            event = 'ready';
        }

        this.asynchrone = asynchrone = (asynchrone === undefined ? false : asynchrone);
        this.eventCallback = eventCallBack = (eventCallback === undefined ? 'EasLoaded' : eventCallback);
        if (event === 'ready') {
            $this.readyStatus = true;
            $this._loadJs(scripts, callback, alwaysCache, eventCallback, asynchrone);
        } else {
            this.addEvent(elt, event, function () {
                $this._loadJs(scripts, callback, alwaysCache, eventCallback, asynchrone);
            });
        }

    },
    _loadJs: function (scripts, callback, alwaysCache, eventCallback) {
        var $this = this, scriptTag;
        if (scripts.length >= 1) {
            scriptTag = document.createElement('script');
            scriptTag.src = scripts[0] + (alwaysCache === true ? '' : '?_' + (new Date().getTime()));
            scriptTag.type = 'text/javascript';
            this.headTag.appendChild(scriptTag);
            if (!this.asynchrone) {
                if (scriptTag.attachEvent) {
                    scriptTag.onreadystatechange = function () {
                        if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") {
                            scripts.splice(0, 1);
                            $this._loadJs(scripts, callback, alwaysCache, eventCallback);
                        }
                    };
                } else {
                    scriptTag.onload = function () {
                        scripts.splice(0, 1);
                        $this._loadJs(scripts, callback, alwaysCache, eventCallback);
                    };

                }
            } else {
                scriptTag.async = true;
                this.readyIncrement++;
                scripts.splice(0, 1);
                this._loadJs(scripts, callback, alwaysCache, eventCallback);
                scriptTag.onload = function () {
                    $this.readyIncrement--;
                };
            }
        } else {
            this.testScript(callback, eventCallback);
        }
    },
    testScript: function (callback, eventCallback) {
        var self = this;
        if (this.readyIncrement > 0) {
            setTimeout(function () {
                self.testScript();
            }, 9);
        } else {
            if (typeof callback != 'undefined') {
                callback();
            }
            if (typeof eventCallback != 'undefined') {
                $(window).trigger(eventCallback);
                this.eventCallbackSend = true;
            }
        }
    },
    events: [],
    addEvent: function (element, event, callback) {
        if (element !== null) {
            if (element.addEventListener) {
                element.addEventListener(event, callback, false);
            } else if (element.attachEvent) {// && htmlEvents['on'+event]){// IE < 9
                element.attachEvent('on' + event, callback);
                this.events[event] = this.events[event] || [];
                if (this.events[event]) this.events[event].push(callback);
            } else {
                element['on' + event] = callback;
            }
        }
    },
    fireEvent: function (element, eventName) {
        var evt = null;
        if (document.createEvent) {
            evt = document.createEvent('HTMLEvents');
            evt.initEvent(eventName, true, true);
        } else if (document.createEventObject) {// IE < 9
            evt = document.createEventObject();
            evt.eventType = eventName;
        }
        if (evt !== null) {
            evt.eventName = eventName;
            if (element.dispatchEvent) {
                element.dispatchEvent(evt);
            } else if (element.fireEvent) { //&& htmlEvents['on'+eventName]){// IE < 9
                element.fireEvent('on' + evt.eventType, evt);// can trigger only real event (e.g. 'click')
            } else if (element[eventName]) {
                element[eventName]();
            } else if (element['on' + eventName]) {
                element['on' + eventName]();
            } else {
                //element['on'+eventName]();
                if (this.events[eventName]) {
                    var listeners = this.events[eventName], len = listeners.length;
                    while (len--) {
                        listeners[len](this);
                    }
                }
            }
        }
    },
    inject: function (scripts, callback, eventCallback, alwaysCache) {
        alwaysCache = alwaysCache === undefined ? true : alwaysCache;
        this._loadJs(scripts, callback, alwaysCache, eventCallback);
    },
    /**
     * be careful about document.write script style,
     * it won't work at all !
     **/
    insertScriptInDom: function (script, dom, callback) {
        var scriptTag = document.createElement('script');
        scriptTag.src = script;
        scriptTag.type = 'text/javascript';
        scriptTag.async = true;
        if (typeof callback !== 'undefined') {
            scriptTag.onload = callback;
        }
        dom.appendChild(scriptTag);
    },
    lazyLoadImage: function (elt, event, imgHeight) {
        var $this = this;
        if (typeof imgHeight == 'undefined') {
            imgHeight = 140;
        }
        if (typeof event == 'undefined') {
            event = $this.eventCallback;
        }
        if (typeof jQuery == 'undefined') {
            return false;
        }
        $(window).on(event, function () {
            $(elt).each(function () {
                //get device detection
                //get original src
                //get screen height
                var img = $(this), originalSrc = this.getAttribute('data-original'),
                    screenHeight = $(window).height(),
                    imgPosition = img.offset(),
                    loaded = false,
                    htmlBodyTop;//, device = img.attr('data-min');
                imgHeight = img.height() !== 0 ? img.height() : parseInt(img.attr('height'), 10) === 0 ? imgHeight : parseInt(img.attr('height'), 10);

                $(this).css('opacity', 0);

                if (EasJs.browsers.ie && parseInt(EasJs.browsers.version, 10) <= 8) {
                    img.attr('src', originalSrc).show().animate({
                        opacity: 1
                    }, 'slow');
                    loaded = true;
                } else {
                    htmlBodyTop = $(scrollElt).scrollTop() + screenHeight;
                    if ((imgPosition.top - imgHeight) <= htmlBodyTop) {
                        //on charge la page
                        img.attr('src', originalSrc).show().animate({
                            opacity: 1
                        }, 'slow');
                        loaded = true;
                    }
                    $(scrollElt).scroll(function(){
                        if (loaded === false) {
                            htmlBodyTop = $(this).scrollTop() + screenHeight;
                            imgPosition = img.offset();
                            if ((imgPosition.top - imgHeight) <= htmlBodyTop) {
                                //on charge la page
                                img.attr('src', originalSrc).show().animate({
                                    opacity : 1
                                }, 'slow');
                                loaded = true;
                            }
                        }
                    });
                }
            });
        });

        return this;
    },
    fullScreen: function ($elt) {
        if (document.fullScreen || document.webkitIsFullScreen || document.mozFullScreen) {
            if (typeof $elt['cancelFullScreen'] !== 'undefined') {
                $elt.cancelFullScreen();
            } else if (typeof $elt['webkitCancelFullScreen'] !== 'undefined') {
                $elt.webkitCancelFullScreen();
            } else if (typeof $elt['mozCancelFullScreen'] !== 'undefined') {
                $elt.mozCancelFullScreen();
            }
        } else {
            if (typeof $elt['requestFullScreen'] !== 'undefined') {
                $elt.requestFullScreen();
            } else if (typeof $elt['webkitRequestFullScreen'] !== 'undefined') {
                $elt.webkitRequestFullScreen();
            } else if (typeof $elt['mozRequestFullScreen'] !== 'undefined') {
                $elt.mozRequestFullScreen();
            }
        }
    },
    scrollTo: function (initialPosition, $elt, duration, callback) {
        if (typeof jQuery == 'undefined') {
            /*if (console.log) {
             console.log('EasJs.scrollTo : you need jQuery library to use this feature');
             } else {
             alert('EasJs.scrollTo : you need jQuery library to use this feature');
             } */
            return false;
        }
        var offset = {top: 0, left: 0};
        if (duration === undefined) {
            duration = 500;
        }
        if (typeof duration === 'function') {
            callback = duration;
        }
        if (initialPosition === undefined) {
            initialPosition = 0;
        }
        if ($elt !== undefined) {
            offset = $($elt).offset();
        }
        if ($('html, body').queue().length > 1) {
            $('html, body').queue(function () {
                $(this).dequeue();
            });
        }
        $('html, body').animate({
            scrollTop: offset.top - initialPosition
        }, duration, function () {
            if (typeof callback === 'function') {
                callback();
            }
        });

        return false;
    },
    test: function (testInstruction, successCallback, failedCallback) {
        if ((testInstruction)) {
            successCallback();
        } else {
            failedCallback();
        }
    },
    feature: function (feature, callback) {
        this[feature] = callback();
    },
    hasLocalStorage: function () {
        var uid = new Date;
        try {
            localStorage.setItem(uid, uid);
            localStorage.removeItem(uid);
            return true;
        } catch (exception) {
            return false;
        }
    },
    hasSessionStorage: function () {
        var uid = new Date;
        try {
            sessionStorage.setItem(uid, uid);
            sessionStorage.removeItem(uid);
            return true;
        } catch (exception) {
            return false;
        }
    },
    getCookieValue: function (valueName) {
        var reg = new RegExp('(?:^|;\\s?)' + valueName + '\\s?=([^;]*)');
        var matches = reg.exec(document.cookie);
        if (matches !== null) {
            return matches[1];
        } else {
            return null;
        }

    },
    setCookieValue : function(valueName, value, lifeTimeInSeconds, path){
        if (typeof path === "undefined") {
            path = '/';
        }
        var d = new Date();
        d.setTime(d.getTime() + (lifeTimeInSeconds*1000));
        var expires = "expires="+d.toUTCString();
        document.cookie = valueName + "=" + value + "; " + expires+ "; path=" + path;

    }

};
if (typeof window.EasJs === "undefined") {
    window.EasJs = EasJs;
}
EasJs.init();
