/**
* Je Javascript Class Library
* @Author  chen guojun
* @Contact https://github.com/singod/jeQuery
* @Version 1.0.0
*/
if (document.all && window.external) {
    Array.prototype.filter = function(fun) {
        "use strict";
        if (void 0 === this || null === this) throw new TypeError();
        var t = Object(this), len = t.length >>> 0;
        if ("function" != typeof fun) throw new TypeError();
        for (var res = [], thisArg = arguments.length >= 2 ? arguments[1] :void 0, i = 0; len > i; i++) if (i in t) {
            var val = t[i];
            fun.call(thisArg, val, i, t) && res.push(val);
        }
        return res;
    };
    Array.prototype.indexOf = function(obj) {
        for (var i = 0; i < this.length; i++) if (this[i] == obj) return i;
        return -1;
    };
}

(function(window, undefined) {
    var rootJe, document = window.document, docElem = document.documentElement, location = window.location, navigator = window.navigator, _Je = window.Je, _$ = window.$, core_push = Array.prototype.push, core_slice = Array.prototype.slice, core_indexOf = Array.prototype.indexOf, core_toString = Object.prototype.toString, core_hasOwn = Object.prototype.hasOwnProperty, core_trim = String.prototype.trim, core_pnum = /[\-+]?(?:\d*\.|)\d+(?:[eE][\-+]?\d+|)/.source, core_rnotwhite = /\S/, core_rspace = /\s+/, rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, rMultiSelector = /^(?:([\w-#\.]+)([\s]?)([\w-#\.\s>]*))$/, class2type = {};
    var rValidchars = /^[\],:{}\s]*$/, rValidbraces = /(?:^|:|,)(?:\s*\[)+/g, rValidescape = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g, rValidtokens = /"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g;
    //选择器 (tag), (#id), (.className) ,(tag > .className) ,(tag > tag) ,(#id > tag.className) ,(.className tag) ,(tag, tag, #id) ,(tag#id.className) ,(span > * > b) ,(input[name=radio])
    var querySelector = function() {
        var snack = /(?:[\*\w\-\\.#]+)+(?:\[(?:[\w\-_][^=]+)=(?:[\'\[\]\w\-_]+)\])*|\*|>/gi, exprClassName = /^(?:[\w\-_]+)?\.([\w\-_]+)/, exprId = /^(?:[\w\-_]+)?#([\w\-_]+)/, exprNodeName = /^([\w\*\-_]+)/, na = [ null, null, null ];
        var exprAttr = /\[([\w\-_][^=]+)=([\'\[\]\w\-_]+)\]/;
        var exprAttrArr = /\[([\w\-_][^=]+)=(([\w\-_]+)\{([\w\-_]+)\})\]/;
        function retSelector(selector, context) {
            context = context || document;
            var simple = /^[\w\-_#]+$/.test(selector);
            if (!simple && context.querySelectorAll) return realArray(context.querySelectorAll(selector));
            if (selector.indexOf(",") > -1) {
                var split = selector.split(/,/g), ret = [], sIndex = 0, len = split.length;
                for (;sIndex < len; ++sIndex) {
                    ret = ret.concat(retSelector(split[sIndex], context));
                }
                return unique(ret);
            }
            var parts = selector.match(snack), part = parts.pop(), id = (part.match(exprId) || na)[1], className = !id && (part.match(exprClassName) || na)[1], nodeName = !id && (part.match(exprNodeName) || na)[1], collection;
            var attrs = selector.match(/\[(?:[\w\-_][^=]+)=(?:[\'\[\]\w\-_]+)\]/g);
            if (className && !attrs && !nodeName && context.getElementsByClassName) {
                collection = realArray(context.getElementsByClassName(className));
            } else {
                collection = !id && realArray(context.getElementsByTagName(nodeName || "*"));
                if (className) collection = filterByAttr(collection, "className", RegExp("(^|\\s)" + className + "(\\s|$)"));
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
                if (matches) ret[++r] = node;
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
                    if (data(item)) ret[++r] = item;
                }
                uid += 1;
                return ret;
            };
        }();
        function filterByAttr(collection, attr, regex) {
            var i = -1, node, r = -1, ret = [];
            while (node = collection[++i]) {
                if (regex.test(node.getAttribute(attr))) ret[++r] = node;
            }
            return ret;
        }
        return retSelector;
    }();
    var Je = function(selector, context) {
        return new Je.fn.init(selector, context);
    };
    Je.fn = Je.prototype = {
        init:function(selector, context) {
            context = context || document;
            this.length = 0;
            if (!selector) {
                return this;
            } else if (selector.nodeType) {
                this.context = this[0] = selector;
                this.length = 1;
                return this;
            } else if (selector === 'body' && !context && document.body) {
				this[0] = document.body;
				this.length = 1;
				return this;
            } else if (selector === window) {
                this[this.length++] = selector;
                return this;
            } else if (typeof selector === "string") {
                if (context && context.nodeType === 1) {
                    this.context = context;
                } else {
                    context = document;
                }
                //如果是html
                if (selector.charAt(0) === '<' && selector.charAt(selector.length - 1) === '>' && selector.length >= 3) {
                    var tmpEl = document.createElement("div");
                    tmpEl.innerHTML = selector;
                    //不用children,须保留文本节点
                    return Je(this).pushStack(tmpEl.childNodes);
                } else {
                    var selSize = querySelector(selector, context), rets = [];
                    for (var i = 0; i < selSize.length; i++) {
                        rets.push(selSize[i]);
                    }
                    // 父集为多个节点时需要排重
                    if (selSize.length > 1 && rets[1]) rets = Je.uniq(rets);
                    return Je(this).pushStack(rets);
                }
            } else if (Je.isFunction(selector)) {
                return rootJe.ready(selector);
            }
            return Je.makeArray(selector, this);
        },
        constructor:Je,
        selector:"",
        version:"1.0.0",
        length:0,
        size:function() {
            return this.length;
        },
        toArray:function() {
            return core_slice.call(this);
        },
        get:function(num) {
            return num == null ? this.toArray() :num < 0 ? this[this.length + num] :this[num];
        },
        pushStack:function(elems) {
            var obj = Je(), i = 0, len = elems.length;
            for (;i < len; i++) {
                obj[i] = elems[i];
            }
            obj.length = len;
            return obj;
        },
        each:function(callback) {
            return Je.each(this, callback);
        },
        eq:function(i) {
            i = +i;
            return i === -1 ? this.slice(i) :this.slice(i, i + 1);
        },
        find:function(selector) {
            var match, i = 0, obj, len = this.length, rets = [];
            match = rMultiSelector.exec(selector);
            if (match && match[1]) {
                for (;i < len; i++) rets = Je.merge(rets, querySelector(match[1], this[i]));
            }
            // 父集为多个节点时需要排重
            if (len > 1 && rets[1]) rets = Je.uniq(rets);
            obj = this.pushStack(rets);
            // 还有后代节点继续遍历
            if (obj.length > 0 && match[2] && match[3]) {
                return obj.find(match[3]);
            }
            return obj;
        },
        first:function() {
            return this.eq(0);
        },
        last:function() {
            return this.eq(-1);
        },
        end:function() {
            return this.prevObject || this.constructor(null);
        },
        map:function(callback) {
            return this.pushStack(Je.map(this, function(elem, i) {
                return callback.call(elem, i, elem);
            }));
        },
		is: function(selector) {
			var POS = /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/;
		    return !!selector && ( typeof selector === "string" ?
				POS.test( selector ) ? Je( selector, this.context ).index( this[0] ) >= 0 : Je.filter( selector, this ).length > 0 :
				this.pushStack( selector ).length > 0 );
	    },
        // 删除节点
        remove:function() {
            var len = this.length;
            var removes = function(elem) {
                var parent = elem.parentNode;
                if (parent && parent.nodeType !== 11) parent.removeChild(elem);
            };
            return this.each(function() {
                removes(this);
            });
        },
        slice:function() {
            return this.pushStack(core_slice.apply(this, arguments));
        },
        push:core_push,
        sort:[].sort,
        splice:[].splice
    };
    Je.fn.init.prototype = Je.fn;
    Je.extend = Je.fn.extend = function() {
        var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {}, i = 1, length = arguments.length, deep = false;
        if (typeof target === "boolean") {
            deep = target;
            target = arguments[1] || {};
            i = 2;
        }
        if (typeof target !== "object" && !Je.isFunction(target)) target = {};
        if (length === i) {
            target = this;
            --i;
        }
        for (;i < length; i++) {
            if ((options = arguments[i]) != null) {
                for (name in options) {
                    src = target[name];
                    copy = options[name];
                    if (target === copy) {
                        continue;
                    }
                    if (deep && copy && (Je.isPlainObject(copy) || (copyIsArray = Je.isArray(copy)))) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && Je.isArray(src) ? src :[];
                        } else {
                            clone = src && Je.isPlainObject(src) ? src :{};
                        }
                        target[name] = Je.extend(deep, clone, copy);
                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }
        return target;
    };
    Je.extend({
        noConflict:function(deep) {
            if (window.$ === Je) window.$ = _$;
            if (deep && window.Je === Je) window.Je = _Je;
            return Je;
        },
        guid:1,
        cache:{},
        expando:"je" + Math.random().toString(36).substr(2),
        // 获取数据索引
        getCacheIndex:function(elem, isSet) {
            var id = Je.expando;
            if (elem.nodeType === 1) {
                return elem[id] || !isSet ? elem[id] :elem[id] = ++Je.guid;
            }
            return elem.nodeType === 9 ? 1 :0;
        },
        type:function(obj) {
            return obj == null ? String(obj) :class2type[core_toString.call(obj)] || "object";
        },
        isObject:function(obj) {
            return Je.type(obj) === "object";
        },
        isString:function(obj) {
            return Je.type(obj) === "string";
        },
        isNumber:function(obj) {
            return Je.type(obj) === "number";
        },
        isFunction:function(obj) {
            return Je.type(obj) === "function";
        },
        isArray:Array.isArray || function(obj) {
            return Je.type(obj) === "array";
        },
        isWindow:function(obj) {
            return obj != null && obj == obj.window;
        },
        isNumeric:function(obj) {
            return !isNaN(parseFloat(obj)) && isFinite(obj);
        },
        isEmptyObject:function(obj) {
            var i;
            for (i in obj) {
                return false;
            }
            return true;
        },
        isPlainObject:function(obj) {
            if (!obj || Je.type(obj) !== "object" || obj.nodeType || Je.isWindow(obj)) return false;
            try {
                if (obj.constructor && !core_hasOwn.call(obj, "constructor") && !core_hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) return false;
            } catch (e) {
                return false;
            }
            var key;
            for (key in obj) {}
            return key === undefined || core_hasOwn.call(obj, key);
        },
        each:function(obj, callback) {
            var name, i = 0, length = obj.length, isObj = length === undefined || Je.isFunction(obj);
			if (isObj) {
				for (name in obj) {
					if (callback.call(obj[name], name, obj[name]) === false) break;
				}
			} else {
				for (;i < length; ) {
					if (callback.call(obj[i], i, obj[i++]) === false) break;
				}
			}
            return obj;
        },
        trim:function(text) {
            return text.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
        },
        create:function() {
            var arg = arguments, obj = document.createElement(arg[0]), arr = arg[1];
            if (arr != undefined) {
                arr = arr || {};
                for (var k in arr) {
                    if (/A-Za-z]/.test(k)) {
                        obj[k] = arr[k];
                    } else {
                        Je(obj).attr(k, arr[k]);
                    }
                }
            }
            return obj;
        },
        // 读取/缓存数据操作
        readData:function(elem, type, name, value, overwrite) {
            var cache = Je.cache, isRead = typeof value === "undefined" ? true :false, index = Je.getCacheIndex(elem, !isRead);
            if (isRead) {
                return index && cache[index] && cache[index][type] && cache[index][type][name] || undefined;
            }
            cache = cache[index] = cache[index] || {};
            if (!cache[type]) cache[type] = {};
            if (overwrite || typeof cache[type][name] === "undefined") cache[type][name] = value;
            return cache[type][name];
        },
        // 删除数据操作
        removeData:function(elem, type, name) {
            var data, cache = Je.cache, index = Je.getCacheIndex(elem);
            if (index && (data = cache[index])) {
                if (data[type]) {
                    name ? delete data[type][name] :delete data[type];
                }
                if (Je.isEmptyObject(data[type])) delete data[type];
            }
        },
        // 过滤选择器
        filter:function(selector, elems) {
            var rQuickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/, rTagClass = /^(?:(\w*)\.([\w-]+))$/;
            var match = rQuickExpr.exec(selector), m, tag, i = 0, len = elems.length, rets = [];
            if (match) {
                // $("#id")
                if (m = match[1]) {
                    for (;i < len; i++) {
                        if (elems[i].id == m) {
                            rets[0] = elems[i];
                            break;
                        }
                    }
                } else if (m = match[2]) {
                    for (;i < len; i++) {
                        if (elems[i].tagName == m.toUpperCase()) rets.push(elems[i]);
                    }
                } else if (m = match[3]) {
                    for (;i < len; i++) {
                        if (Je(elems[i]).hasClass(m)) rets.push(elems[i]);
                    }
                }
            } else {
                // $("tag.class")
                match = rTagClass.exec(selector);
                if (match && (tag = match[1]) && (m = match[2])) {
                    for (;i < len; i++) {
                        if (Je(elems[i]).hasClass(m) && elems[i].tagName === tag.toUpperCase()) rets.push(elems[i]);
                    }
                    return rets;
                }
            }
            return rets;
        },
        // 筛选节点
        dir:function(elem, dir, besides, one) {
            var matched = [], cur = elem;
            while (cur && cur.nodeType !== 9) {
                if (cur.nodeType === 1 && cur !== besides) {
                    matched.push(cur);
                    if (one) return matched;
                }
                cur = cur[dir];
            }
            return matched;
        },
        makeArray:function(arr, results) {
            var type, ret = results || [];
            if (arr != null) {
                type = Je.type(arr);
                arr.length == null || type === "string" || type === "function" || type === "regexp" || Je.isWindow(arr) ? core_push.call(ret, arr) :Je.merge(ret, arr);
            }
            return ret;
        },
        inArray:function(elem, arr, i) {
            if (arr) {
                if (core_indexOf) return core_indexOf.call(arr, elem, i);
                var len = arr.length;
                i = i ? i < 0 ? Math.max(0, len + i) :i :0;
                for (;i < len; i++) {
                    if (i in arr && arr[i] === elem) return i;
                }
            }
            return -1;
        },
        // 清除数组中重复的数据
        uniq:function(arr) {
            var rets = [], i = 0, len = arr.length;
            if (Je.isArray(arr)) {
                for (;i < len; i++) {
                    if (Je.inArray(arr[i], rets) === -1) rets.push(arr[i]);
                }
            }
            return rets;
        },
        error:function(msg) {
            throw new Error(msg);
        },
        merge:function(first, second) {
            var sl = second.length, i = first.length, j = 0;
            if (typeof sl === "number") {
                for (;j < sl; j++) {
                    first[i++] = second[j];
                }
            } else {
                while (second[j] !== undefined) {
                    first[i++] = second[j++];
                }
            }
            first.length = i;
            return first;
        },
        map:function(elems, callback, arg) {
            var value, key, ret = [], i = 0, length = elems.length, isArray = elems instanceof Je || length !== undefined && typeof length === "number" && (length > 0 && elems[0] && elems[length - 1] || length === 0 || Je.isArray(elems));
            if (isArray) {
                for (;i < length; i++) {
                    value = callback(elems[i], i, arg);
                    if (value != null) ret[ret.length] = value;
                }
            } else {
                for (key in elems) {
                    value = callback(elems[key], key, arg);
                    if (value != null) ret[ret.length] = value;
                }
            }
            return ret.concat.apply([], ret);
        },
        contains:docElem.contains ? function(a, b) {
            var adown = a.nodeType === 9 ? a.documentElement :a, bup = b && b.parentNode;
            return a === bup || !!(bup && bup.nodeType === 1 && adown.contains && adown.contains(bup));
        } :docElem.compareDocumentPosition ? function(a, b) {
            return b && !!(a.compareDocumentPosition(b) & 16);
        } :function(a, b) {
            while (b = b.parentNode) {
                if (b === a) return true;
            }
            return false;
        }
    });
    Je.extend({
        // 解析json
        parseJSON:function(data) {
            if (window.JSON && window.JSON.parse) {
                return window.JSON.parse(data);
            }
            if (data === null) {
                return data;
            }
            if (typeof data === "string") {
                data = Je.trim(data);
                if (data) {
                    if (rValidchars.test(data.replace(rValidescape, "@").replace(rValidtokens, "]").replace(rValidbraces, ""))) {
                        return new Function("return " + data)();
                    }
                }
            }
            Je.error("Invalid JSON: " + data);
        },
        // 解析字符串为dom节点
        parseNodes:function(data) {
            var wrap = document.createElement("div"), rets = [], cur;
            wrap.innerHTML = data;
            cur = wrap.firstChild;
            while (cur && cur.nodeType !== 9) {
                rets.push(cur);
                cur = cur.nextSibling;
            }
            wrap = null;
            return rets;
        },
        // 返回节点集合
        buildFragment:function(nodes) {
            var frag = document.createDocumentFragment(), i = 0, len = nodes.length;
            for (;i < len; i++) {
                frag.appendChild(nodes[i]);
            }
            return frag;
        }
    });
    Je.each("Boolean Number String Function Array Object".split(" "), function(i, name) {
        class2type["[object " + name + "]"] = name.toLowerCase();
    });
    var rBoolean = /^(?:checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped)$/i, propFix = {
        "for":"htmlFor",
        "class":"className"
    };
    Je.each("tabIndex readOnly maxLength cellSpacing cellPadding rowSpan colSpan useMap frameBorder contentEditable".split(" "), function() {
        propFix[this.toLowerCase()] = this;
    });
    Je.fn.extend({
        // 对应元素读取或写入缓存数据
        readData:function(name, value) {
            if (typeof value === "undefined") {
                return Je.readData(this[0], "readData", name);
            }
            return Je.each(this, function() {
                Je.readData(this, "readData", name, value, true);
            });
        },
        // 对应元素删除缓存数据
        removeData:function(name) {
            return Je.each(this, function() {
                Je.removeData(this, "readData", name);
            });
        },
        hasClass:function(className) {
            var i = 0, len = this.length;
            for (;i < len; i++) {
                var elemnode = this[i].nodeType === 1 && (" " + this[i].className + " ").indexOf(" " + className + " ") >= 0;
                if (elemnode) return true;
            }
            return false;
        },
        // 添加Class
        addClass:function(className) {
            return Je.each(this, function() {
                if (this.nodeType === 1 && !Je(this).hasClass(className)) this.className = Je.trim(this.className + " " + className + " ");
            });
        },
        // 删除Class
        removeClass:function(className) {
            return Je.each(this, function() {
                if (this.nodeType === 1) this.className = Je.trim((" " + this.className + " ").replace(" " + className + " ", " "));
            });
        },
        // 添加删除样式
        toggleClass:function(className, state) {
            return Je.each(this, function() {
                if (typeof state !== "boolean") state = !Je(this).hasClass(className);
                state ? Je(this).addClass(className) :Je(this).removeClass(className);
            });
        },
        detach:function(selector) {
            return this.remove(selector);
        },
        css:function(name, value) {
            if (typeof name == "string" && typeof value == "string") {
                return Je.each(this, function() {
                    (name == "width" || name == "height") && Je.isNumber(value) ? this.style[name] = value + "px" :this.style[name] = value;
                });
            } else if (Je.isString(name) && typeof value === "undefined") {
                if (this.size() == 0) return null;
                var ele = this[0], JeS = function() {
                    var def = document.defaultView;
                    return new Function("el", "style", [ "style.indexOf('-')>-1 && (style=style.replace(/-(\\w)/g,function(m,a){return a.toUpperCase()}));", "style=='float' && (style='", def ? "cssFloat" :"styleFloat", "');return el.style[style] || ", def ? "window.getComputedStyle(el, null)[style]" :"el.currentStyle[style]", " || null;" ].join(""));
                }();
                return JeS(ele, name);
            } else {
                return Je.each(this, function() {
                    for (var x in name) (x == "width" || x == "height") && Je.isNumber(name[x]) ? this.style[x] = name[x] + "px" :this.style[x] = name[x];
                });
            }
        },
        // 显示元素
        show:function(value) {
            return Je.each(this, function() {
                var val = value == undefined ? "block" :value;
                Je(this).css("display", val);
            });
        },
        // 隐藏元素
        hide:function() {
            return Je.each(this, function() {
                Je(this).css("display", "none");
            });
        },
		//获取当前元素的坐标
		position:function(){
			if (this.size() == 0) return null;
			var elem = this[0];
			return { left:elem.offsetLeft, top:elem.offsetTop };
		},
		//获取当前document元素的坐标
        offset:function() {
            if (this.size() == 0) return null;
            var elem = this[0], box = elem.getBoundingClientRect(), doc = elem.ownerDocument, body = doc.body, docElem = doc.documentElement, clientTop = docElem.clientTop || body.clientTop || 0, clientLeft = docElem.clientLeft || body.clientLeft || 0, top = box.top + (self.pageYOffset || docElem.scrollTop) - clientTop, left = box.left + (self.pageXOffset || docElem.scrollLeft) - clientLeft;
            return { left:left,  top:top  };
        },
		//获取与设置，自定义属性
        attr:function(name, value) {
            var ret;
            if (typeof value === "undefined") {
                if (this[0] && this[0].nodeType === 1) {
                    ret = this[0].getAttribute(name);
                }
                // 属性不存在，返回undefined
                return ret == null ? undefined :ret;
            }
            // value设置为null也是删除属性
            if (value === null) return this.removeAttr(name);
            // 判断是否bool属性
            if (rBoolean.test(name)) {
                if (value === false) {
                    return this.removeAttr(name);
                } else {
                    value = name;
                }
            }
            return Je.each(this, function() {
                if (this.nodeType === 1) this.setAttribute(name, value);
            });
        },
        // 删除元素指定Attribute属性
        removeAttr:function(name) {
            return Je.each(this, function() {
                if (this.nodeType === 1) {
                    // 如果是布尔属性，顺便把属性置false
                    if (rBoolean.test(name)) {
                        this[propFix[name] || name] = false;
                    }
                    this.removeAttribute(name);
                }
            });
        },
        data:function(name, value) {
            var attrName = "data-" + name.replace(/([A-Z])/g, "-$1").toLowerCase();
            var data = 1 in arguments ? this.attr(attrName, value) :this.attr(attrName);
            var lizeValue = function(value) {
                try {
                    return value ? value == "true" || (value == "false" ? false :value == "null" ? null :+value + "" == value ? +value :/^[\[\{]/.test(value) ? JSON.parse(value) :value) :value;
                } catch (e) {
                    return value;
                }
            };
            return data !== null ? lizeValue(data) :undefined;
        },
        // 读取或设置元素Property属性处理
        prop:function(name, value) {
            name = propFix[name] || name;
            if (typeof value === "undefined") return this[0][name];
            return Je.each(this, function() {
                this[name] = value;
            });
        },
        // 删除元素指定Property属性
        removeProp:function(name) {
            name = propFix[name] || name;
            return Je.each(this, function() {
                delete this[name];
            });
        },
        // 获取指定子元素
        children:function(selector) {
            var elems, i = 0, len = this.length, rets = [];
            for (;i < len; i++) {
                elems = Je.dir(this[i].firstChild, "nextSibling");
                if (typeof selector === "string") {
                    elems = Je.filter(selector, elems);
                }
                rets = Je.merge(rets, elems);
            }
            // 排重
            rets = Je.uniq(rets);
            return this.pushStack(rets);
        },
        // 获取所有子节点
        contents:function() {
            var elems, i = 0, len = this.length, rets = [];
            for (;i < len; i++) {
                rets = Je.merge(rets, this[i].childNodes);
            }
            // 排重
            rets = Je.uniq(rets);
            return this.pushStack(rets);
        },
        // 读取设置节点内容
        html:function(value) {
            return typeof value === "undefined" ? this[0] && this[0].nodeType === 1 ? this[0].innerHTML :undefined :typeof value !== "undefined" && value == true ? this[0] && this[0].nodeType === 1 ? this[0].outerHTML :undefined :Je.each(this, function() {
                this.innerHTML = value;
            });
        },
        // 读取设置节点文本内容
        text:function(value) {
            var innText = document.all ? "innerText" :"textContent";
            return typeof value === "undefined" ? this[0] && this[0].nodeType === 1 ? this[0][innText] :undefined :Je.each(this, function() {
                this[innText] = value;
            });
        },
        // 读取设置表单元素的值
        val:function(value) {
            if (typeof value === "undefined") {
                return this[0] && this[0].nodeType === 1 && typeof this[0].value !== "undefined" ? this[0].value :undefined;
            }
            // 将value转化为string
            value = value == null ? "" :value + "";
            return Je.each(this, function() {
                if (typeof this.value !== "undefined") {
                    this.value = value;
                }
            });
        },
        empty:function() {
            return this.html("");
        }
    });
    // 判断Dom载完
    var readyList = [], readyBound = false, completed = function(event) {
        if (document.addEventListener || event.type === "load" || document.readyState === "complete") {
            readyDetach();
            Je.ready();
        }
    }, readyDetach = function() {
        if (document.addEventListener) {
            document.removeEventListener("DOMContentLoaded", completed, false);
            window.removeEventListener("load", completed, false);
        } else {
            document.detachEvent("onreadystatechange", completed);
            window.detachEvent("onload", completed);
        }
    }, readyAttach = function() {
        var top = false; readyBound = true;
        if (document.readyState === "complete") {
            return Je.ready();
        } else if (document.addEventListener) {
            document.addEventListener("DOMContentLoaded", completed, false);
            window.addEventListener("load", completed, false);
        } else if (document.attachEvent) {
            document.attachEvent("onreadystatechange", completed);
            window.attachEvent("onload", completed);
            try {
                top = window.frameElement == null && document.documentElement;
            } catch (e) {}
            if (top && top.doScroll) {
                (function doScrollCheck() {
                    if (!Je.isReady) {
                        try {
                            top.doScroll("left");
                        } catch (e) {
                            return setTimeout(doScrollCheck, 50);
                        }
                        readyDetach();
                        Je.ready();
                    }
                })();
            }
        }
    };
    Je.fn.extend({
        ready:function(fn) {
            if (Je.isFunction(fn)) {
                if (Je.isReady) {
                    fn.call(document, Je);
                } else if (readyList) {
                    readyList.push(fn);
                    if (!readyBound) readyAttach();
                }
            }
            return this;
        }
    });
    Je.extend({
        isReady:false,
        ready:function() {
            var i = 0, len = readyList.length;
            if (!Je.isReady) {
                if (!document.body) return setTimeout(Je.ready, 13);
                Je.isReady = true;
                for (;i < len; i++) {
                    readyList[i].call(document, Je);
                }
                readyList = [];
            }
        }
    });
    Je.fn.extend({
        // 获取元素父节点
        parent:function() {
            return this.parents();
        },
        // 获取元素匹配的上级节点
        parents:function(selector) {
            var rets = [], elem, i = 0, len = this.length;
            for (;i < len; i++) {
                elem = this[i];
                while (elem = elem.parentNode) {
                    // 如果selector不为空，不断往上遍历
                    if (elem.nodeType !== 11 && (selector == null || Je.filter(selector, [ elem ]).length)) {
                        rets.push(elem);
                        break;
                    }
                }
            }
            // 清除重复
            rets = Je.uniq(rets);
            return this.pushStack(rets);
        },
        // 返回元素之后第一个兄弟节点
        next:function() {
            return this[0] ? this.pushStack(Je.dir(this[0], "nextSibling", this[0], true)) :Je();
        },
        // 返回元素之后所有兄弟节点
        nextAll:function() {
            return this[0] ? this.pushStack(Je.dir(this[0], "nextSibling", this[0])) :Je();
        },
        // 返回元素之前第一个兄弟节点
        prev:function() {
            return this[0] ? this.pushStack(Je.dir(this[0], "previousSibling", this[0], true)) :Je();
        },
        // 返回元素之前所有兄弟节点
        prevAll:function() {
            return this[0] ? this.pushStack(Je.dir(this[0], "previousSibling", this[0])) :Je();
        },
        // 返回除自身以外所有兄弟节点
        siblings:function() {
            return this[0] ? this.pushStack(Je.dir(this[0].parentNode.firstChild, "nextSibling", this[0])) :Je();
        },
        // 注：没处理ie6的tbody插入问题
        domManip:function(args, callback) {
            var frag, nodes, clone, i = 0, len = this.length;
            if (len === 0) return this;
            if (typeof args[0] === "string") {
                nodes = Je.parseNodes(args[0]);
                frag = Je.buildFragment(nodes);
            } else if (args[0] && args[0].nodeType) {
                frag = nodes = args[0];
            }
            if (frag) {
                for (;i < len; i++) {
                    clone = frag.cloneNode(true);
                    callback.call(this[i], clone);
                }
            }
            frag = clone = null;
            return this;
        },
        // 在元素里面内容的末尾插入内容
        append:function() {
            return this.domManip(arguments, function(elem) {
                this.appendChild(elem);
            });
        },
        // 在元素里面内容的前面插入内容
        prepend:function() {
            return this.domManip(arguments, function(elem) {
                this.insertBefore(elem, this.firstChild);
            });
        },
        // 在元素之前插入内容
        before:function() {
            return this.domManip(arguments, function(elem) {
                if (this.parentNode)  this.parentNode.insertBefore(elem, this);
            });
        },
        // 在元素之后插入内容
        after:function() {
            return this.domManip(arguments, function(elem) {
                if (this.parentNode) this.parentNode.insertBefore(elem, this.nextSibling);
            });
        },
        replaceWith:function(value) {
            return this.before(value).remove();
        },
        wrapAll:function(html) {
            var num = Je.expando, thisHtml = "", retHtml = [];
            this.eq(0).before(html);
            this.each(function() {
                thisHtml = Je(this).html(true);
                retHtml.push(thisHtml);
                Je(this).addClass("wrapall" + num);
            });
            this.eq(0).prev().html(retHtml.join(" "));
            Je(".wrapall" + num).remove();
            return this;
        },
        unwrap:function() {
            return this.parent().each(function() {
                if (!(this.nodeName && this.nodeName.toLowerCase() === "body".toLowerCase())) {
                    Je(this).replaceWith(Je(this).html());
                }
            });
        },
        wrap:function(html) {
            var num = Je.expando;
            this.each(function() {
                var thisHtml = Je(this).html(true);
                Je(this).after(html).addClass("wrap" + num);
                Je(this).next().append(thisHtml);
            });
            Je(".wrap" + num).remove();
            return this;
        }
    });
    Je.each([ "width", "height" ], function(i, name) {
        Je.fn[name] = function(value) {           
			if (value == undefined) {
				return getWidthOrHeight(this, name);
			} else {
				return this.each(function() {
					 Je(this).css(name, typeof value === "number" ? value + "px" :value);
				});
			}          
        };
    });
    // 将样式属性转为驼峰式
    function camelCase(name) {
        return name.replace(/\-(\w)/g, function(all, letter) {
            return letter.toUpperCase();
        });
    }
    // 宽高属性单位auto转化
    function getWidthOrHeight(elem, name) {
        var padding = name === "width" ? [ "left", "right" ] :[ "top", "bottom" ], ret = elem[0][camelCase("offset-" + name)];
        if (ret <= 0 || ret == null) {
            ret = parseFloat(elem[0][camelCase("client-" + name)]) - parseFloat(Je(elem).css("padding-" + padding[0])) - parseFloat(Je(elem).css("padding-" + padding[1]));
        }
        return ret;
    }
	function browserAgent() {
		var ua = window.navigator.userAgent.toLowerCase(),
			match,
			browser = { ie: false, firefox: false, chrome: false,  webkit: false, safari: false,};
			match = /(chrome)[ \/]([\w.]+)/.exec(ua) || /(webkit)[ \/]([\w.]+)/.exec(ua) || /ms(ie)\s([\w.]+)/.exec(ua) || /(firefox)[ \/]([\w.]+)/.exec(ua) || [];
			if ( match[1] )  browser[ match[1] ] = true;
			// 在PC端，webkit浏览器不是Chrome/Chromium就是Safari
			if ( browser.webkit ) browser.safari = true;
			if ( browser.chrome ) browser.webkit = true;
		return browser;
	};
	Je.browser = browserAgent();
    rootJe = Je(document);
    
    // 支持amd和cmd
	"function" === typeof define ? define("Je", [], function () { 
	    return Je; 
	}) : ("object" === typeof module && "object" === typeof module.exports) ?  module.exports = Je : window.Je = window.$ = $ = Je;
})(window);

//各种触发事件
(function(Je) {
    var handlers = {}, _jid = 1;
    /* 绑定事件 start */
    Je.event = {
        add:addEvent,
        remove:removeEvent
    };
    Je.fn.extend({
        on:function(event, selector, data, callback) {
            var self = this;
            if (event && !Je.isString(event)) {
                Je.each(event, function(type, fn) {
                    self.on(type, selector, data, fn);
                });
                return self;
            }
            if (!Je.isString(selector) && !Je.isFunction(callback) && callback !== false) callback = data, 
            data = selector, selector = undefined;
            if (Je.isFunction(data) || data === false) callback = data, data = undefined;
            if (callback === false) callback = function() {
                return false;
            };
            return this.each(function() {
                addEvent(this, event, callback, data, selector);
            });
        },
        off:function(event, selector, callback) {
            var self = this;
            if (event && !Je.isString(event)) {
                Je.each(event, function(type, fn) {
                    self.off(type, selector, fn);
                });
                return self;
            }
            if (!Je.isString(selector) && !Je.isFunction(callback) && callback !== false) callback = selector, 
            selector = undefined;
            if (callback === false) callback = function() {
                return false;
            };
            return self.each(function() {
                removeEvent(this, event, callback, selector);
            });
        },
        bind:function(event, func) {
            return this.each(function() {
                addEvent(this, event, func);
            });
        },
        unbind:function(event, func) {
            return this.each(function() {
                removeEvent(this, event, func);
            });
        },
        hover:function(fnOver, fnOut) {
            return Je.each(this, function() {
                Je(this).on("mouseover", fnOver);
                Je(this).on("mouseout", fnOut);
            });
        },
        delegate:function(selector, event, callback) {
            return this.on(event, selector, callback);
        },
        trigger:function(event, data) {
            var type = event, specialEvents = {};
            specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = "MouseEvents";
            if (typeof type == "string") {
                event = document.createEvent(specialEvents[type] || "Events");
                event.initEvent(type, true, true);
            } else return;
            event._data = data;
            return this.each(function() {
                if ("dispatchEvent" in this) this.dispatchEvent(event);
            });
        }
    });
    function addEvent(element, events, func, data, selector) {
        var self = this, id = jid(element), set = handlers[id] || (handlers[id] = []);
        Je.each(events.split(/\s/), function(i, event) {
            var handler = Je.extend(parse(event), {
                fn:func,
                sel:selector,
                i:set.length
            });
            var proxyfn = handler.proxy = function(e) {
                //处理事件代理
                if (selector) {
                    var $temp = Je(element).find(selector);
                    var res = [].some.call($temp, function(val) {
                        return val === e.target || Je.contains(val, e.target);
                    });
                    //不包含
                    if (!res) {
                        return false;
                    }
                }
                e.data = data;
                var result = func.apply(element, e._data == undefined ? [ e ] :[ e ].concat(e._data));
                if (result === false) e.preventDefault(), e.stopPropagation();
                return result;
            };
            set.push(handler);
            //if (element.addEventListener) element.addEventListener(handler.e, proxyfn, false);
            if (element.addEventListener) {
                element.addEventListener(handler.e, proxyfn, false);
            } else if (element.attachEvent) {
                element.attachEvent("on" + handler.e, proxyfn);
            } else {
                element["on" + handler.e] = proxyfn;
            }
        });
    }
    function removeEvent(element, events, func, selector) {
        Je.each((events || "").split(/\s/), function(i, event) {
            Je.event = parse(event);
            Je.each(findHandlers(element, event, func, selector), function(f, handler) {
                delete handlers[jid(element)][handler.i];
                //if (element.removeEventListener) element.removeEventListener(handler.e, handler.proxy, false);
                if (element.removeEventListener) {
                    element.removeEventListener(handler.e, handler.proxy, false);
                } else if (element.detachEvent) {
                    element.detachEvent("on" + handler.e, handler.proxy);
                } else {
                    element["on" + handler.e] = null;
                }
            });
        });
    }
    function jid(element) {
        return element._jid || (element._jid = _jid++);
    }
    function parse(event) {
        var parts = ("" + event).split(".");
        return {
            e:parts[0],
            ns:parts.slice(1).sort().join(" ")
        };
    }
    function findHandlers(element, event, func, selector) {
        var self = this, id = jid(element);
        event = parse(event);
        return (handlers[jid(element)] || []).filter(function(handler) {
            return handler && (!event.e || handler.e == event.e) && (!func || handler.fn.toString() === func.toString()) && (!selector || handler.sel == selector);
        });
    }
	var addTouchs = (Je.browser.webkit || Je.browser.safari) ? "touchstart touchmove touchend" : "";
    var eventType = ("blur focus focusin focusout load resize scroll unload click dblclick " + "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " + "change select submit keydown keypress keyup error paste drop dragstart dragover " + "beforeunload" + addTouchs).split(" ");
    Je.each(eventType, function(i, event) {
        Je.fn[event] = function(callback) {
            return callback ? this.bind(event, callback) :this.trigger(event);
        };
    });
})(window.Je);

//Ajax数据请求
(function(Je) {
    var document = window.document, key, name, scriptTypeRE = /^(?:text|application)\/javascript/i, xmlTypeRE = /^(?:text|application)\/xml/i, jsonType = "application/json", htmlType = "text/html";
    function noops() {}
    Je.extend({
        ajaxConfig:{
            type:"GET",
            data:"",
            dataType:"json",
            jsonp:"callback",
            async:true,
            contentType:"",
            beforeSend:noops,
            success:noops,
            error:noops,
            complete:noops,
            context:null,
            global:true,
            cache:true,
            crossDomain:false,
            timeout:0,
            accepts:{
                script:"text/javascript, application/javascript",
                json:jsonType,
                xml:"application/xml, text/xml",
                html:htmlType,
                text:"text/plain"
            }
        },
        get:function(url, success) {
            Je.ajax({
                url:url,
                success:success
            });
        },
        post:function(url, data, success, dataType) {
            if (typeof data === "function") dataType = dataType || success, success = data, 
            data = null;
            Je.ajax({
                type:"POST",
                url:url,
                data:data,
                success:success,
                dataType:dataType
            });
        },
        getJSON:function(url, success) {
            Je.ajax({
                url:url,
                success:success,
                dataType:"json"
            });
        },
        ajax:function(options) {
            var jsonpID = 0, timestamp = new Date() * 1, active = 0, typeTouper, opts = typeof options === "object" ? options :{};
            for (i in Je.ajaxConfig) if (typeof opts[i] === "undefined") opts[i] = Je.ajaxConfig[i];
            typeTouper = opts.type.toUpperCase();
            var xhrAjax = {
                xhr:function() {
                    var xmlhttp = null;
                    // 针对不同浏览器建立这个对象的不同方式写不同代码
                    if (window.XMLHttpRequest) {
                        xmlhttp = new XMLHttpRequest();
                        //针对某些特定版本的Mozillar浏览器的BUG进行修正
                        if (xmlhttp.overrideMimeType) xmlhttp.overrideMimeType("text/xml");
                    } else if (window.ActiveXObject) {
                        var activexName = [ "MSXML2.XMLHTTP", "Microsoft.XMLHTTP" ];
                        for (var i = 0; i < activexName.length; i++) {
                            try {
                                xmlhttp = new ActiveXObject(activexName[i]);
                                break;
                            } catch (e) {}
                        }
                    }
                    return xmlhttp;
                },
                buildParams:function(obj) {
                    var i, j, k, len, arr = [];
                    if (typeof obj === "string") {
                        return obj;
                    } else if (typeof obj === "object") {
                        for (i in obj) {
                            // 处理数组 {arr:[1, 2, 3]} => arr[]=1&arr[]=2&arr[]=3
                            if (Je.isArray(obj[i])) {
                                k = i + i.substr(-2, 2) === "[]" ? "" :"[]";
                                for (j = 0, len = obj[i].length; j < len; j++) {
                                    arr.push(k + "=" + encodeURIComponent(obj[i][j] + ""));
                                }
                            } else {
                                arr.push(i + "=" + encodeURIComponent(obj[i] + ""));
                            }
                        }
                    }
                    return arr.join("&");
                },
                ajaxJSONP:function() {
                    var done, callbackName = "jsonp" + ++jsonpID, xmlHttp = xhrAjax.xhr(), done = false;
                    if (xhrAjax.ajaxBeforeSend(xmlHttp) !== false) {
                        var script = document.createElement("script"), abort = function() {
                            if (callbackName in window) window[callbackName] = noops;
                            xhrAjax.ajaxComplete("abort", xmlHttp);
                        }, xmlHttp = {
                            abort:abort
                        }, abortTimeout;
                        if (opts.error) script.onerror = function() {
                            xmlHttp.abort();
                            opts.error();
                        };
                        window[callbackName] = function(data) {
                            clearTimeout(abortTimeout);
                            window[callbackName] = null;
                            xhrAjax.ajaxSuccess(data, xmlHttp);
                        };
                        xhrAjax.serializeData();
                        script.src = opts.url.replace(/=\?/, "=" + callbackName);
                        script.onload = script.onreadystatechange = function() {
                            if (!done && (!script.readyState || script.readyState === "loaded" || script.readyState === "complete")) {
                                done = true;
                                script.onload = script.onreadystatechange = null;
                                if (script && script.parentNode) {
                                    Je(script).remove();
                                }
                                return script = null;
                            }
                        };
                        head = document.getElementsByTagName("head")[0] || document.documentElement;
                        head.appendChild(script);
                        if (opts.timeout > 0) abortTimeout = setTimeout(function() {
                            xmlHttp.abort();
                            xhrAjax.ajaxComplete("timeout", xmlHttp, opts);
                        }, opts.timeout);
                    }
                },
                // trigger an Ajax "global" event
                triggerGlobal:function(context, eventName, data) {
                    if (opts.global) return true;
                },
                ajaxStart:function() {
                    if (opts.global && active++ === 0) xhrAjax.triggerGlobal(null, "ajaxStart");
                },
                ajaxStop:function() {
                    if (opts.global && !--active) xhrAjax.triggerGlobal(null, "ajaxStop");
                },
                // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
                ajaxBeforeSend:function(xhr) {
                    var context = opts.context;
                    if (opts.beforeSend.call(context, xhr, opts) === false || xhrAjax.triggerGlobal(opts, context, "ajaxBeforeSend", [ xhr, opts ]) === false) return false;
                    xhrAjax.triggerGlobal(opts, context, "ajaxSend", [ xhr, opts ]);
                },
                ajaxSuccess:function(data, xhr) {
                    var context = opts.context, status = "success";
                    opts.success.call(context, data, status, xhr);
                    xhrAjax.triggerGlobal(context, "ajaxSuccess", [ xhr, opts, data ]);
                    xhrAjax.ajaxComplete(status, xhr);
                },
                // type: "timeout", "error", "abort", "parsererror"
                ajaxError:function(error, type, xhr) {
                    var context = opts.context;
                    opts.error.call(context, xhr, type, error);
                    xhrAjax.triggerGlobal(context, "ajaxError", [ xhr, opts, error ]);
                    xhrAjax.ajaxComplete(type, xhr);
                },
                // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
                ajaxComplete:function(status, xhr) {
                    var context = opts.context;
                    opts.complete.call(context, xhr, status);
                    xhrAjax.triggerGlobal(opts, context, "ajaxComplete", [ xhr, opts ]);
                    xhrAjax.ajaxStop();
                },
                mimeToDataType:function(mime) {
                    return mime && (mime == htmlType ? "html" :mime == jsonType ? "json" :scriptTypeRE.test(mime) ? "script" :xmlTypeRE.test(mime) && "xml") || "text";
                },
                serializeData:function() {
                    var appendQuery = function(url, query) {
                        var cachestamp = opts.cache ? "&_jexhr_=" + timestamp :"", dataType = opts.dataType == "jsonp" ? "&" + opts.jsonp + "=?" :"";
                        return (url += (/\?/.test(url) ? "&" :"?") + query + dataType + cachestamp).replace(/[&?]{1,2}/, "?");
                    };
                    if (typeof opts.data === "object") opts.data = xhrAjax.buildParams(opts.data);
                    if (opts.data && (!opts.type || opts.type.toUpperCase() == "GET")) opts.url = appendQuery(opts.url, opts.data);
                }
            };
            xhrAjax.ajaxStart();
            if (!opts.crossDomain) opts.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(opts.url) && RegExp.$2 != window.location.host;
            var dataType = opts.dataType, hasPlaceholder = /=\?/.test(opts.url);
            if (dataType == "jsonp" || hasPlaceholder) return xhrAjax.ajaxJSONP();
            if (!opts.url) opts.url = window.location.toString();
            xhrAjax.serializeData();
            var mime = opts.accepts[dataType], baseHeaders = {}, protocol = /^([\w-]+:)\/\//.test(opts.url) ? RegExp.$1 :window.location.protocol, xmlHttp = xhrAjax.xhr(), abortTimeout;
            if (!opts.crossDomain) baseHeaders["X-Requested-With"] = "XMLHttpRequest";
            if (mime) {
                baseHeaders["Accept"] = mime;
                if (mime.indexOf(",") > -1) mime = mime.split(",", 2)[0];
                xmlHttp.overrideMimeType && xmlHttp.overrideMimeType(mime);
            }
            if (opts.contentType || opts.data && typeTouper != "GET") {
                baseHeaders["Content-Type"] = opts.contentType || "application/x-www-form-urlencoded";
            } else {
                baseHeaders["Access-Control-Allow-Origin"] = opts.contentType || "application/json" || "*/*";
            }
            opts.headers = Je.extend(baseHeaders, opts.headers || {});
            xmlHttp.onreadystatechange = function() {
                if (xmlHttp.readyState == 4) {
                    clearTimeout(abortTimeout);
                    var result, error = false;
                    if (xmlHttp.status >= 200 && xmlHttp.status < 300 || xmlHttp.status == 304 || xmlHttp.status == 0 && protocol == "file:") {
                        if (mime == "application/json" && !/^\s*$/.test(xmlHttp.responseText)) {
                            dataType = dataType || xhrAjax.mimeToDataType(xmlHttp.getResponseHeader("content-type"));
                            result = xmlHttp.responseText;
                            try {
                                if (dataType == "script") {
                                    (1, eval)(result);
                                } else if (dataType == "xml") {
                                    result = xmlHttp.responseXML;
                                } else if (dataType == "json") {
                                    result = Je.parseJSON(result);
                                }
                            } catch (e) {
                                error = e;
                            }
                            error ? xhrAjax.ajaxError(error, "parsererror", xmlHttp, opts) :xhrAjax.ajaxSuccess(result, xmlHttp, opts);
                        } else {
                            xhrAjax.ajaxSuccess(xmlHttp.responseText, xmlHttp, opts);
                        }
                    } else {
                        xhrAjax.ajaxError(null, "error", xmlHttp, opts);
                    }
                }
            };
            xmlHttp.open(typeTouper, opts.url, opts.async);
            for (name in opts.headers) xmlHttp.setRequestHeader(name, opts.headers[name]);
            if (xhrAjax.ajaxBeforeSend(xmlHttp, opts) === false) {
                xmlHttp.abort();
                return false;
            }
            if (opts.timeout > 0) abortTimeout = setTimeout(function() {
                xmlHttp.onreadystatechange = noops;
                xmlHttp.abort();
                xhrAjax.ajaxError(null, "timeout", xmlHttp, opts);
            }, opts.timeout);
            var paramsData = opts.data ? xhrAjax.buildParams(opts.data) :null;
            xmlHttp.send(paramsData);
            return xmlHttp;
        }
    });
})(window.Je);
