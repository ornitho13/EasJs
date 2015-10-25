/**
 * Created by jdebray on 12/10/2015.
 */
(function(window){
    "use strict";
    var EasJs = {
        headTag : null,
        browsers : {
            ie : false,
            webkit : false,
            opera : false,
            firefox : false,
            version : false
        },
        html : document.getElementsByTagName('html')[0],
        isTouchDevice : false,
        init : function() {
            this.headTag = document.getElementsByTagName('head')[0];
            //add class for IE
            var touchDevice = ' no-touch', version = 'ie ';
            if(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
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
                                version +='ie-10';
                            } else {
                                version +='ie-9';
                            }
                        }
                    }
                } else {
                    if (!!window.MSStream) {
                        version += 'ie-11';
                    } else {
                        version = 'no-ie ';
                    }
                    if (!!window.opera) {
                        this.browsers.opera = true;
                        version += 'opera';
                    } else if (typeof document.mozCancelFullScreen !== "undefined") {
                        this.browsers.firefox = true;
                        version += 'firefox';
                    } else if ((!!window.chrome)){
                        this.browsers.webkit = true;
                        version += 'webkit';
                    }
                }

                this.html.className = version + touchDevice + (this.options.transitionEnabled ? ' eas-animation' : '');
            }
        },
        test : function(testInstruction, successCallback, failedCallback) {
            if ((testInstruction)) {
                successCallback();
            } else {
                failedCallback();
            }
        },
        feature : function(feature, callback){
            this[feature] = callback();
        },
        _load : function (url, options) {
            var self = this;
            return new Promise(function(resolve, reject) {
                options = options || {};
                options.type = (typeof options.type != 'undefined') ? options.type : (/\.css/.test(url) ? 'css' : 'js');
                options.async = (typeof options.async !== 'undefined' && typeof options.async === 'boolean') ? options.async : false;
                options.nodeType = (options.type === 'css' ? 'link' : 'script');
                options.media = (typeof options.media !== 'undefined') ? options.media : 'all';

                if (typeof url !== 'string') {
                    reject({
                        message : 'incorrect url type (need a string valid ressource url)'
                    });
                    return;
                }
                //create node:
                var node = document.createElement(options.nodeType);
                node.onload = function () {
                    resolve({
                        url: url,
                        options: options,
                        node: node
                    });
                };
                node.onerror = function() {
                    reject({
                        url : url,
                        options: options,
                        node: node
                    })
                };
                switch (options.type) {
                    case 'js':
                        node.src = url;
                        node.type = 'text/javascript';
                        node.async = options.async;
                        break;
                    case 'css':
                        node.href = url;
                        node.rel = 'stylesheet';
                        node.media = options.media;
                        node.type = 'text/css';
                        break;
                    default:
                        node.type = options.type;
                }
                self.headTag.appendChild(node);
            });
        },
        loaded : [],
        load : function(url, options){
            var self = this;
            this.loaded.push(this._load(url, options).then(function(ressource){return ressource}));
            Promise.all(this.loaded).then(function(loaded){
                self.loaded = [];
                return self;
            }).catch(function(error){
                console.log(error);
            });
            return this;
        },
        insertScriptInDom : function(script, dom, callback) {
            var scriptTag = document.createElement('script');
            scriptTag.src = script;
            scriptTag.type = 'text/javascript';
            scriptTag.async = true;
            if (typeof callback != 'undefined') {
                scriptTag.onload = callback;
            }
            dom.appendChild(scriptTag);
        },
        offset : function(elt) {
            var rect = elt.getBoundingClientRect(), bodyElt = document.body;
            return {
                top: rect.top + bodyElt .scrollTop,
                left: rect.left + bodyElt .scrollLeft
            }
        },
        finish : function(callback, event) {
            if (typeof event !== 'undefined') {
                if (event === 'load') {
                    window.onload = function(){
                        callback();
                    }
                } else {
                    this.addEvent(window, 'loadAssetReady', function(){
                        callback();
                    });
                }
            } else {
                this.document.ready(callback);

            }
            return this;
        },
        document : {
            ready : function(callback) {
                if (document.readyState != 'loading'){
                    callback();
                } else if (document.addEventListener) {
                    document.addEventListener('DOMContentLoaded', callback);
                } else {
                    document.attachEvent('onreadystatechange', function() {
                        if (document.readyState != 'loading')
                            callback();
                    });
                }
            }
        },
        scrollTo : function(elt, initialPosition, duration, callback) {
            var offset = {top : 0, left : 0};
            if (typeof duration === 'undefined') {
                duration = 500;
            }
            if (typeof initialPosition === 'undefined') {
                initialPosition = 0;
            }
            if (typeof elt !== 'undefined') {
                if (typeof elt.top !== 'undefined') {
                    offset = elt;
                } else {
                    offset = this.offset(elt);
                }
            }

            this.html.scrollTop = elt.top + initialPosition;
            this.html.scrollLeft = elt.left;

            if (typeof callback !== 'undefined') {
                callback();
            }
            return this;
        },
        events : [],
        addEvent : function(element, event, callback) {
            if (element !== null) {
                if(element.addEventListener){
                    element.addEventListener(event,callback,false);
                }else if(element.attachEvent) {
                    element.attachEvent('on'+event,callback);
                    this.events[event] = this.events[event] || [];
                    if(this.events[event]) this.events[event].push(callback);
                }else{
                    element['on'+event]=callback;
                }
            }
        },
        on : function(element, event, callback) {
            this.addEvent(element, event, callback);
        },
        fireEvent : function(element, eventName){
            var evt, listeners, len;
            if (document.createEvent) {
                evt = document.createEvent('HTMLEvents');
                evt.initEvent(eventName,true,true);
            } else if(document.createEventObject) {// IE < 9
                evt = document.createEventObject();
                evt.eventType = eventName;
            }

            evt.eventName = eventName;
            if (element.dispatchEvent){
                element.dispatchEvent(evt);
            } else if(element.fireEvent) {
                element.fireEvent('on'+evt.eventType,evt);
            } else {
                if(this.events[eventName]){
                    listeners = this.events[eventName];
                    len = listeners.length;
                    while(len--){ listeners[len](this);	}
                }
            }
        },
        trigger : function(element, eventName){
            this.fireEvent(element, eventName);
        },
        /**
         * enabling xmlHttpRequest
         * example :
         EasJs.ajax({
            url : 'test.xml',
            dataType : 'xml',
            type : 'GET',
            cache : false,
            data : {
                'test' : 'test'
            },
            success : function(response){
                //console.log(response);
            },
            fail : function(xhr, status, errorResponse) {
                console.log(xhr, status, errorResponse);
            },
            complete : function() {
                //console.log('ajax finish');
            }
        });
         * @param options
         */
        ajax : function(options) {
            var self = this;
            if (typeof options.url === 'undefined') {
                throw new Error('need url');
            }
            if (typeof options.type === 'undefined') {
                options.type = 'GET';
            }
            if (typeof options.cache === 'undefined' || !options.cache) {
                options.url += '?_=' + new Date().getTime();
                options.cache = false;
            } else {
                options.cache = true;
            }
            if (typeof options.dataType === 'undefined') {
                options.dataType = 'html';
            }
            if (typeof options.data !== 'undefined') {
                //parseData
                var data = '';
                if (typeof options.data === 'object') {

                    for (var prop in options.data) {
                        data += '&' + prop + '=' + options.data[prop];
                    }
                    if (options.cache === true) {
                        console.log(options.cache);
                        data = data.replace(/^&/, '?');
                    }
                }
                if (options.type === 'GET') {
                    options.url += data;
                }
                if (options.type !== 'GET') {
                    options.data = data.replace(/^\?/, '');
                }
            }

            var request = new XMLHttpRequest();
            request.open(options.type, options.url, true);

            switch (options.dataType) {
                case 'xml' :
                    request.setRequestHeader('Content-Type', 'application/xml; charset=UTF-8');
                    break;
                case 'json' :
                    request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
                    break;
                case 'html':
                    request.setRequestHeader('Content-Type', 'text/html; charset=UTF-8');
                    break;
                case 'javascript' :
                    request.setRequestHeader('Content-Type', 'text/javascript; charset=UTF-8');
                    break;
                default :
                    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
                    break;

            }

            request.onreadystatechange = function () {
                if (this.readyState === 4) {
                    var response = this.response;
                    if (this.status === 200 && this.status < 400) {
                        if (typeof options.success === 'function') {
                            switch (options.dataType) {
                                case 'xml' :
                                    response = this.responseXML;
                                    break;
                                case 'json' :
                                    response = self.parseJSON(this.response);
                                    break;
                                case 'javascript' :
                                    var script = document.createElement('script');
                                    script.innerText = this.responseText;
                                    document.getElementsByTagName('head')[0].appendChild(script);
                                    break;
                                case 'html':
                                    var fragment = document.createDocumentFragment(),
                                    html = document.createElement('div');
                                    html.innerHTML = this.response;
                                    response = fragment.appendChild(html);
                                    break;

                            }
                            options.success(response);
                        }
                    } else {
                        //error
                        if (typeof options.fail === 'function') {
                            options.fail(this, this.status, this.response);
                        }
                    }
                    //complete
                    if (typeof options.complete !== 'undefined' && typeof options.complete === 'function') {
                        options.complete()
                    }
                }
            };

            if (typeof options.data === 'undefined' || options.type === 'GET') {
                request.send();
            } else {
                request.send(options.data);
            }

        },
        addClass : function (elt, className) {
            if (this.isArray(elt) || Object.prototype.toString.call(elt) === '[object HTMLCollection]') {
                var i = 0, len = elt.length > 0 ? elt.length : 1;
                for (; i < len; i++) {
                    var element = elt[i];
                    if (element.classList) {
                        element.classList.add(className);
                    } else {
                        element.className += ' ' + className;
                    }
                }
            } else {
                if (elt.classList) {
                    elt.classList.add(className);
                } else {
                    elt.className += ' ' + className;
                }
            }

            return this;
        },
        hasClass : function(el, className) {
            if (this.isArray(elt) || Object.prototype.toString.call(elt) === '[object HTMLCollection]') {
                throw new Error('too many nodes in element')
            } else {
                if (el.classList) {
                    el.classList.contains(className);
                } else {
                    new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
                }
            }
        },
        removeClass : function (elt, className) {
            if (this.isArray(elt) || Object.prototype.toString.call(elt) === '[object HTMLCollection]') {
                var i = 0, len = elt.length;
                for (; i < len; i++) {
                    var element = elt[i];
                    if (element.classList) {
                        element.classList.remove(className);
                    } else {

                        element.className = (element.className).replace(new RegExp('(\s+' + className + ')'), '');
                    }
                }
            } else {
                if (elt.classList) {
                    elt.classList.remove(className);
                } else {
                    elt.className = (elt.className).replace(new RegExp('(\s+' + className + ')'), '');
                }
            }

            return this;
        },
        isArray : function (array){
            return Array.isArray(array) || function(arr) {
                return Object.prototype.toString.call(arr) == '[object Array]';
            }(array);
        },
    /**
     * <img src="" data-original="" class="eas-image"/>
     * @param elt
     */
        lazyLoadImage : function (elt) {
            if (typeof elt !== 'undefined') {
                var self = this;

                var i = 0, len = elt.length, imagesToLoad = [];
                for (;i < len; i++) {
                    var currentElt = elt[i],
                        screenHeight = window.innerHeight,
                        imgPosition = this.offset(currentElt),
                        loaded = false,
                        htmlBodyTop;
                    if ((EasJs.browsers.ie && parseInt(EasJs.browsers.version, 10) <= 8) || scroll === false) {
                        loaded = true;
                        currentElt.onload = function () {
                            this.style.opacity = 1;
                        };
                    } else {
                        htmlBodyTop = this.html.scrollTop + screenHeight;
                        if (imgPosition.top <= htmlBodyTop) {
                            currentElt.src = currentElt.dataset['original'];
                            currentElt.onload = function () {
                                this.style.opacity = 1;
                            };
                        } else{
                            imagesToLoad.push(currentElt);
                        }
                    }
                }
                if (imagesToLoad.length > 0) {
                    this.addEvent(window, 'scroll', function(){
                        if (imagesToLoad.length > 0) {
                            imagesToLoad.forEach(function(image, i){
                                var htmlBodyTop = self.html.scrollTop + screenHeight,
                                imgPosition = self.offset(image).top - (image.height);
                                if (imgPosition <= htmlBodyTop) {
                                    image.src = image.dataset['original'];
                                    image.onload = function () {
                                        imagesToLoad.splice(i, 1);
                                        this.style.opacity = 1;
                                    };
                                }
                            });
                        }
                    });
                }

            } else {

            }
        },
        data : function (elt, key, value) {
            if (typeof elt !== 'undefined') {
                if (typeof value === 'undefined') {
                    return elt.dataset[key];
                } else {
                    elt.dataset[key] = value;
                    return this;
                }
            } else {
                throw new Error('elt not defined');
            }
        },
        parseJSON : function(data, reviser) {
            if (typeof data.trim !== 'undefined') {
                data = data.trim();
            }
            if (window.JSON && window.JSON.parse ) {
                return window.JSON.parse(data, reviser);
            } else {
                throw new Error('JSON.parse no native support');
            }
        },
        stringify : function(value, replacer, space){
            if ( window.JSON && window.JSON.stringify ) {
                return window.JSON.stringify(value, replacer, space);
            } else {
                throw new Error('JSON.stringify no native support');
            }
        },
        applyConfig : function(options){
            this.options = options;
            if (this.options.transitionEnabled) {
                if (!/(eas-animation)/.test(this.html.className)) {
                    this.html.className += ' eas-animation';
                }
            }
            if (typeof this.options.transitionEnabled !== 'undefined' && this.options.transitionEnabled === false) {
                this.html.className = this.html.className.replace('eas-animation', '');
            }
        },
        options : {
            transitionEnabled : true
        }
    };

    if (typeof window.EasJs === 'undefined') {
        window.EasJs = EasJs;
    }
    EasJs.init();
})(window);
