/**
* Je Javascript Class Library
* @Author  chen guojun
* @Contact https://github.com/singod/jeQuery
* @Version 1.0.0
*/
(function(window, undefined) {
    //"use strict";
    var rootJe, document = window.document, location = window.location, // 默认$属性
    _$ = window.$, version = "1.1.7", class2type = {}, jesarr = [], jespush = jesarr.push, jesindexOf = jesarr.indexOf, jessplice = jesarr.splice, jessort = jesarr.sort, jestoString = class2type.toString, jeshasOwn = class2type.hasOwnProperty, jestrim = version.trim, rMultiSelector = /^(?:([\w-#\.]+)([\s]?)([\w-#\.\s>]*))$/;
	var querySelector = function() {
		var snack = /(?:[\*\w\-\\.#]+)+(?:\[(?:[\w\-_][^=]+)=(?:[\'\[\]\w\-_]+)\])*|\*|>/gi, exprClassName = /^(?:[\w\-_]+)?\.([\w\-_]+)/, exprId = /^(?:[\w\-_]+)?#([\w\-_]+)/, exprNodeName = /^([\w\*\-_]+)/, na = [ null, null, null ];
		var exprAttr = /\[([\w\-_][^=]+)=([\'\[\]\w\-_]+)\]/;
		var exprAttrArr = /\[([\w\-_][^=]+)=(([\w\-_]+)\{([\w\-_]+)\})\]/;
		function retSelector(selector, context) {
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
		return retSelector;
	}();
	var Je = function(selector, context) {
		return new Je.fn.init(selector, context);
	}; // update at 2013.03.13
	Je.fn = Je.prototype = {
		init : function(selector, context) {
			var dom, match, elem;
			// $(undefined/null/""/false)
			if (!selector) {
				return this;
			}
			//$(node)
			if (selector.nodeType) {
				this.context = this[0] = selector;
				this.length = 1;
				return this;
			}
			if (typeof selector === "string") {
				if (context && context.nodeType === 1) {
					this.context = context;
				} else {
					context = document;
				}
				
				var obj, quSel = querySelector(selector, context), rets = [];
				for (var i = 0;i < quSel.length; i++) {
					rets.push(quSel[i])
				}
				// 父集为多个节点时需要排重
				if (quSel.length > 1 && rets[1]) {
					rets = Je.uniq(rets);
				}
				obj = Je(this).pushStack(rets);
				return obj;
			} else if (typeof selector === "function" && Je.fn.ready) {
				return rootJe.ready(selector);
			}
		}
	};
	Je.fn.init.prototype = Je.fn;
    // 对象继承(update at 2013.05.09)
    Je.fn.extend = Je.extend = function() {
		var options, name, src, copy, target = arguments[0],i = 1, length = arguments.length, deep = false;
		//处理深拷贝的情况
		if (typeof (target) === "boolean") deep = target,target = arguments[1] || {},i = 2;
		//处理时，目标是一个字符串或（深拷贝可能的情况下）的东西
		if (typeof (target) !== "object" && typeof (target) !== "function") target = {};
		//扩展JSLite的本身，如果只有一个参数传递
		if (length === i) target = this,--i;
		for (; i < length; i++) {
			if ((options = arguments[i]) != null) {
				for (name in options) {
					src = target[name],copy = options[name];
					if (target === copy) continue;
					if (copy !== undefined) target[name] = copy;
				}
			}
		}
		return target;
    };
    Je.fn.extend({
        constructor:Je,
        selector:"",
        context:document,
        // arrayLike
        length:0,
        splice:jessplice,
        push:jespush,
        sort:jessort,
        // 返回节点个数
        size:function() {
            return this.length;
        },
        // 组合Kss(update at 2013.05.09)
        pushStack:function(elems) {
            var obj = Je(), i = 0, len = elems.length;
            for (;i < len; i++) {
                obj[i] = elems[i];
            }
            obj.length = len;
            return obj;
        },
        // 获取指定后代元素(update at 2013.05.09)
        find:function(selector) {
            var match, i = 0, obj, len = this.length, rets = [];
            match = rMultiSelector.exec(selector);
            if (match && match[1]) {
                for (;i < len; i++) {
                    rets = Je.merge(rets, querySelector(match[1], this[i]));
                }
            }
            // 父集为多个节点时需要排重
            if (len > 1 && rets[1]) {
                rets = Je.uniq(rets);
            }
            obj = this.pushStack(rets);
            // 还有后代节点继续遍历
            if (obj.length > 0 && match[2] && match[3]) {
                return obj.find(match[3]);
            }
            return obj;
        },
        // 获取指定子元素(update at 2013.03.14)
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
        // 获取所有子节点(update at 2013.04.22)
        contents:function() {
            var elems, i = 0, len = this.length, rets = [];
            for (;i < len; i++) {
                rets = Je.merge(rets, this[i].childNodes);
            }
            // 排重
            rets = Je.uniq(rets);
            return this.pushStack(rets);
        },
        // 获取相应下标的元素对象(update at 2013.02.28)
        eq:function(i) {
            var len = this.length, j = +i + (i < 0 ? len :0);
            return this.pushStack(j >= 0 && j < len ? [ this[j] ] :[]);
        },
        // 遍历元素并执行函数(update at 2013.02.19)
        each:function(callback, args) {
            return Je.each(this, callback, args);
        },
        // 处理过滤元素(add at 2013.02.27)
        // 倒过来的(index, element)
        map:function(callback) {
            return this.pushStack(Je.map(this, function(elem, i) {
                return callback.call(elem, i, elem);
            }));
        },
        // 删除节点(update at 2013.03.25)
        remove:function() {
            var i = 0, len = this.length;
            for (;i < len; i++) {
                Je.remove(this[i]);
            }
            return this;
        }
    });
    Je.extend({
        // 判断类型(add at 2013.05.03)
        type:function(obj) {
            if (obj == null) {
                return String(obj);
            }
            return typeof obj === "object" || typeof obj === "function" ? class2type[jestoString.call(obj)] || "object" :typeof obj;
        },
		isObject : function(obj) {
            return Je.type(obj) === "object";
        },
		isString : function(obj) {
            return Je.type(obj) === "string";
        },
		isNumber : function(obj) {
            return Je.type(obj) === "number";
        },
		isRegExp : function(obj) {
            return Je.type(obj) === "regexp";
        },
        // 判断是否为函数(add at 2013.05.03)
        isFunction:function(obj) {
            return Je.type(obj) === "function";
        },
        // 判断是否为数组(add at 2013.05.03)
        isArray:function(obj) {
            return Je.type(obj) === "array";
        },
        // 判断是否为数字(包含只含数字的字符串)(add at 2012.11.20)
        isNumeric:function(obj) {
            return !isNaN(parseFloat(obj)) && isFinite(obj);
        },
        // 判断是否为空对象(add at 2012.11.22)
        isEmptyObject:function(obj) {
            var i;
            for (i in obj) {
                return false;
            }
            return true;
        },
        // 对对象和数组进行callback操作(update at 2013.02.27)
        map:function(elems, callback) {
            var value, i = 0, len, rets = [];
            // 伪数组和数组采用索引遍历
            if ((elems.constructor == Je && typeof elems.length === "number") || Je.isArray(elems)) {
                for (len = elems.length; i < len; i++) {
                    value = callback(elems[i], i);
                    if (value != null) {
                        rets.push(value);
                    }
                }
            } else {
                for (i in elems) {
                    value = callback(elems[i], i);
                    if (value != null) {
                        rets.push(value);
                    }
                }
            }
            return rets;
        },
        // Je对象遍历(update at 2013.05.09)
        each:function(object, callback,args) {
			var name, i = 0, length = object.length, isObj = length === undefined || typeof object == 'function';
			if ( args ) {
				if ( isObj ) {
					for ( name in object ) {
						if ( callback.apply( object[ name ], args ) === false ) break;
					}
				} else {

					for ( ; i < length; ) {
						if ( callback.apply( object[ i++ ], args ) === false ) break;
					}
				}
			}else{
				if (isObj) {
					for (name in object) {
						if (callback.call(object[name], name, object[name]) === false) break;
					}
				} else {
					for (;i < length; ) {
						if (callback.call(object[i], i, object[i++]) === false) break;
					}
				}
			}
			return object;
        }
    });
    Je.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
        class2type["[object " + name + "]"] = name.toLowerCase();
    });
    Je.fn.extend({
        // 获取元素父节点(update at 2013.06.08)
        parent:function() {
            return this.parents();
        },
        // 获取元素匹配的上级节点(add 2013.06.08)
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
        // 返回元素之后第一个兄弟节点(add 2013.02.25)
        next:function() {
            return this[0] ? this.pushStack(Je.dir(this[0], "nextSibling", this[0], true)) :Je();
        },
        // 返回元素之后所有兄弟节点(add 2013.02.25)
        nextAll:function() {
            return this[0] ? this.pushStack(Je.dir(this[0], "nextSibling", this[0])) :Je();
        },
        // 返回元素之前第一个兄弟节点(add 2013.02.25)
        prev:function() {
            return this[0] ? this.pushStack(Je.dir(this[0], "previousSibling", this[0], true)) :Je();
        },
        // 返回元素之前所有兄弟节点(add 2013.02.25)
        prevAll:function() {
            return this[0] ? this.pushStack(Je.dir(this[0], "previousSibling", this[0])) :Je();
        },
        // 返回除自身以外所有兄弟节点(add 2013.02.25)
        siblings:function() {
            return this[0] ? this.pushStack(Je.dir(this[0].parentNode.firstChild, "nextSibling", this[0])) :Je();
        }
    });
    Je.fn.extend({
        // 处理数据插入(update 2013.04.17)
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
        // 在元素里面内容的末尾插入内容(update 2013.04.17)
        append:function() {
            return this.domManip(arguments, function(elem) {
                this.appendChild(elem);
            });
        },
        // 在元素里面内容的前面插入内容(update(update 2013.04.17)
        prepend:function() {
            return this.domManip(arguments, function(elem) {
                this.insertBefore(elem, this.firstChild);
            });
        },
        // 在元素之前插入内容(update(update 2013.04.17)
        before:function() {
            return this.domManip(arguments, function(elem) {
                if (this.parentNode) {
                    this.parentNode.insertBefore(elem, this);
                }
            });
        },
        // 在元素之后插入内容(update(update 2013.04.17)
        after:function() {
            return this.domManip(arguments, function(elem) {
                if (this.parentNode) {
                    this.parentNode.insertBefore(elem, this.nextSibling);
                }
            });
        }
    });
    Je.extend({
        // 解析字符串为dom节点(update 2013.04.17)
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
        // 返回节点集合(update 2013.04.17)
        buildFragment:function(nodes) {
            var frag = document.createDocumentFragment(), i = 0, len = nodes.length;
            for (;i < len; i++) {
                frag.appendChild(nodes[i]);
            }
            return frag;
        }
    });
    var rQuickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/, rTagClass = /^(?:(\w*)\.([\w-]+))$/;
    Je.extend({
        // 过滤选择器(update 2013.03.14)
        filter:function(selector, elems) {
            var match, m, tag, i = 0, len = elems.length, rets = [];
            // 快速匹配
            match = rQuickExpr.exec(selector);
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
                        if (elems[i].tagName == m.toUpperCase()) {
                            rets.push(elems[i]);
                        }
                    }
                } else if (m = match[3]) {
                    for (;i < len; i++) {
                        if (Je(elems[i]).hasClass( m)) {
                            rets.push(elems[i]);
                        }
                    }
                }
            } else {
                // 高级匹配
                // $("tag.class")
                match = rTagClass.exec(selector);
                if (match && (tag = match[1]) && (m = match[2])) {
                    for (;i < len; i++) {
                        if (Je(elems[i]).hasClass(m) && elems[i].tagName === tag.toUpperCase()) {
                            rets.push(elems[i]);
                        }
                    }
                    return rets;
                }
            }
            return rets;
        },
        // 筛选节点(add 2013.02.25)
        dir:function(elem, dir, besides, one) {
            var matched = [], cur = elem;
            while (cur && cur.nodeType !== 9) {
                if (cur.nodeType === 1 && cur !== besides) {
                    matched.push(cur);
                    if (one) {
                        return matched;
                    }
                }
                cur = cur[dir];
            }
            return matched;
        }
    });
    Je.fn.extend({
        // 读取设置节点内容(update at 2013.03.25)
        html:function(value) {
            return (typeof value === "undefined") ? (this[0] && this[0].nodeType === 1 ? this[0].innerHTML :undefined ) : Je.each(this, function () {
                this.innerHTML = value;
            });
        },
        // 读取设置节点文本内容(update at 2013.04.22)
        text:function(value) {
			var innText = document.all ? 'innerText' : 'textContent';
			return (typeof value === "undefined") ? (this[0] && this[0].nodeType === 1 ? this[0][innText] :undefined) : Je.each(this, function () {
                this[innText] = value;
            });
        },
        // 读取设置表单元素的值(update at 2013.06.08)
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
		empty: function () {
            return this.html('');
        },
		wrapAll: function( html ) {	
			if ( this[ 0 ] ) {
				if ( Je.isFunction( html ) ) html = html.call( this[ 0 ] );	
				// The elements to wrap the target around
				var wrap = Je( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );
				if ( this[ 0 ].parentNode ) wrap.insertBefore( this[ 0 ] );
				wrap.map( function() {
					var elem = this;
					while ( elem.firstElementChild ) {
						elem = elem.firstElementChild;
					}
					return elem;
				}).append( this );
			}
			return this;
		},	
		wrapInner: function( html ) {
			if ( Je.isFunction( html ) ) {
				return this.each( function( i ) {
					Je( this ).wrapInner( html.call( this, i ) );
				} );
			}
			return this.each( function() {
				var self = Je( this ),contents = self.contents();
				contents.length ? contents.wrapAll( html ) : self.append( html );
			} );
		},	
		wrap: function( html ) {
			var isFunction = Je.isFunction( html );
			return this.each( function( i ) {
				Je( this ).wrapAll( isFunction ? html.call( this, i ) : html );
			} );
		}
	});
    // JSON正则校验公式
    var rValidchars = /^[\],:{}\s]*$/, rValidbraces = /(?:^|:|,)(?:\s*\[)+/g, rValidescape = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g, rValidtokens = /"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g, rTrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
    Je.extend({
        // 获取当前时间戳(add at 2012.11.25)
        now:function() {
            return new Date().getTime();
        },
        // 随机生成数(add at 2013.02.20)
        rand:function(len) {
            return Math.random().toString().substr(2, len);
        },
        // 判断是否在数组中(update at 2013.03.15)
        inArray:function(value, arr, start) {
            var i, len = arr.length;
            if (typeof start !== "number") {
                start = 0;
            } else if (start < 0) {
                start = Math.max(0, len + start);
            }
            for (i = start; i < len; i++) {
                if (arr[i] === value) {
                    return i;
                }
            }
            return -1;
        },
        // 清除数组中重复的数据(update at 2013.02.28)
        uniq:function(arr) {
            var rets = [], i = 0, len = arr.length;
            if (Je.isArray(arr)) {
                for (;i < len; i++) {
                    if (Je.inArray(arr[i], rets) === -1) {
                        rets.push(arr[i]);
                    }
                }
            }
            return rets;
        },
        // 数组拼接(update at 2013.02.28)
        merge:function(first, second) {
            var i = first.length, j = 0, len = second.length;
            for (;j < len; j++) {
                first[i++] = second[j];
            }
            return first;
        },
        // 清除两边空格(update at 2013.05.10)
        // 注：包括BOM和&nbsp;
        trim:jestrim && !jestrim.call("﻿ ") ? function(text) {
            return text == null ? "" :jestrim.call(text);
        } :function(text) {
            return text == null ? "" :(text + "").replace(rTrim, "");
        },
        // 删除节点(add at 2012.12.14)
        remove:function(elem) {
            var parent = elem.parentNode;
            if (parent && parent.nodeType !== 11) {
                parent.removeChild(elem);
            }
        },
        // 解析json(update at 2013.04.01)
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
        // 置空函数(add at 2013.04.27)
        noop:function() {},
        // 抛出错误(add at 2012.12.14)
        error:function(msg) {
            throw new Error(msg);
        },
        // 防冲突，暂时只支持交出$(add at 2014.02.08)
        noConflict:function() {
            if (window.$ === Je) {
                window.$ = _$;
            }
            return Je;
        }
    });
    Je.extend({
        // 全局缓存(add at 2013.02.15)
        cache:{},
        // 全局索引
        guid:1,
        // 内部Key
        expando:"Je" + Je.rand(),
        // 获取数据索引(update at 2013.03.18)
        getCacheIndex:function(elem, isSet) {
            var id = Je.expando;
            if (elem.nodeType === 1) {
                return elem[id] || !isSet ? elem[id] :elem[id] = ++Je.guid;
            }
            return elem.nodeType === 9 ? 1 :0;
        },
        // 读取/缓存数据操作(update at 2013.03.27)
        data:function(elem, type, name, value, overwrite) {
            var cache = Je.cache, isRead = typeof value === "undefined" ? true :false, index = Je.getCacheIndex(elem, !isRead);
            if (isRead) {
                return index && cache[index] && cache[index][type] && cache[index][type][name] || undefined;
            }
            cache = cache[index] = cache[index] || {};
            if (!cache[type]) {
                cache[type] = {};
            }
            if (overwrite || typeof cache[type][name] === "undefined") {
                cache[type][name] = value;
            }
            return cache[type][name];
        },
        // 删除数据操作(update at 2013.03.18)
        removeData:function(elem, type, name) {
            var data, cache = Je.cache, index = Je.getCacheIndex(elem);
            if (index && (data = cache[index])) {
                if (data[type]) {
                    if (name) {
                        delete data[type][name];
                    } else {
                        delete data[type];
                    }
                }
                if (Je.isEmptyObject(data[type])) {
                    delete data[type];
                }
            }
        },
        // 深度复制(update at 2013.05.10)
        clone:function(obj) {
            var i, clone = obj;
            if (Je.isArray(obj)) {
                i = obj.length;
                clone = [];
                while (i--) {
                    clone[i] = arguments.callee.call(null, obj[i]);
                }
                return clone;
            } else if (Je.type(obj) === "object") {
                clone = {};
                for (i in obj) {
                    clone[i] = arguments.callee.call(null, obj[i]);
                }
                return clone;
            }
            return clone;
        }
    });
    // 事件函数(add at 2013.02.22)
    Je.each(("blur focus focusin focusout load resize scroll unload click dblclick " + "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " + "change select submit keydown keypress keyup error contextmenu").split(" "), function(i, name) {
        Je.fn[name] = function(data, fn) {
            return arguments.length > 0 ? this.on(name, null, data, fn) :this.trigger(name);
        };
    });
    Je.fn.extend({
        // 事件绑定(bind/live/delegate add 2013.02.15)
        on:function(type, selector, data, fn) {
            if (typeof type !== "string" || type == "") {
                return this;
            }
            // (type, fn)
            if (data == null && fn == null) {
                fn = selector;
                data = selector = undefined;
            } else if (fn == null) {
                if (typeof selector === "string") {
                    // (type, selector, fn)
                    fn = data;
                    data = undefined;
                } else {
                    // (type, data, fn)
                    fn = data;
                    data = selector;
                    selector = undefined;
                }
            }
            if (!Je.isFunction(fn)) {
                fn = returnFalse;
            }
            return Je.each(this, function() {
                Je.event.add(this, type, selector, data, fn);
            }, [ type, selector, data, fn ]);
        },
        // 事件解绑(unbind/die/undelegate add 2013.02.15)
        off:function(type, selector, fn) {
            if (typeof type !== "string" || type == "") {
                return this;
            }
            // (type[, fn])
            if (!selector || Je.isFunction(selector)) {
                fn = selector;
                selector = undefined;
            }
            if (!fn) {
                fn = undefined;
            }
            return Je.each(this, function() {
                Je.event.remove(this, type, selector, fn);
            }, [ type, selector, fn ]);
        },
        hover:function(fnOver, fnOut) {
            return Je.each(this, function() {
				this.on("mouseover", fnOver);
				this.on("mouseout", fnOut);
                //addEvent(this, "mouseover", fnOver);
                //addEvent(this, "mouseout", fnOut);
            });
        },
        // 触发事件(update at 2013.03.25)
        trigger:function(type) {
            return Je.each(this, function() {
                Je.event.trigger(this, type);
            });
        },
        // 文档完成事件(update at 2013.05.10)
        ready:function(fn) {
            if (Je.isFunction(fn)) {
                if (Je.isReady) {
                    fn.call(document, Je);
                } else if (readyList) {
                    readyList.push(fn);
                    if (!readyBound) {
                        readyAttach();
                    }
                }
            }
            return this;
        }
    });
    // 返回false函数(add at 2013.02.16)
    function returnFalse() {
        return false;
    }
    // 简单模拟事件(add at 2014.01.03)
    var Event = function(type, props) {
        // 直接调用 转化为new
        if (!(this instanceof Event)) {
            return new Event(type, props);
        }
        this.type = type;
        if (props) {
            Je.extend(this, props);
        }
        this.timeStamp = Je.now();
        // 该事件为模拟事件，不需要修复
        this[Je.expando] = true;
    };
    Event.prototype = {
        // 判定是否阻止了默认事件
        _isDefaultPrevented:false,
        // 判定是否阻止了冒泡    
        _isPropagationStopped:false,
        // 模拟阻止阻止默认事件，配合handle用
        // 由于是模拟事件，该方法貌似无效
        preventDefault:function() {
            this._isDefaultPrevented = true;
        },
        // 模拟阻止事件冒泡，配合handle用
        stopPropagation:function() {
            this._isPropagationStopped = true;
        }
    };
    var rKeyEvent = /^key/, rMouseEvent = /^(?:mouse|contextmenu)|click/;
    Je.event = {
        // 事件绑定(update at 2013.02.20)
        add:function(elem, type, selector, data, fn) {
            var handleObj = {}, handler, events, elems, target, id = Je.expando;
            // 事件委托
            if (selector) {
                handler = function(event) {
                    event = Je.event.fix(event);
                    event.data = data;
                    elems = Je(elem).find(selector);
                    target = event.target;
                    for (var i = 0; i < elems.length; i++) {
                        if (elems[i] == target) {
                            return fn.call(target, event);
                        }
                    }
                };
            } else {
                handler = function(event) {
                    event = Je.event.fix(event);
                    event.data = data;
                    return fn.call(elem, event);
                };
            }
            // 事件缓存
            fn[id] = fn[id] || ++Je.guid;
            events = Je.data(elem, "events", type, []);
            handleObj.handler = handler;
            handleObj.selector = selector;
            handleObj.data = data;
            handleObj.guid = fn[id];
            events.push(handleObj);
            if (elem.addEventListener) {
                elem.addEventListener(type, handler, false);
            } else if (elem.attachEvent) {
                elem.attachEvent("on" + type, handler);
            } else {
                elem["on" + type] = handler;
            }
        },
        // 事件解绑(update at 2013.02.15)
        remove:function(elem, type, selector, fn) {
            var handleObj, handler, id = Je.expando, events = Je.data(elem, "events", type), i = 0;
            if (!elem[id] || !events) {
                return;
            }
            if (Je.isFunction(fn) && !fn[id]) {
                return;
            }
            for (;i < events.length; i++) {
                handleObj = events[i];
                if (typeof fn === "undefined" || typeof selector !== "undefined" && handleObj.selector === selector && fn[id] === handleObj.guid || typeof selector === "undefined" && fn[id] === handleObj.guid) {
                    handler = handleObj.handler;
                    if (elem.removeEventListener) {
                        elem.removeEventListener(type, handler, false);
                    } else if (elem.detachEvent) {
                        elem.detachEvent("on" + type, handler);
                    } else {
                        elem["on" + type] = null;
                    }
                    events.splice(i, 1);
                }
            }
            if (events.length === 0) {
                Je.removeData(elem, "events", type);
            }
        },
        // 事件修正(update at 2013.05.13)
        // 注：按照W3C标准修正
        fix:function(event) {
            var fixHook, i, type;
            // ie获取全局事件
            event = event || window.event;
            if (event[Je.expando]) {
                return event;
            }
            type = event.type;
            fixHook = rMouseEvent.test(type) ? this.mouseHooks :rKeyEvent.test(type) ? this.keyHooks :null;
            // 修正事件源
            if (!event.target) {
                event.target = event.srcElement || document;
            }
            // 事件源不能是文本节点(chrome>23 & Safari)
            if (event.target.nodeType === 3) {
                event.target = event.target.parentNode;
            }
            // 添加metaKey
            event.metaKey = !!event.metaKey;
            // 阻止事件
            if (!event.preventDefault) {
                event.preventDefault = function() {
                    this.returnValue = false;
                };
            }
            if (!event.stopPropagation) {
                event.stopPropagation = function() {
                    this.cancelBubble = true;
                };
            }
            event[Je.expando] = true;
            return fixHook ? fixHook(event) :event;
        },
        // 键盘事件修正(update at 2013.05.13)
        keyHooks:function(event) {
            // 添加which
            if (event.which == null) {
                event.which = event.charCode != null ? event.charCode :event.keyCode;
            }
            return event;
        },
        // 鼠标事件修正(update at 2013.05.13)
        mouseHooks:function(event) {
            var body, eventDoc, doc, button = event.button, fromElement = event.fromElement;
            // 修正鼠标位移
            if (event.pageX == null && event.clientX != null) {
                eventDoc = event.target.ownerDocument || document;
                doc = eventDoc.documentElement;
                body = eventDoc.body;
                event.pageX = event.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
                event.pageY = event.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0);
            }
            // 修正onmouseover/onmouseout情况下触发的relatedTarget
            if (!event.relatedTarget && fromElement) {
                event.relatedTarget = fromElement === event.target ? event.toElement :fromElement;
            }
            // 鼠标点击按键(1: 左键, 2: 中键, 3: 右键)
            // 注：button差异性较大，不建议使用(W3C: 0,1,2, IE: 1,4,2)
            if (!event.which && typeof button !== "undefined") {
                event.which = [ 0, 1, 3, 0, 2, 0, 0, 0 ][button];
            }
            return event;
        },
        // 处理事件点击(update at 2013.05.14)
        trigger:function(elem, type, data, onlyHandlers) {
            var special = Je.event.special[type] || null;
            if (!onlyHandlers) {
                // 一些特殊事件执行
                if (special && special.call(elem) === false) {
                    return;
                } else if (Je.isFunction(elem[type])) {
                    elem[type].call(elem);
                    return;
                } else if (Je.isFunction(elem["on" + type])) {
                    elem["on" + type].call(elem);
                    return;
                }
            }
            // 其他一律采用模拟事件
            Je.event.handlers(elem, type, data);
        },
        // 特殊事件函数(add at 2013.05.14)
        special:{
            focus:function() {
                if (this !== document.activeElement && this.focus) {
                    try {
                        this.focus();
                        return false;
                    } catch (e) {}
                }
            },
            blur:function() {
                if (this === document.activeElement && this.blur) {
                    this.blur();
                    return false;
                }
            }
        },
        // 模拟事件点击(update at 2014.01.03)
        handlers:function(elem, event, data) {
            var i = 0, len, events, type, parent;
            if (typeof event === "object") {
                // 如果是事件，直接继承
                type = event.type;
                event.currentTarget = elem;
            } else {
                type = event;
                // 模拟事件对象
                event = new Event(type, {
                    currentTarget:elem,
                    target:elem,
                    data:data
                });
            }
            event.currentTarget = elem;
            events = Je.data(elem, "events", type);
            if (events) {
                for (len = events.length; i < len; i++) {
                    events[i].handler.call(elem, event);
                }
                parent = elem.parentNode;
                // 模拟事件冒泡
                if (parent && !event._isPropagationStopped) {
                    Je.event.handlers(parent, event);
                }
            }
        }
    };
    // 判断Dom载完(update at 2013.05.09)
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
        var top = false;
        readyBound = true;
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
    Je.extend({
        isReady:false,
        ready:function() {
            var i = 0, len = readyList.length;
            if (!Je.isReady) {
                if (!document.body) {
                    return setTimeout(Je.ready, 13);
                }
                Je.isReady = true;
                for (;i < len; i++) {
                    readyList[i].call(document, Je);
                }
                readyList = [];
            }
        }
    });
    var rBoolean = /^(?:checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped)$/i, propFix = { "for":"htmlFor","class":"className" };
    Je.each("tabIndex readOnly maxLength cellSpacing cellPadding rowSpan colSpan useMap frameBorder contentEditable".split(" "), function() {
        propFix[this.toLowerCase()] = this;
    });
    // 属性操作原型链
    Je.fn.extend({
        // 读取或设置元素Attribute属性(update at 2013.06.07)
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
            if (value === null) {
                return this.removeAttr(name);
            }
            // 判断是否bool属性
            if (rBoolean.test(name)) {
                if (value === false) {
                    return this.removeAttr(name);
                } else {
                    value = name;
                }
            }
            return Je.each(this, function() {
                if (this.nodeType === 1) {
                    this.setAttribute(name, value);
                }
            });
        },
        // 删除元素指定Attribute属性(update at 2013.06.07)
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
        // 读取或设置元素Property属性处理(update at 2013.06.07)
        prop:function(name, value) {
            name = propFix[name] || name;
            if (typeof value === "undefined") {
                return this[0][name];
            }
            return Je.each(this, function() {
                this[name] = value;
            });
        },
        // 删除元素指定Property属性(update at 2013.06.07)
        removeProp:function(name) {
            name = propFix[name] || name;
            return Je.each(this, function() {
                delete this[name];
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
        }
    });
    // 样式操作原型链
    Je.fn.extend({
        // 判断元素是否有对应Class(update at 2013.05.10)
        // 只要其中一个有就返回true
        hasClass:function(className) {
            var i = 0, len = this.length;
            for (;i < len; i++) {
				var elemnode = this[i].nodeType === 1 && (" " + this[i].className + " ").indexOf(" " + className + " ") >= 0;
                if (elemnode) return true;
            }
            return false;
        },
        // 添加Class(update at 2013.02.19)
        addClass:function(className) {
            return Je.each(this, function() {
				if (this.nodeType === 1 && !Je(this).hasClass( className)) {
					this.className = Je.trim(this.className + " " + className + " ");
				}
            });
        },
        // 删除Class(update at 2013.02.19)
        removeClass:function(className) {
            return Je.each(this, function() {
				if (this.nodeType === 1) {
					this.className = Je.trim((" " + this.className + " ").replace(" " + className + " ", " "));
				}
            });
        },
        // 添加删除样式(add at 2013.04.25)
        toggleClass:function(className, state) {
            return Je.each(this, function() {
                if (typeof state !== "boolean") {
                    state = !Je(this).hasClass(className);
                }
                if (state) {
                    Je(this).addClass(className);
                } else {
                    Je(this).removeClass(className);
                }
            });
        },
        // 读取或这是元素对应样式(update at 2012.11.22)
        // GET: only get the first node current css
        css:function(name, value) {
            if (typeof (name) == "string" && typeof (value) == "string") {
                return Je.each(this, function() {
                    this.style[name] = value;
                });				
			}else if (Je.isString(name) && typeof (value) === 'undefined') {
                if (this.size() == 0) return null;
                var ele = this[0], JeS = function() {
                    var def = document.defaultView;
                    return new Function("el", "style", [ "style.indexOf('-')>-1 && (style=style.replace(/-(\\w)/g,function(m,a){return a.toUpperCase()}));", "style=='float' && (style='", def ? "cssFloat" :"styleFloat", "');return el.style[style] || ", def ? "window.getComputedStyle(el, null)[style]" :"el.currentStyle[style]", " || null;" ].join(""));
                }();
                return JeS(ele, name);
            }else{
				return Je.each(this, function() {
					for (var x in name) this.style[x] = name[x];
				});
			}
        },
        // 显示元素(add at 2012.11.26)
        show:function() {
            return Je.each(this, function() {
                Je(this).css("display", "block");
            });
        },
        // 隐藏元素(add at 2012.11.26)
        hide:function() {
            return Je.each(this, function() {
                Je(this).css("display", "none");
            });
        },
        offset:function() {
            if (this.size() == 0) return null;
            var obj = this[0].getBoundingClientRect();
            return {
                left:obj.left + window.pageXOffset,
                top:obj.top + window.pageYOffset,
                width:obj.width,
                height:obj.height
            };
        }
    });
    Je.each([ "width", "height"], function(i, name) {
        Je.fn[name] = function(value) {
            for (var s = 0; s < this.length; s++) {
                if (value == undefined) {
					return getWidthOrHeight(this[s], name);
                } else {
                    Je(this[s]).css(name, typeof value === "number" ? value + "px" :value);
                }
            }
        };
    });

    // 将样式属性转为驼峰式(add at 2012.11.26)
    function camelCase(name) {
        return name.replace(/\-(\w)/g, function(all, letter) {
            return letter.toUpperCase();
        });
    }
    // 宽高属性单位auto转化为px(update at 2013.04.22)
    // IE hack
    function getWidthOrHeight(elem, name) {
        var padding = name === "width" ? [ "left", "right" ] :[ "top", "bottom" ], ret = elem[camelCase("offset-" + name)];
        if (ret <= 0 || ret == null) {
            ret = parseFloat(elem[camelCase("client-" + name)]) - parseFloat(Je(elem).css("padding-" + padding[0])) - parseFloat(Je(elem).css("padding-" + padding[1]));
        }
        return ret;
    }
    // 数据请求
    Je.extend({
        // 远程json获取(update at 2013.03.01)
        getJSON:function(url, data, fn) {
            return Je.get(url, data, fn, "jsonp");
        },
        // 载入远程JS并执行回调(update at 2013.03.01)
        getScript:function(url, data, fn) {
            return Je.get(url, data, fn, "script");
        },
        // get封装(update at 2013.03.10)
        get:function(url, data, fn, type) {
            // (url, fn, type)
            if (Je.isFunction(data)) {
                type = type || fn;
                fn = data;
                data = undefined;
            }
            return Je.ajax({
                url:url,
                data:data,
                success:fn,
                dataType:type
            });
        },
        // ajax(update at 2013.03.10)
        ajax:function(url, settings) {
            var i, s, params;
            if (typeof url === "object") {
                settings = url;
                url = undefined;
            }
            // 合并参数项
            s = typeof settings === "object" ? settings :{};
            if (typeof url === "string") {
                s.url = url;
            }
            for (i in ajax.settings) {
                if (typeof s[i] === "undefined") {
                    s[i] = ajax.settings[i];
                }
            }
            if (s.type !== "POST") {
                params = ajax.buildParams(s.data);
                if (s.cache === false) {
                    params = [ params, "_=" + Je.now() ].join("&");
                }
                s.url += (s.url.indexOf("?") === -1 ? "?" :"&") + params;
            }
            if (s.dataType === "script" || s.dataType === "jsonp") {
                transports.script.send(s);
            } else {
                transports.xhr.send(s);
            }
        }
    });
    var ajax = {
        xhr:window.XMLHttpRequest && (window.location.protocol !== "file:" || !window.ActiveXObject) ? function() {
            return new window.XMLHttpRequest();
        } :function() {
            try {
                return new window.ActiveXObject("Microsoft.XMLHTTP");
            } catch (e) {}
        },
        settings:{
            url:"",
            type:"GET",
            data:"",
            async:true,
            cache:false,
            timeout:0,
            contentType:"application/x-www-form-urlencoded",
            parseDate:true,
            dataType:"*",
            context:document,
            beforeSend:function(xhr) {},
            success:function(data, status) {},
            error:function(xhr, status) {},
            complete:function(xhr, status) {}
        },
        // 将Data转换成字符串(update 2013.02.28)
        buildParams:function(obj) {
            var i, j, k, len, arr = [];
            // 字符串直接返回
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
        httpData:function(xhr, type) {
            var ct = xhr.getResponseHeader("content-type") || "";
            if (!type && ct.indexOf("xml") >= 0 || type.toLowerCase() === "xml") {
                return xhr.responseXML;
            }
            if (type === "json") {
                return Je.parseJSON(xhr.responseText);
            }
            return xhr.responseText;
        }
    };
    // 传送器
    var transports = {
        // ajax发送请求(update 2013.03.10)
        xhr:{
            send:function(s) {
                var xhr = ajax.xhr(), params;
                // 发送前执行函数
                s.beforeSend.call(s.context, xhr);
                // 监听返回
                xhr.onreadystatechange = function() {
                    transports.xhr.callback(xhr, s);
                };
                // GET方法处理
                if (s.type === "GET") {
                    xhr.open(s.type, s.url, s.async);
                    xhr.send();
                } else if (s.type === "POST") {
                    xhr.open(s.type, s.url, s.async);
                    xhr.setRequestHeader("Content-type", s.contentType);
                    params = ajax.buildParams(s.data);
                    xhr.send(params);
                }
            },
            callback:function(xhr, s) {
                if (xhr.readyState === 4) {
                    xhr.onreadystatechange = Je.noop;
                    if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
                        s.success.call(s.context, ajax.httpData(xhr, s.dataType), xhr.status);
                    } else {
                        s.error.call(s.context, xhr, xhr.status);
                    }
                    s.complete.call(s.context, xhr, xhr.status);
                }
            }
        },
        // script动态载入(update 2013.03.10)
        script:{
            send:function(s) {
                var match, name, script = document.createElement("script"), head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
                if (s.dataType === "jsonp") {
                    s.url = s.url.replace("callback=%3F", "callback=?");
                    match = /callback=([\w?]+)/.exec(s.url);
                    if (match && match[0]) {
                        name = match[1] && match[1] !== "?" ? match[1] :"Je" + Je.rand() + "_" + Je.now();
                        s.url = s.url.replace("callback=?", "callback=" + name);
                        window[name] = function(json) {
                            json = s.parseData ? Je.parseJSON(json) :json;
                            s.success.call(s.context, json);
                            try {
                                window[name] = null;
                                delete window[name];
                            } catch (e) {}
                        };
                    }
                }
                script.type = "text/javascript";
                script.defer = true;
                script.src = s.url;
                script.onerror = script.onload = script.onreadystatechange = function(e) {
                    transports.script.callback(e, script, s);
                };
                head.appendChild(script);
            },
            callback:function(event, script, s) {
                if (!script.readyState || /loaded|complete/.test(script.readyState) || event === "error") {
                    script.onerror = script.onload = script.onreadystatechange = null;
                    Je.remove(script);
                    if (s.type === "script" || event !== "error") {
                        s.success.call(s.context);
                    }
                }
            }
        }
    };
    rootJe = Je(document);
    window.Je = window.$ = window.jeQuery = $ = jeQuery = Je;
    // 支持amd和cmd(add at 2012.02.08)
    if (typeof define === "function") {
        if (define.amd) {
            define("Je", [], function() {
                return Je;
            });
        } else if (define.cmd) {
            define(function(require, exports, module) {
                return Je;
            });
        }
    }
})(window);
