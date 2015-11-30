/**
 
 @Name : jeQuery轻量、小巧的js框架
 @Author: chne guojun
 @Date: 2015-11-20
 @QQ群：516754269
 @Site：https://github.com/singod/jeQuery
 
 */
(function(window) {
    var jeQuery = window.Je = function(selector, context) {
        return new Querys(selector, context);
    };
    if (window.Je === undefined) {
        window.Je = jeQuery = Je;
    }
    var class2type = {}, emptyArray = [], document = window.document, root = this, slice = emptyArray.slice, cssWidth = [ "Left", "Right" ], cssHeight = [ "Top", "Bottom" ];
    Querys = function(selector, context) {
        var queryfind = function() {
            var snack = /(?:[\*\w\-\\.#]+)+(?:\[(?:[\w\-_][^=]+)=(?:[\'\[\]\w\-_]+)\])*|\*|>/gi, exprClassName = /^(?:[\w\-_]+)?\.([\w\-_]+)/, exprId = /^(?:[\w\-_]+)?#([\w\-_]+)/, exprNodeName = /^([\w\*\-_]+)/, na = [ null, null, null ];
            var exprAttr = /\[([\w\-_][^=]+)=([\'\[\]\w\-_]+)\]/;
            var exprAttrArr = /\[([\w\-_][^=]+)=(([\w\-_]+)\{([\w\-_]+)\})\]/;
            function _find(selector, context) {
                context = context || document;
                var simple = /^[\w\-_#]+$/.test(selector);
                if (!simple && context.querySelectorAll) {
                    return realArray(context.querySelectorAll(selector));
                }
                if (selector.indexOf(",") > -1) {
                    var split = selector.split(/,/g), ret = [], sIndex = 0, len = split.length;
                    for (;sIndex < len; ++sIndex) {
                        ret = ret.concat(_find(split[sIndex], context));
                    }
                    return unique(ret);
                }
                var parts = selector.match(snack), part = parts.pop(), id = (part.match(exprId) || na)[1], className = !id && (part.match(exprClassName) || na)[1], nodeName = !id && (part.match(exprNodeName) || na)[1], collection;
                var attrs = selector.match(/\[(?:[\w\-_][^=]+)=(?:[\'\[\]\w\-_]+)\]/g);
                if (className && !attrs && !nodeName && context.getElementsByClassName) {
                    collection = realArray(context.getElementsByClassName(className));
                } else {
                    collection = !id && realArray(context.getElementsByTagName(nodeName || "*"));
                    if (className) {
                        collection = filterByAttr(collection, "className", RegExp("(^|\\s)" + className + "(\\s|$)"));
                    }
                    if (id) {
                        var byId = context.getElementById(id);
                        return byId ? [ byId ] :[];
                    }
                    if (attrs) {
                        for (var x = 0; x < attrs.length; x++) {
                            var atNode = (attrs[x].match(exprAttr) || na)[1];
                            var atValue = (attrs[x].match(exprAttr) || na)[2];
                            atValue = atValue.replace(/\'/g, "").replace(/\-/g, "\\-").replace(/\[/g, "\\[").replace(/\]/g, "\\]");
                            collection = filterByAttr(collection, atNode, RegExp("(^" + atValue + "$)"));
                        }
                    }
                }
                return parts[0] && collection[0] ? filterParents(parts, collection) :collection;
            }
            function realArray(c) {
                try {
                    return Array.prototype.slice.call(c);
                } catch (e) {
                    var ret = [], i = 0, len = c.length;
                    for (;i < len; ++i) {
                        ret[i] = c[i];
                    }
                    return ret;
                }
            }
            function filterParents(selectorParts, collection, direct) {
                var parentSelector = selectorParts.pop();
                if (parentSelector === ">") {
                    return filterParents(selectorParts, collection, true);
                }
                var ret = [], r = -1, id = (parentSelector.match(exprId) || na)[1], className = !id && (parentSelector.match(exprClassName) || na)[1], nodeName = !id && (parentSelector.match(exprNodeName) || na)[1], cIndex = -1, node, parent, matches;
                nodeName = nodeName && nodeName.toLowerCase();
                while (node = collection[++cIndex]) {
                    parent = node.parentNode;
                    do {
                        matches = !nodeName || nodeName === "*" || nodeName === parent.nodeName.toLowerCase();
                        matches = matches && (!id || parent.id === id);
                        matches = matches && (!className || RegExp("(^|\\s)" + className + "(\\s|$)").test(parent.className));
                        if (direct || matches) {
                            break;
                        }
                    } while (parent = parent.parentNode);
                    if (matches) {
                        ret[++r] = node;
                    }
                }
                return selectorParts[0] && ret[0] ? filterParents(selectorParts, ret) :ret;
            }
            var unique = function() {
                var uid = +new Date();
                var data = function() {
                    var n = 1;
                    return function(elem) {
                        var cacheIndex = elem[uid], nextCacheIndex = n++;
                        if (!cacheIndex) {
                            elem[uid] = nextCacheIndex;
                            return true;
                        }
                        return false;
                    };
                }();
                return function(arr) {
                    var length = arr.length, ret = [], r = -1, i = 0, item;
                    for (;i < length; ++i) {
                        item = arr[i];
                        if (data(item)) {
                            ret[++r] = item;
                        }
                    }
                    uid += 1;
                    return ret;
                };
            }();
            function filterByAttr(collection, attr, regex) {
                var i = -1, node, r = -1, ret = [];
                while (node = collection[++i]) {
                    if (regex.test(node.getAttribute(attr))) {
                        ret[++r] = node;
                    }
                }
                return ret;
            }
            return _find;
        }();
        this.elements = typeof selector == "string" ? queryfind(selector, context) :[ selector ];
    };
    jeQuery.each = function(arr, fn) {
        for (var i = 0; i < arr.length; i++) {
            if (fn(i, arr[i]) === false) break;
        }
    };
    jeQuery.extend = function() {
        var _extend = function me(dest, source) {
            for (var name in dest) {
                if (dest.hasOwnProperty(name)) {
                    //当前属性是否为对象,如果为对象，则进行递归
                    if (dest[name] instanceof Object && source[name] instanceof Object) {
                        me(dest[name], source[name]);
                    }
                    //检测该属性是否存在
                    if (source.hasOwnProperty(name)) {
                        continue;
                    } else {
                        source[name] = dest[name];
                    }
                }
            }
        };
        var _result = {}, arr = arguments;
        //遍历属性，至后向前
        if (!arr.length) return {};
        for (var i = arr.length - 1; i >= 0; i--) {
            _extend(arr[i], _result);
        }
        arr[0] = _result;
        return _result;
    };
    jeQuery.fn = Querys.prototype = {
        constructor:jeQuery,
        size:function() {
            return this.elements.length;
        },
        trim:function(str) {
            return str.replace(/^\s+|\s+$/g, "");
        },
        eq:function(num) {
            var eles = this.elements[num];
            this.elements = [];
            this.elements[0] = eles;
            return this;
        },
        last:function() {
            return this.elements[this.elements.length - 1];
        },
        each:function(callback) {
            var size = this.size(), ele = this.elements;
            for (var i = 0; i < size; i++) {
                if (callback.call(ele[i], i, size)) break;
            }
            return this;
        },
        css:function(key, value) {
            if (typeof key === "string" && typeof value == "string") {
                this.each(function() {
                    this.style[key] = value;
                });
            } else if (typeof key == "string") {
                if (this.size() == 0) return null;
                var ele = this.elements[0], JeS = function() {
                    var def = document.defaultView;
                    return new Function("el", "style", [ "style.indexOf('-')>-1 && (style=style.replace(/-(\\w)/g,function(m,a){return a.toUpperCase()}));", "style=='float' && (style='", def ? "cssFloat" :"styleFloat", "');return el.style[style] || ", def ? "window.getComputedStyle(el, null)[style]" :"el.currentStyle[style]", " || null;" ].join(""));
                }();
                return JeS(ele, key);
            } else {
                this.each(function() {
                    for (var x in key) {
                        this.style[x] = key[x];
                    }
                });
            }
            return this;
        },
        index:function() {
            var children = this.elements[0].parentNode.children;
            for (var i = 0; i < children.length; i++) {
                if (this.elements[0] == children[i]) return i;
            }
        },
        //hide 方法
        hide:function() {
            this.css("display", "none");
            return this;
        },
        //show方法
        show:function() {
            this.css("display", "block");
            return this;
        },
        html:function(value) {
            for (var i = 0; i < this.elements.length; i++) {
                if (typeof value != "undefined" || value !== undefined && this.elements[i].nodeType === 1) {
                    this.elements[i].innerHTML = value;
                } else {
                    return this.elements[i].innerHTML;
                }
            }
            return this;
        },
        text:function(value) {
            for (var i = 0; i < this.elements.length; i++) {
                if (value !== undefined && this.elements[i].nodeType === 1) {
                    document.all ? this.elements[i].innerText = value :this.elements[i].textContent = value;
                } else {
                    return document.all ? this.elements[i].innerText :this.elements[i].textContent;
                }
            }
            return this;
        },
        val:function(value) {
            for (var i = 0; i < this.elements.length; i++) {
                if (value !== undefined && this.elements[i].nodeType === 1) {
                    this.elements[i].value = value;
                } else {
                    return this.elements[i].value;
                }
            }
            return this;
        },
        //获取节点attr属性
        attr:function(name, value) {
            var result, k;
            return typeof name == "string" && !(1 in arguments) ? !this.size() || this.elements[0].nodeType !== 1 ? undefined :!(result = this.elements[0].getAttribute(name)) && name in this.elements[0] ? this.elements[0][name] :result :this.each(function(n) {
                if (typeof name == "object") for (k in name) this.setAttribute(k, name[k]); else this.setAttribute(name, value);
            });
        },
        //删除节点attr属性
        removeAttr:function(name) {
            return this.each(function() {
                1 === this.nodeType && this.removeAttribute(name);
            });
        },
        find:function(selector) {
            var context = this.elements[0];
            return jeQuery(selector, context);
        },
        //阻止事件默认行为
        stopPropagation:function(event) {
            event = event || window.event;
            event.stopPropagation ? event.stopPropagation() :event.cancelBubble = true;
            return this;
        },
        //hover事件
        hover:function(fnOver, fnOut) {
            for (var i = 0; i < this.elements.length; i++) {
                addEvent(this.elements[i], "mouseover", fnOver);
                addEvent(this.elements[i], "mouseout", fnOut);
            }
            return this;
        },
        //on事件
        on:function(type, callback) {
            this.each(function() {
                addEvent(this, type, callback);
            });
            return this;
        },
        //移除事件
        removeon:function(type, callback) {
            this.each(function() {
                if (this.removeEventListener) {
                    this.removeEventListener(type, callback, false);
                } else if (this.detachEvent) {
                    this.detachEvent("on" + type, callback);
                } else {
                    this["on" + type] = null;
                }
            });
            return this;
        },
        //查询样式是否存在
        hasClass:function(cls) {
            for (var i = 0; i < this.elements.length; i++) {
                return this.elements[i].className.match(new RegExp("(\\s|^)" + cls + "(\\s|$)"));
            }
        },
        //添加样式
        addClass:function(cls) {
            var that = this;
            this.each(function() {
                that.hasClass(cls) || (this.className += " " + cls);
                this.className = this.className.replace(/^\s|\s$/g, "").replace(/\s+/g, " ");
            });
            return this;
        },
        offset:function() {
            if (this.size() == 0) return null;
            var obj = this.elements[0].getBoundingClientRect();
            return {
                left:obj.left + window.pageXOffset,
                top:obj.top + window.pageYOffset,
                width:obj.width,
                height:obj.height
            };
        },
        //删除样式
        removeClass:function(cls) {
            var that = this;
            this.each(function() {
                if (that.hasClass(cls)) {
                    this.className = this.className.replace(new RegExp("(\\s|^)" + cls + "(\\s|$)"), "");
                }
            });
            return this;
        }
    };
    jeQuery.each([ "append", "prepend", "before", "after" ], function(i, name) {
        jeQuery.fn[name] = function(html) {
            var len = this.elements.length, tags = fragmentHtml(html, len);
            for (var s = 0; s < len; s++) {
                var elems = this.elements[s], nodes = tags[s], count = nodes.length, fragment = document.createDocumentFragment();
                for (var n = 0; n < count; n++) {
                    fragment.appendChild(nodes[n]);
                }
                switch (name) {
                  case "append": elems.appendChild(fragment);  break;
                  case "prepend":  elems.insertBefore(fragment, elems.firstChild); break;
                  case "before":  elems.parentNode.insertBefore(fragment, elems); break;
                  case "after":  elems.parentNode.insertBefore(fragment, elems.nextSibling); break;
                }
            }
        };
    });
    jeQuery.each([ "width", "height" ], function(i, name) {
        jeQuery.fn[name] = function(value) {
            for (var s = 0; s < this.elements.length; s++) {
                if (value == undefined) {
                    return getWH(this.elements[s], name);
                } else {
                    this.css(name, value);
                }
            }
        };
    });
    //跨浏览器添加事件绑定
    function addEvent(obj, type, fn) {
        var UID = 1;
        if (typeof obj.addEventListener != "undefined") {
            obj.addEventListener(type, fn, false);
        } else {
            //创建一个存放事件的哈希表(散列表)
            if (!obj.events) obj.events = {};
            //第一次执行时执行
            if (!obj.events[type]) {
                //创建一个存放事件处理函数的数组
                obj.events[type] = [];
                //把第一次的事件处理函数先储存到第一个位置上
                if (obj["on" + type]) obj.events[type][0] = fn;
            } else {
                //同一个注册函数进行屏蔽，不添加到计数器中
                if (addEvent.equal(obj.events[type], fn)) return false;
            }
            //从第二次开始我们用事件计数器来存储
            obj.events[type][UID++] = fn;
            //执行事件处理函数
            obj["on" + type] = addEvent.exec;
        }
    }
    addEvent.fixEvent=function(event) {
        if (event.target) return event;
        var event2 = {
            target:event.srcElement || document,
            preventDefault:function() {
                event.returnValue = false;
            },
            stopPropagation:function() {
                event.cancelBubble = true;
            }
        };
        // IE6/7/8 在原生window.event对象写入数据会导致内存无法回收，应当采用拷贝
        for (var i in event) event2[i] = event[i];
        return event2;
    }
    //执行事件处理函数
    addEvent.exec = function(event) {
        var e = event || addEvent.fixEvent(window.event);
        var es = this.events[e.type];
        for (var i in es)  es[i].call(this, e);
    };
    //同一个注册函数进行屏蔽
    addEvent.equal = function(es, fn) {
        for (var i in es) {
            if (es[i] == fn) return true;
        }
        return false;
    };
    function getWH(el, name, extra) {
        var val = name === "width" ? el.offsetWidth :el.offsetHeight, which = name === "width" ? cssWidth :cssHeight;
        if (val > 0) {
            if (extra !== "border") {
                jeQuery.each(which, function(k) {
                    if (!extra) val -= parseFloat(jeQuery(el).css("padding" + k)) || 0;
                    if (extra === "margin") val += parseFloat(jeQuery(el).css(extra + k)) || 0; else val -= parseFloat(jeQuery(el).css("border" + k + "Width")) || 0;
                });
            }
            return val;
        }
        return 0;
    }
    function fragmentHtml(htmlStr, len) {
        var htmlsArr = [];
        for (var i = 0; i < len; i++) {
            var tempDiv = document.createElement("div");
            tempDiv.innerHTML = htmlStr;
            var num = tempDiv.childNodes.length, tempArr = [];
            for (var k = 0; k < num; k++) {
                tempArr.push(tempDiv.childNodes[k]);
            }
            htmlsArr.push(tempArr);
        }
        return htmlsArr;
    }
})(window);
