/**
 * EasJs - Javascript library by Jerome DEBRAY http://www.debray-jerome.fr
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
// ECMA-262, Edition 5, 15.4.4.18
// Référence: http://es5.github.io/#x15.4.4.18
if (!Array.prototype.forEach) {
    Array.prototype.forEach = function (callback, thisArg) {
        var T, k;
        if (this == null) {
            throw new TypeError(' this is null or undefined');
        }

        var O = Object(this);
        var len = O.length >>> 0;
        if (typeof callback !== "function") {
            throw new TypeError(callback + ' is not a fonction');
        }
        if (arguments.length > 1) {
            T = thisArg;
        }

        k = 0;
        while (k < len) {
            var kValue;
            if (k in O) {
                kValue = O[k];
                callback.call(T, kValue, k, O);
            }

            k++;
        }
    };
}
(function(window){
    "use strict";

    var EasJs = function (selector){
        return new EasJs.fonction.initSelector(selector);
    };
    EasJs.fonction = EasJs.prototype = {
        selector : [],
        selectorLength : 0,
        tagRegExp : /^([a-zA-Z1-9-_]*(?!\.|#))$/i,
        classNameRegExp : /^(\.[a-zA-Z0-9_-]*)$/i,
        idRegExp : /^(#[a-zA-Z0-9_-]*)$/i,
        makeArray : function(obj){
            var array = [], len = obj.length, i = 0;
            for(; i < len; i++) {
                array[i] = obj[i];
            }
            return array;
        },
        initSelector : function(selector) {
            this.selectorLength = 0;
            if (typeof selector === 'string') {
                if (selector === 'body') {
                    this.selector[0] = document.body;
                    this.selectorLength = 1;
                } else {
                    if (this.idRegExp.test(selector)) {
                        this.selector.push(document.getElementById(selector.substring(1)));
                        this.selectorLength = 1;
                    } else if (this.tagRegExp.test(selector)) {
                        this.selector = document.getElementsByTagName(selector);
                        this.selectorLength = this.selector.length;
                    } else if (this.classNameRegExp.test(selector)) {
                        this.selector = document.getElementsByClassName(selector.substring(1));
                        this.selectorLength = this.selector.length;
                    } else {
                        this.selector = document.querySelectorAll(selector);
                        this.selectorLength = this.selector.length;
                    }
                }
                return this;
            } else {
                if (selector.nodeType) {
                    this.selector[0] = selector;
                    this.selectorLength = 1;
                } else {
                    this.selectorLength = selector.length;
                    this.selector = this.makeArray(selector);
                }
                return this;
            }

        },
        /**
         * Enabling find sub selector of a seletor context
         * @example $$('h1').find('.test');
         * @param selector
         * @returns {EasJs}
         */
        find : function(selector) { //79% better than jQuery
            if (typeof selector === 'string') {

                selector = this.selector.querySelectorAll(selector);
                /*} else {
                 if (this.tagRegExp.exec(selector)){
                 selector = this.selector.getElementsByTagName(selector);
                 }
                 }*/
            }
            if (selector === null) {
                this.selectorLength = 0;
            } else {
                this.selectorLength = selector.length || 0;
            }

            this.selector = selector;

            return this;
        },
        /**
         * return seletor number in the EasJS scope selector
         * @returns {number}
         */
        length : function() {
            return this.selectorLength;
        },
        /**
         * return the offset coord from an element
         * @returns {{top: number, left: number}}
         */
        offset : function() { // 69% better than jQuery - IE8+
            var element = this.selector;
            if (this.selectorLength > 1) {
                element = this.selector[0];
            }
            var rect = element.getBoundingClientRect(), bodyElt = document.body;
            return {
                top: rect.top + bodyElt .scrollTop,
                left: rect.left + bodyElt .scrollLeft
            };
        },
        /**
         * add class to the scoped selectors
         * @param className
         * @returns {EasJs}
         */
        addClass : function (className) { //94% better than jQuery
            var self = this;
            Array.prototype.forEach.call(this.selector, function(item){
                if (!self.hasClass(className, item)) {
                    if (item.classList) {
                        item.classList.add(className);
                    } else {
                        item.className += ' ' + className;
                    }
                }
            });
            return this;
        },
        /**
         * remove className to the scoped selectors
         * @param className
         * @returns {EasJs}
         */
        removeClass : function(className) {
            var self = this;
            Array.prototype.forEach.call(this.selector, function(item){
                if (self.hasClass(className, item)) {
                    if (item.classList) {
                        item.classList.remove(className);
                    } else {
                        item.className = item.className.replace(
                            new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi')
                            , ' '
                        );
                    }
                }
            });
            return this;
        },
        /**
         * return if a className exist for an element
         * @param className
         * @param item
         * @returns {boolean}
         */
        hasClass : function(className, item) { //92% better than jQuery
            var element;
            if (typeof item !== 'undefined') {
                element = item;
            } else {
                element = this.selector;
                if (this.selectorLength > 1) {
                    element = this.selector[0];
                }
            }
            if (element.classList) {
                return element.classList.contains(className);
            } else {
                return new RegExp('(^| )' + className + '( |$)', 'gi').test(element.className);
            }
        },
        /**
         * get or set an attribute from a html element
         * @param attr
         * @param value
         * @returns {string}
         */
        attr : function(attr, value) { // 50% to 60% better than jQuery
            if (typeof value === 'undefined') {
                var element = this.selector;
                if (this.selectorLength > 0) {
                    element = this.selector[0];
                }
                return element.getAttribute(attr);
            } else {
                Array.prototype.forEach.call(this.selector, function(item){
                    item.setAttribute(attr, value);
                });
            }
        },
        /**
         * get or set data attribute from a html element
         * @param key
         * @param value
         * @returns {*}
         */
        data : function (key, value) {
            if (typeof value === 'undefined') {
                var element = this.selector;
                if (this.selectorLength > 0) {
                    element = this.selector[0];
                }
                return element.dataset[key];
            } else {
                Array.prototype.forEach.call(this.selector, function(item){
                    item.dataset[key] = value;
                });
                return this;
            }
        },
        /**
         * append child to a html element
         * @param elts
         * @returns {EasJs}
         */
        append : function(elts) {
            var eltLength = 0, self = this, elt;
            Array.prototype.forEach.call(this.selector, function(item){
                if (typeof elts === 'string') {
                    elt = self.parseHTML(elts);
                    eltLength = elt.length;
                } else {
                    elt[0] = elts;
                }
                while(eltLength > 0) {
                    var element = elt[0];
                    item.appendChild(element);
                    eltLength = elt.length;
                }
            });
            return this;
        },
        /**
         * insert htmlstring to a html element
         * @param htmlString
         * @returns {EasJs}
         */
        before : function(htmlString) { // 75% better than jQuery
            Array.prototype.forEach.call(this.selector, function(item){
                item.insertAdjacentHTML('beforebegin', htmlString);

            });
            return this;
        },
        /**
         * get children from a html element
         * @returns {EasJs}
         */
        children : function() {
            if (this.selectorLength <= 1) {
                var children = [];
                var currentElt = this.selector[0];
                for (var i = currentElt.children.length; i--;) {
                    // Skip comment nodes on IE8
                    if (currentElt.children[i].nodeType != 8) {
                        children.unshift(currentElt.children[i]);
                    }
                }
                this.selector = children;
                this.selectorLength = this.selector.length;
            } else {
                //error message
            }
            return this;
        },
        /**
         * clone html element
         * @returns {*}
         */
        clone : function() { // a revoir
            if (this.selectorLength <= 1) {
                return this.selector[0].cloneNode(true);
            } else {
                //error message
            }
            return this;
        },
        /**
         * return an element which contains his child
         * @param child
         * @returns {boolean|*}
         */
        contains : function(child) {
            if (this.selectorLength <= 1) {
                return (this.selector[0] !== child && this.selector[0].contains(child));
            } else {
                //error message
            }
        },
        /**
         * get or set an css rule for a html element
         * @param key string|object
         * @param value
         * @returns {*}
         */
        css : function (key, value) {
            if (typeof value === 'undefined') {
                if (typeof key === 'object') {
                    Array.prototype.forEach.call(this.selector, function(item){
                        for (var property in key) {
                            item.style[property] = key[property];
                        }
                    });
                    return this;
                } else {
                    var element = this.selector;
                    if (this.selectorLength > 1) {
                        element = this.selector[0];
                    }
                }
                //get
                return getComputedStyle(element)[key];
            } else {
                //set
                Array.prototype.forEach.call(this.selector, function(item){
                    item.style[key] = value;
                });
                return this;
            }
        },
        /**
         * execute a callback for each html element in the EasJS scoped selector (only first element)
         * @param callback
         */
        each : function(callback) {
            if (this.selectorLength > 0) {
                Array.prototype.forEach.call(this.selector, callback);
            }
        },
        /**
         * set each html scoped element innerHTML to empty
         */
        empty : function() {
            Array.prototype.forEach.call(this.selector, function(item){
                item.innerHTML = '';
            });
        },
        /**
         * apply a filter to each html element
         * @param filterFn
         */
        filter : function(filterFn) {
            Array.prototype.filter.call(this.selector, filterFn);
        },
        /**
         * get to a specific index a html element (return javascript element)
         * @param index
         * @returns {*}
         */
        get : function(index) {
            if (typeof index === 'undefined') {
                return this.selector;
            } else {
                return this.selector[index];
            }
        },
        /**
         * set or get innertHTML from a html element
         * @param htmlString
         * @returns {string|*|Object|string|string|string}
         */
        html : function (htmlString) {
            if (typeof htmlString !== 'undefined') {
                Array.prototype.forEach.call(this.selector, function(item){
                    item.innerHTML = htmlString;
                });
                return this;
            } else {
                return this.selector[0].innerHTML;
            }
        },
        /**
         * set or get innerText from a html element
         * @param textString
         * @returns {*}
         */
        text : function(textString) {
            //return
            if (typeof textString !== 'undefined') {
                Array.prototype.forEach.call(this.selector, function(item){
                    //item.innerHTML = htmlString;
                    if (item.innerText) {
                        item.innerText = textString;
                    } else {
                        item.innerContent = textString;
                    }
                });
            } else {
                var element = this.selector[0];
                return element.innerText || element.textContent;
            }
            return this;
        },
        /**
         * get the next element sibling from a html element
         * @returns {EasJs}
         */
        next : function () {
            var element = this.selector[0];
            this.selector = element.nextElementSibling;
            return this;
        },
        /**
         * get the direct parent from a html element
         * @returns {EasJs}
         */
        parent : function() {
            if (this.selector.parentNode) {
                this.selector = this.selector.parentNode;
            }
            return this;
        },
        /**
         * get the current position of a html element
         * @returns {{top: (Number|number), left: (Number|number)}}
         */
        position : function() {
            var element = this.selector[0];
            return {
                top: element.offsetTop,
                left: element.offsetLeft

            };
            return this;
        },
        /**
         * prepend a node to the current EasJs scoped html element
         * @param elts
         */
        prepend : function (elts) { //92% better than jquery
            var eltLength = 0;
            var self = this;
            Array.prototype.forEach.call(this.selector, function(item){
                var elt;
                if (typeof elts === 'string') {
                    elt = self.parseHTML(elts);
                    eltLength = elt.length;
                } else {
                    elt[0] = elts;
                }
                while(eltLength > 0) {
                    var element = elt[eltLength - 1];
                    item.insertBefore(element, item.firstChild);
                    eltLength = elt.length;
                }
            });
            return this;
        },
        /**
         * get the previous element sibling from a html element
         * @returns {EasJs}
         */
        previous : function() {
            var element = this.selector[0];
            this.selector = element.previousElementSibling;
            return this;
        },
        /**
         * remove a html element
         */
        remove : function() {
            Array.prototype.forEach.call(this.selector, function(item){
                item.parentNode.removeChild(item);
            });
            return this;
        },
        /**
         * replace the current EasJs scoped html elements by a html string
         * @param htmlString
         * @returns {EasJs}
         */
        replaceWith : function (htmlString) {
            Array.prototype.forEach.call(this.selector, function(item){
                item.outerHTML = htmlString;
            });
        },
        /**
         * toggle class to the current EasJs scoped html elements
         * @param className
         * @returns {EasJs}
         */
        toggleClass : function(className){
            Array.prototype.forEach.call(this.selector, function(item){
                if (item.classList) {
                    item.classList.toggle(className);
                } else {
                    var classes = item.className.split(' ');
                    var existingIndex = classes.indexOf(className);

                    if (existingIndex >= 0) {
                        classes.splice(existingIndex, 1);
                    } else {
                        classes.push(className);
                    }

                    item.className = classes.join(' ');
                }
            });
            return this;
        },
        /**
         * get body scrollTop
         * @returns {number}
         */
        scrollTop : function() {
            return document.body.scrollTop;
        },
        //Event
        one : function(eventName, callback) {
            var self = this;
            Array.prototype.forEach.call(this.selector, function(item, i){
                self.selector[i].addEventListener(eventName, function(event){
                    (callback)(event);
                    if (typeof callback === 'undefined') {
                        this.removeEventListener(eventName);
                    } else {
                        this.removeEventListener(eventName, callback);
                    }

                });

            });
        },
        on : function(eventName, callback) {
            Array.prototype.forEach.call(this.selector, function(item){
                item.addEventListener(eventName, callback);
            });
        },
        off : function(eventName, callback) {
            Array.prototype.forEach.call(this.selector, function(item){
                if (typeof callback === 'undefined') {
                    item.removeEventListener(eventName);
                } else {
                    item.removeEventListener(eventName, callback);
                }
            });
        },
        trigger : function(eventName) {
            var event = document.createEvent('HTMLEvents');
            event.initEvent(eventName, true, false);
            this.selector.dispatchEvent(event);
        },

        triggerCustom : function(eventName, data) {
            var event;
            if (window.CustomEvent) {
                event = new CustomEvent(eventName, data);
            } else {
                event = document.createEvent('CustomEvent');
                event.initCustomEvent(eventName, true, true, data);
            }

            this.selector.dispatchEvent(event);
        },
        /**
         * create a temporary html document
         * @param htmlString
         * @returns {HTMLElement[]}
         */
        parseHTML : function(htmlString) {
            var temp = document.implementation.createHTMLDocument();
            temp.body.innerHTML = htmlString;
            return temp.body.children;
        }
    };
    /**
     * extend object
     * @param out
     * @returns {*|{}}
     */
    EasJs.extend = function(out) {
        out = out || {};
        for (var i = 1; i < arguments.length; i++) {
            if (!arguments[i]) {
                continue;
            }
            for (var key in arguments[i]) {
                if (arguments[i].hasOwnProperty(key)) {
                    out[key] = arguments[i][key];
                }
            }
        }

        return out;
    };

    EasJs.extend(EasJs,
    {
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
        /**
         * add class in html className
         */
        init : function() {
            this.headTag = document.getElementsByTagName('head')[0];
            //add class for IE
            var touchDevice = ' no-touch', version = 'ie ';
            if(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
                touchDevice = ' touch';
                this.isTouchDevice = true;
            }

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
        },
        /**
         * test an instruction
         * @param testInstruction
         * @param successCallback
         * @param failedCallback
         */
        test : function(testInstruction, successCallback, failedCallback) {
            if ((testInstruction)) {
                successCallback();
            } else {
                failedCallback();
            }
        },
        /**
         * add feature to EasJs
         * @param feature
         * @param callback
         */
        feature : function(feature, callback){
            this[feature] = callback();
        },
        _loadFromIE : function (url, options) {
            if (typeof url !== 'string') {
                throw new Error('incorrect url type (need a string valid ressource url');
            }
            var self = this;
            options = options || {};
            options.type = (typeof options.type != 'undefined') ? options.type : (/\.css/.test(url) ? 'css' : 'js');
            options.async = (typeof options.async !== 'undefined' && typeof options.async === 'boolean') ? options.async : false;
            options.nodeType = (options.type === 'css' ? 'link' : 'script');
            options.media = (typeof options.media !== 'undefined') ? options.media : 'all';
            var node = document.createElement(options.nodeType);
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

            node.onload = function () {
                self.loaded.push(url);
                if (self.loaded.length === self.toload.length) {
                    self.fireEvent(window, 'assetsLoaded');
                }
            };
            node.onerror = function() {
                console.log('fail to load ' + options)
            };
            this.headTag.appendChild(node);
            return this;
        },
        /**
         * return a promise with the load of an url
         * @param url
         * @param options
         * @returns {Promise}
         * @private
         */
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
                    self.loaded.push(url);
                    if (self.loaded.length === self.toload.length) {
                        self.fireEvent(window, 'assetsLoaded');
                    }
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
        /**
         * array of loaded assets or files
         */
        loaded : [],
        toload : [],
        /**
         * load assets/files, ... via Promise
         * @param url
         * @param options
         * @returns {EasJs}
         */
        load : function(url, options){
            var self = this;
            this.toload.push(url);
            if (this.browsers.ie && this.browsers.version <= 11) {
                this._loadFromIE(url, options);
            } else {
                var currentLoad = [];
                currentLoad.push(this._load(url, options).then(function(ressource){return ressource}));
                Promise.all(currentLoad).then(function(){
                }).catch(function(error){
                    console.log(error);
                });
            }
            return this;
        },
        /**
         * execute a callback at a specific event
         * @param callback
         * @param event
         * @returns {EasJs}
         */
        finish : function(callback, event) {

            if (typeof event !== 'undefined') {
                if (event === 'load') {
                    window.onload = function(){
                        callback();
                    }
                } else {
                    this.document.ready(callback);
                }
            } else {
                this.addEvent(window, 'assetsLoaded', function(){
                   callback();
                });


            }
            return this;
        },
        /**
         * insert script into dom, be careful of document.write !
         * @param script
         * @param dom
         * @param callback
         */
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
        /**
         * get offset of a html element
         * @param elt
         * @returns {{top: number, left: number}}
         */
        offset : function(elt) {
            var rect = elt.getBoundingClientRect(), bodyElt = document.body;
            return {
                top: rect.top + bodyElt .scrollTop,
                left: rect.left + bodyElt .scrollLeft
            }
        },

        /**
         * listen the document.ready event in order to trigger a callback
         */
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
        /**
         * scroll to a specific html element
         * @param elt
         * @param initialPosition
         * @param callback
         * @returns {EasJs}
         */
        scrollTo : function(elt, initialPosition, callback) {
            var offset = {top : 0, left : 0};
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

            this.html.scrollTop = offset.top + initialPosition;
            this.html.scrollLeft = offset.left;
            if (typeof callback !== 'undefined') {
                callback();
            }
            return this;
        },
        /**
         * event array for olders browsers
         */
        events : [],
        /**
         * add event listener to an element
         * @param element
         * @param event
         * @param callback
         */
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
        /**
         * add event listener to an element (alias of addEvent)
         * @param element
         * @param event
         * @param callback
         */
        on : function(element, event, callback) {
            this.addEvent(element, event, callback);
        },
        /**
         * trigger an event for a specific element
         * @param element
         * @param eventName
         */
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
        /**
         * trigger an event to an element (alias for fireEvent)
         * @param element
         * @param eventName
         */
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
            if (options.dataType === 'javascript') {
                options.type = 'GET';
            }
            if (typeof options.data !== 'undefined') {
                //parseData
                var data = '';
                if (typeof options.data === 'object') {

                    for (var prop in options.data) {
                        if ((options.data).hasOwnProperty(prop)){
                            data += '&' + prop + '=' + options.data[prop];
                        }
                    }
                    if (options.cache === true) {
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
            if (options.dataType === 'javascript') {
                this.load(options.url, {type:'js'});
                return;
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
        /**
         * return if the array var is currently an array
         * @param array
         * @returns {boolean}
         */
        isArray : function (array){
            return Array.isArray(array) || function(arr) {
                return Object.prototype.toString.call(arr) == '[object Array]';
            }(array);
        },
        /**
         * check if an item is in an array
         * @param item
         * @param array
         * @returns {number}
         */
        inArray : function (item, array) {
            for (var i = 0; i < array.length; i++) {
                if (array[i] === item)
                    return i;
            }
            return -1;
        },
        /**
         * $$.map(array, function(value, index){});
         * @param array
         * @param callback
         */
        map : function (array, callback) {
            if (typeof array.map !== 'undefined') {
                return array.map(callback);
            } else {
                var results = [];
                for (var i = 0; i < array.length; i++)
                    results.push(callback(array[i], i));
                return results;
            }
        },
        /**
         * return the current js timestamp
         * @returns {number}
         */
        now : function () {
            if (Date.now) {
                return Date.now();
            } else {
                return new Date().getTime();
            }
        },
        /**
         * trim a string
         * @param string
         * @returns {string}
         */
        trim : function (string) {
            if (String.prototype.trim) {
                return string.trim();
            }
            return string.replace(/^\s+|\s+$/g, '');

        },
        /**
         * return the type of an object
         * @param obj
         * @returns {string}
         */
        type : function(obj) {
            return Object.prototype.toString.call(obj).replace(/^\[object (.+)\]$/, "$1").toLowerCase();
        },
        /**
         * enabling iteration on an array
         * @param array
         * @param callback
         */
        each : function (array, callback) {
            var  i = 0, len = array.length;
            for (; i < len; i++) {
                callback(array[i], i);
            }
        },
        /**
         * enabling lazyload for image
         * @example <img src="" data-original="" class="eas-image"/>
         * @param elt
         * @param scrollable
         */
        lazyLoadImage : function (elt, scrollable) {
            if (typeof elt !== 'undefined') {
                if (typeof scrollable === 'undefined') {
                    scrollable = true;
                }
                var self = this;

                var i = 0, len = elt.length, imagesToLoad = [];
                for (;i < len; i++) {
                    var currentElt = elt[i],
                        screenHeight = window.innerHeight,
                        imgPosition = this.offset(currentElt),
                        loaded = false,
                        htmlBodyTop;
                    if ((EasJs.browsers.ie && parseInt(EasJs.browsers.version, 10) <= 8) || scrollable === false) {
                        currentElt.src = currentElt.dataset['original'];
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
        /**
         * retrieve and set a data-attribute for an element
         * @param elt
         * @param key
         * @param value
         * @returns {*}
         */
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
        /**
         * parse json string
         * @param data
         * @param reviser
         */
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
        /**
         * stringify a json object
         * @param value
         * @param replacer
         * @param space
         */
        stringify : function(value, replacer, space){
            if ( window.JSON && window.JSON.stringify ) {
                return window.JSON.stringify(value, replacer, space);
            } else {
                throw new Error('JSON.stringify no native support');
            }
        },
        /**
         * apply config to EasJs
         * @param options
         */
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
    });

    EasJs.fonction.initSelector.prototype = EasJs.fonction;

    if (typeof window.EasJs === 'undefined') {
        window.EasJs = EasJs;
    }
    if (typeof window.$$ === 'undefined') {
        window.$$ = EasJs;
    }
    EasJs.init();
})(window);
