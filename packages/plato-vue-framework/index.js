'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var fnBridge;
global._jsf = fnBridge = {
  _lazyCallableModules: {},
  _callFunctions: [],
  _callbackId: 1,
  _currentFunctionID: 1,
  execute: function execute (module, method, params) {
    var this$1 = this;

    var callbacks = [];
    this._callFunctions[this._currentFunctionID] = callbacks;
    var prepareParams = JSON.stringify(params, function (key, value) {
      if (typeof value === 'function') {
        callbacks[this$1._callbackId] = value;
        return this$1._callbackId++
      }
      return value
    });
    return global.callNative(this._currentFunctionID++, module, method, prepareParams)
  },

  cancel: function cancel (functionID) {
    this._callFunctions[functionID] = null;
  },

  invokeCallback: function invokeCallback (functionID, callbackID, keepAlive, args) {
    var callbacks = this._callFunctions[functionID];
    if (!callbacks) {
      return
    }
    if (keepAlive == 0) {
      this._callFunctions[functionID] = null;
    }
    var callback = callbacks[callbackID];
    if (!callback) {
      return
    }
    callback.apply(null, args);
  },

  registerCallableModule: function registerCallableModule (name, module) {
    this._lazyCallableModules[name] = function () { return module; };
  },

  getCallableModule: function getCallableModule (name) {
    var getValue = this._lazyCallableModules[name];
    return getValue ? getValue() : null
  },

  callFunction: function callFunction (moduleName, methodName, args) {
    var module = this.getCallableModule(moduleName);
    if (typeof module === 'undefined' || module == null) {
      return
    }
    var method = module[methodName];
    if (typeof method === 'undefined' || method == null) {
      return
    }
    return method.apply(module, args)
  }
};

var nextNodeRef = 1;
function uniqueId () {
  return nextNodeRef++
}
var docMap = {};

function sendBody (doc, node) {
  var body = node.toJSON();
  if (global.Native.document) {
    Native.document.createBody(node.docId, body);
  }
}

function addDoc (id, doc) {
  if (id) {
    docMap[id] = doc;
  }
}

function getDoc (id) {
  return docMap[id]
}

function removeDoc (id) {
  delete docMap[id];
}

function nextElement (node) {
  while (node) {
    if (node.nodeType === 1) {
      return node
    }
    node = node.nextSibling;
  }
}

function previousElement (node) {
  while (node) {
    if (node.nodeType === 1) {
      return node
    }
    node = node.previousSibling;
  }
}

function insertIndex (target, list, newIndex, changeSibling) {
  /* istanbul ignore next */
  if (newIndex < 0) {
    newIndex = 0;
  }
  var before = list[newIndex - 1];
  var after = list[newIndex];
  list.splice(newIndex, 0, target);
  if (changeSibling) {
    before && (before.nextSibling = target);
    target.previousSibling = before;
    target.nextSibling = after;
    after && (after.previousSibling = target);
  }
  return newIndex
}

function moveIndex (target, list, newIndex, changeSibling) {
  var index = list.indexOf(target);
  /* istanbul ignore next */
  if (index < 0) {
    return -1
  }
  if (changeSibling) {
    var before = list[index - 1];
    var after = list[index + 1];
    before && (before.nextSibling = after);
    after && (after.previousSibling = before);
  }
  list.splice(index, 1);
  var newIndexAfter = newIndex;
  if (index <= newIndex) {
    newIndexAfter = newIndex - 1;
  }
  var beforeNew = list[newIndexAfter - 1];
  var afterNew = list[newIndexAfter];
  list.splice(newIndexAfter, 0, target);
  if (changeSibling) {
    beforeNew && (beforeNew.nextSibling = target);
    target.previousSibling = beforeNew;
    target.nextSibling = afterNew;
    afterNew && (afterNew.previousSibling = target);
  }
  if (index === newIndexAfter) {
    return -1
  }
  return newIndex
}

function removeIndex (target, list, changeSibling) {
  var index = list.indexOf(target);
  /* istanbul ignore next */
  if (index < 0) {
    return
  }
  if (changeSibling) {
    var before = list[index - 1];
    var after = list[index + 1];
    before && (before.nextSibling = after);
    after && (after.previousSibling = before);
  }
  list.splice(index, 1);
}

function linkParent (node, parent) {
  node.parentNode = parent;
  if (parent.docId) {
    node.docId = parent.docId;
    node.ownerDocument = parent.ownerDocument;
    node.ownerDocument.nodeMap[node.nodeId] = node;
    node.depth = parent.depth + 1;
  }
  node.children.forEach(function (child) {
    linkParent(child, node);
  });
}

function setBody (doc, el) {
  el.role = 'body';
  el.depth = 1;
  if (doc.nodeMap && doc.nodeMap[el.nodeId]) { delete doc.nodeMap[el.nodeId]; }
  el.ref = 1;
  doc.nodeMap._root = el;
  doc.body = el;
}

function appendBody (doc, node, before) {
  var documentElement = doc.documentElement;

  if (documentElement.pureChildren.length > 0 || node.parentNode) {
    return
  }
  var children = documentElement.children;
  var beforeIndex = children.indexOf(before);
  if (beforeIndex < 0) {
    children.push(node);
  } else {
    children.splice(beforeIndex, 0, node);
  }

  if (node.nodeType === 1) {
    if (node.role === 'body') {
      node.docId = doc.id;
      node.ownerDocument = doc;
      node.parentNode = documentElement;
      linkParent(node, documentElement);
    } else {
      node.children.forEach(function (child) {
        child.parentNode = node;
      });
      setBody(doc, node);
      node.docId = doc.id;
      node.ownerDocument = doc;
      linkParent(node, documentElement);
      delete doc.nodeMap[node.nodeId];
    }
    documentElement.pureChildren.push(node);
    sendBody(doc, node);
  } else {
    // 这种情况应该不会出现, NodeType 8 comment
    node.parentNode = documentElement;
    doc.nodeMap[node.ref] = node;
  }
}

var BUBBLE_EVENTS = [
  'click', 'longpress', 'touchstart', 'touchmove', 'touchend'
];
var DEFAULT_TAG_NAME = 'div';
var AnimationArr = [];
function registerNode (docId, node) {
  var doc = getDoc(docId);
  doc.nodeMap[node.nodeId] = node;
}

var Element = function Element (type, props) {
  if ( type === void 0 ) type = DEFAULT_TAG_NAME;
  if ( props === void 0 ) props = {};

  this.nodeType = 1;
  this.nodeId = uniqueId();
  this.ref = this.nodeId;
  this.type = type;
  this.attributes = props.attributes || {};
  this.style = props.style || {};
  this.classStyle = props.classStyle || {};
  this.event = {};

  this.children = [];
  this.pureChildren = [];

  this.parentNode = null;
  this.nextSibling = null;
  this.previousSibling = null;
};

Element.prototype.destroy = function destroy () {
  var doc = getDoc(this.docId);
  if (doc) {
    delete this.docId;
    delete doc.nodeMap[this.nodeId];
  }
  this.children.forEach(function (child) {
    child.destroy();
  });
};
Element.prototype.appendChild = function appendChild (node) {
  if (node.parentNode && node.parentNode !== this) {
    return
  }
  /* istanbul ignore else */
  if (!node.parentNode) {
    linkParent(node, this);
    insertIndex(node, this.pureChildren, this.pureChildren.length, true);
    if (this.docId) {
      registerNode(this.docId, node);
    }
    if (node.nodeType === 1) {
      if (Native.document) {
        Native.document.addElement(this.docId, this.ref, node.toJSON(), -1);
      }
    }
  } else {
    moveIndex(node, this.children, this.children.length, true);
    if (node.nodeType === 1) {
      var index = moveIndex(node, this.pureChildren, this.pureChildren.length);
      if (Native.document) {
        Native.document.moveElement(this.docId, node.ref, this.ref, index);
      }
    }
  }
};
Element.prototype.insertBefore = function insertBefore (node, before) {
  if (node.parentNode && node.parentNode !== this) {
    return
  }
  if (node === before || (node.nextSibling && node.nextSibling === before)) {
    return
  }
  if (!node.parentNode) {
    linkParent(node, this);
    insertIndex(node, this.children, this.children.indexOf(before), true);
    if (this.docId) {
      registerNode(this.docId, node);
    }
    if (node.nodeType === 1) {
      var pureBefore$1 = nextElement(before);
      var index = insertIndex(
        node,
        this.pureChildren,
        pureBefore$1
          ? this.pureChildren.indexOf(pureBefore$1)
          : this.pureChildren.length
      );
      if (Native.document) {
        Native.document.addElement(this.docId, this.ref, node.toJSON(), index);
      }
    }
  } else {
    moveIndex(node, this.children, this.children.indexOf(before), true);
    if (node.nodeType === 1) {
      var index$1 = insertIndex(
        node,
        this.pureChildren,
        pureBefore
          ? this.pureChildren.indexOf(pureBefore)
          : this.pureChildren.length
      );
      if (Native.document) {
        Native.document.addElement(this.docId, this.ref, node.toJSON(), index$1);
      }
    }
  }
};
Element.prototype.insertAfter = function insertAfter (node, after) {
  if (node.parentNode && node.parentNode !== this) {
    return
  }
  if (node === after || (node.previousSibling && node.previousSibling === after)) {
    return
  }
  if (!node.parentNode) {
    linkParent(node, this);
    insertIndex(node, this.children, this.children.indexOf(after) + 1, true);
    /* istanbul ignore else */
    if (this.docId) {
      registerNode(this.docId, node);
    }
    if (node.nodeType === 1) {
      var index = insertIndex(
        node,
        this.pureChildren,
        this.pureChildren.indexOf(previousElement(after)) + 1
      );
      if (Native.document) {
        Native.document.addElement(this.docId, this.ref, node.toJSON(), index);
      }
    }
  } else {
    moveIndex(node, this.children, this.children.indexOf(after) + 1, true);
    if (node.nodeType === 1) {
      var index$1 = moveIndex(
        node,
        this.pureChildren,
        this.pureChildren.indexOf(previousElement(after)) + 1
      );
      if (Native.document) {
        Native.document.addElement(this.docId, this.ref, node.toJSON(), index$1);
      }
    }
  }
};
Element.prototype.removeChild = function removeChild (node, preserved) {
  if (node.parentNode) {
    if (node.nodeType === 1) {
      removeIndex(node, this.pureChildren);
      if (Native.document) {
        Native.document.removeElement(this.docId, node.ref);
      }
    }
  }
  if (!preserved) {
    node.destroy();
  }
};
Element.prototype.clear = function clear () {
    var this$1 = this;

  if (Native.document) {
    this.pureChildren.forEach(function (node) {
      Native.document.removeElement(this$1.docId, node.ref);
    });
  }
  this.children.forEach(function (node) {
    node.destroy();
  });
  this.pureChildren.length = 0;
};
// 这里slient代表什么呢?
Element.prototype.setAttr = function setAttr (key, value, silent) {
  if (this.attributes[key] === value && silent !== false) {
    return
  }
  this.attributes[key] = value;
  if (!silent && Native.document && this.docId) {
    var result = {};
    result[key] = value;
    Native.document.setAttr(this.docId, this.ref, result);
  }
};
// setAttrs (batchedAttrs, silent) {
// // 批量setAtribute先不做吧
// return
// }
Element.prototype.removeAttribute = function removeAttribute (key) {
  if (this.attributes[key]) {
    delete this.attributes[key];
  }
};
Element.prototype.setStyle = function setStyle (key, value, silent) {
  if (this.style[key] === value && silent !== false) {
    return
  }
  this.style[key] = value;
  // 这里有一个可能是隐患的东西， this.docId来判断
  if (!silent && Native.document && this.docId) {
    var result = {};
    result[key] = value;
    Native.document.setStyles(this.docId, this.ref, result);
  }
};
// 这里如果有就有问题。
// setStyles (batchedAttrs, silent) {
// // 批量setStyles先不做吧
// console.log('这里没有做哦')
// return
// }
Element.prototype.setClassStyle = function setClassStyle (classStyle) {
    var this$1 = this;

  // reset previous class style to empty string
  for (var key in this$1.classStyle) {
    this$1.classStyle[key] = '';
  }

  Object.assign(this.classStyle, classStyle);
  if (Native.document) {
    Native.document.setStyles(this.docId, this.ref, this.toStyle());
  }
};
// params参数是干嘛的
Element.prototype.addEvent = function addEvent (type, handler, params) {
  if (!this.event) {
    this.event = {};
  }
  if (!this.event[type]) {
    this.event[type] = {
      handler: handler,
      params: params
    };
    // 这里有一个可能是隐患的东西， this.docId来判断
    if (Native.document && this.docId) {
      Native.document.addEvent(this.docId, this.ref, type);
    }
  }
};

Element.prototype.removeEvent = function removeEvent (type) {
  if (this.event && this.event[type]) {
    delete this.event[type];
    if (Native.document) {
      Native.document.removeEvent(this.docId, this.ref, type);
    }
  }
};

Element.prototype.fireEvent = function fireEvent (type, event, isBubble, options) {
  var result = null;
  var isStopPropagation = false;
  var eventDesc = this.event[type];
  if (eventDesc && event) {
    var handler = eventDesc.handler;
    event.stopPropagation = function () {
      isStopPropagation = true;
    };
    if (options && options.params) {
      result = handler.call.apply(handler, [ this ].concat( options.params, [event] ));
    } else {
      result = handler.call(this, event);
    }
  }

  if (!isStopPropagation &&
			isBubble &&
			(BUBBLE_EVENTS.indexOf(type) !== -1) &&
			this.parentNode &&
			this.parentNode.fireEvent) {
    event.currentTarget = this.parentNode;
    this.parentNode.fireEvent(type, event, isBubble); // no options
  }
  return result
};

Element.prototype.toStyle = function toStyle () {
  return Object.assign({}, this.classStyle, this.style)
};
Element.prototype.regKeyframe = function regKeyframe (keyframe) {
  if (keyframe == null)
    { return; }
  var name = Object.keys(keyframe)[0];
  if (AnimationArr.includes(name))
    { return; }
  AnimationArr.push(name);
  Native.document.addKeyframeMap(this.docId, keyframe);
};

Element.prototype.addKeyframe = function addKeyframe (frames) {
    var this$1 = this;

  for (var i = 0; i < frames.length; i++) {
      Native.document.addKeyframe(this$1.docId, frames[i]);
  }
};
Element.prototype.playKeyframe = function playKeyframe (keyframe, animation) {
    var key = Object.keys(animation)[0];
    var value = animation[key];
    this.regKeyframe(keyframe);
    this.setStyle(key, value);
    Native.document.updateFinish(this.docId);  
};

Element.prototype.toJSON = function toJSON () {
    var this$1 = this;

  var result = {
    id: this.ref,
    docId: this.docId || -10000,
    attributes: this.attributes ? this.attributes : {}
  };
  // 切换一些支持的type
  switch (this.type) {
    case 'div':
      result.type = 'view';
      break
    case 'p':
    case 'span':
      result.type = 'text';
      break
    case 'img':
      result.type = 'image';
      break
    default:
      result.type = this.type;
  }
  var styleObj = this.toStyle();
  if (!result.attributes.style) { result.attributes.style = {}; }

  Object.assign(result.attributes.style, styleObj);

  var event = [];
  for (var type in this$1.event) {
    var ref = this$1.event[type];
      var params = ref.params;
    if (!params) {
      event.push(type);
    } else {
      event.push({
        type: type,
        params: params
      });
    }
  }
  if (event.length) {
    result.event = event;
  }
  if (this.pureChildren.length) {
    result.children = this.pureChildren.map(function (child) { return child.toJSON(); });
  }
  return result
};

var Comment = function Comment (value) {
  this.nodeId = uniqueId();
  this.parentNode = null;
  this.nextSibling = null;
  this.previousSibling = null;

  this.nodeType = 8;
  this.nodeId = uniqueId();
  this.ref = this.nodeId;
  this.type = 'comment';
  this.value = value;
  this.children = [];
  this.pureChildren = [];
};

/**
 * Convert to HTML comment string.
 * @return {stirng} html
 */
Comment.prototype.toString = function toString () {
  return '<!-- ' + this.value + ' -->'
};
Comment.prototype.destroy = function destroy () {
  var doc = getDoc(this.docId);
  if (doc) {
    delete this.docId;
    delete doc.nodeMap[this.nodeId];
  }
  this.children.forEach(function (child) {
    child.destroy();
  });
};

function updateElement (el, changes) {
  var attrs = changes.attrs || {};
  for (var name in attrs) {
    el.setAttr(name, attrs[name], true);
  }
  var style = changes.style || {};
  for (var name$1 in style) {
    el.setStyle(name$1, style[name$1], true);
  }
}

var Document = function Document (id) {
  id = id || 0;
  this.id = id;
  this.nodeMap = {};
  addDoc(id, this);
  this.createDocumentElement();
};

Document.prototype.getRef = function getRef (ref) {
  return this.nodeMap[ref]
};

Document.prototype.createDocumentElement = function createDocumentElement () {
    var this$1 = this;

  if (!this.documentElement) {
    var el = new Element('document');
    el.docId = this.id;
    el.ownerDocument = this;
    el.role = 'documentElement';
    el.depth = 0;
    el.ref = '_documentElement';
    this.nodeMap._documentElement = el;
    this.documentElement = el;
    Object.defineProperty(el, 'appendChild', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: function (node) {
        appendBody(this$1, node);
      }
    });

    Object.defineProperty(el, 'insertBefore', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: function (node, before) {
        appendBody(this$1, node, before);
      }
    });
  }

  return this.documentElement
};

Document.prototype.createBody = function createBody (type, props) {
  if (!this.body) {
    var el = new Element(type, props);
    setBody(this, el);
  }

  return this.body
};

Document.prototype.createElement = function createElement (tagName, props) {
  return new Element(tagName, props)
};
// 这个看看能不能用到
Document.prototype.fireEvent = function fireEvent (el, type, event, domChanges, options) {
  if (!el) {
    return
  }
  event = event || {};
  event.type = event.type || type;
  event.target = el;
  event.currentTarget = el;
  event.timestamp = Date.now();
  if (domChanges) {
    updateElement(el, domChanges);
  }
  var isBubble = this.getRef('_root').attributes['bubble'] === 'true';
  return el.fireEvent(type, event, isBubble, options)
};
Document.prototype.destroy = function destroy () {
  delete this.listener;
  delete this.nodeMap;
  removeDoc(this.id);
};
Document.prototype.createComment = function createComment (text) {
  return new Comment(text)
};

var VueFactory = require('./factory');
global.Native = {};
global.Api = {
  Document: Document,
  Element: Element
};

// 测试专用
global.nativeTestModules = [{
  'module': 'document',
  'moduleId': 0,
  'methods': [{
    'method': 'removeElement',
    'methodId': 0
  }, {
    'method': 'moveElement',
    'methodId': 1
  }, {
    'method': 'addElement',
    'methodId': 2
  }, {
    'method': 'setStyles',
    'methodId': 3
  }, {
    'method': 'removeEvent',
    'methodId': 4
  }, {
    'method': 'setAttr',
    'methodId': 5
  }, {
    'method': 'updateFinish',
    'methodId': 6
  }, {
    'method': 'removeAttr',
    'methodId': 7
  }, {
    'method': 'addKeyframe',
    'methodId': 8
  }, {
    'method': 'addElementById',
    'methodId': 9
  }, {
    'method': 'scrollTo',
    'methodId': 10
  }, {
    'method': 'createElement',
    'methodId': 11
  }, {
    'method': 'createBody',
    'methodId': 12
  }, {
    'method': 'addEvent',
    'methodId': 13
  }, {
    'method': 'addKeyframeMap',
    'methodId': 14
  }, {
    'method': 'createFinish',
    'methodId': 15
  }]
}, {
  'module': 'CanvasModule',
  'moduleId': 1,
  'methods': [{
    'method': 'unlockCanvas',
    'methodId': 0
  }, {
    'method': 'lockCanvas',
    'methodId': 1
  }, {
    'method': 'clearRect',
    'methodId': 2
  }, {
    'method': 'drawImage',
    'methodId': 3
  }, {
    'method': 'fillText',
    'methodId': 4
  }]
}, {
  'module': 'Timer',
  'moduleId': 2,
  'methods': [{
    'method': 'setInterval',
    'methodId': 0
  }, {
    'method': 'clearInterval',
    'methodId': 1
  }, {
    'method': 'setTimeout',
    'methodId': 2
  }, {
    'method': 'clearTimeout',
    'methodId': 3
  }]
}, {
  'module': 'Networking',
  'moduleId': 3,
  'methods': [{
    'method': 'clearCookies',
    'methodId': 0
  }, {
    'method': 'abortRequest',
    'methodId': 1
  }, {
    'method': 'request',
    'methodId': 2
  }]
}, {
  'module': 'localStorage',
  'moduleId': 4,
  'methods': [{
    'method': 'getItem',
    'methodId': 0
  }, {
    'method': 'setItem',
    'methodId': 1
  }]
}];

function init (cfg) {
  global.Native.document = cfg.document;
  global.Native.CanvasModule = cfg.CanvasModule;
  global.Native.Timer = cfg.Timer;
  global.Native.Networking = cfg.Networking;
  global.Native.localStorage = cfg.localStorage;

  initNativeLog();
  initTimer();
}

function initNativeLog (argument) {
  if (typeof window !== 'object' && typeof global.nativeLog !== 'undefined') {
    global.console = {
      log: function (message) {
        global.nativeLog(2, message);
      },
      debug: function (message) {
        global.nativeLog(3, message);
      },
      info: function (message) {
        global.nativeLog(4, message);
      },
      warn: function (message) {
        global.nativeLog(5, message);
      },
      error: function (message) {
        global.nativeLog(6, message);
      }
    };
  }
}

function initTimer (argument) {
  var _timerId = 0;
  if (typeof setTimeout === 'undefined' || typeof clearTimeout === 'undefined') {
    global.setTimeout = function (func, millsSec) {
      var timerId = _timerId++;
      global.Native.Timer.setTimeout(timerId, func, millsSec);
      return timerId
    };
    global.clearTimeout = function (timerId) {
      global.Native.Timer.clearTimeout(timerId);
    };
  }

  if (typeof setInterval === 'undefined' || typeof clearInterval === 'undefined') {
    global.setInterval = function (func, millsSec) {
      var timerId = _timerId++;
      global.Native.Timer.setInterval(timerId, func, millsSec);
      return timerId
    };
    global.clearInterval = function (timerId) {
      global.Native.Timer.clearInterval(timerId);
    };
  }
}
// 这里必须提前运行
function loadNativeModules () {
  var nativeModules;
  var res = {};
  if (process.env.TEST) {
    nativeModules = global.nativeTestModules;
  } else {
    nativeModules = global.loadNativeModules();
    if (!nativeModules) {
      global.console.log('no 测试环境, no Native');
      return
    }
  }
  if (typeof nativeModules === 'string') {
    nativeModules = JSON.parse(nativeModules);
  }
  var loop = function ( moduleIndex ) {
    var moduleDesc = nativeModules[moduleIndex];
    var module = {};
    if (typeof moduleDesc.methods !== 'undefined') {
      var loop$1 = function ( methodIndex ) {
        var methodDesc = moduleDesc.methods[methodIndex];
        module[methodDesc.method] = function () {
          var args = [], len = arguments.length;
          while ( len-- ) args[ len ] = arguments[ len ];

          if (process.env.TEST) {
            global.console.log('调用Native方法');
            global.console.log(moduleDesc.moduleId, methodDesc.methodId, args);
            return
          }
          global.console.log(moduleDesc.module);
          global.console.log(methodDesc.method);
          global.console.log(JSON.stringify(args));
          return fnBridge.execute(moduleDesc.moduleId, methodDesc.methodId, args)
        };
      };

      for (var methodIndex in moduleDesc.methods) loop$1( methodIndex );
    }
    // 加载module
    res[moduleDesc.module] = module;
  };

  for (var moduleIndex in nativeModules) loop( moduleIndex );
  init(res);
}

// 这里相当于registerApp

function createInstance (appKey, docId, app) {
  var instances = {};
  var context = {};
  context[appKey] = {};
  context[appKey].document = new Document(docId);

  var exports = {};
  VueFactory(exports, context[appKey].document);
  var Vue = exports.Vue;

  Vue.prototype.$document = context[appKey].document;

  var instanceVars = Object.assign({
    Vue: Vue,
    global: {
      process: {
        env: {
          VUE_ENV: 'PLATO'
        }
      }
    },
    document: context[appKey].document,
    app: app
  });
  var AppRegistry = {
    registerComponent: function (appKey, appCode) {
      instances[appKey] = {
        run: function () {
          // 这里直接执行就ok
          var globalKeys = [];
          var globalValues = [];
          for (var key in instanceVars) {
            globalKeys.push(key);
            globalValues.push(instanceVars[key]);
          }
          var fn = new (Function.prototype.bind.apply( Function, [ null ].concat( globalKeys, [appCode]) ));
          fn.apply(void 0, globalValues);
        }
      };
      if (process.env.TEST) {
        setTimeout(function () {
          var instance = instances[appKey];
          instance.run();
        }, 0);
      }
      return appKey
    },
    runApplication: function (appKey) {
      var instance = instances[appKey];
      instance.run();
    }
  };
  if (!process.env.TEST) {
    fnBridge.registerCallableModule('AppRegistry', AppRegistry);
  }
  // 事件中枢
  createEventCenter(docId);
  Vue.mixin({
    beforeCreate: function beforeCreate () {},
    mounted: function mounted () {
      if (!this.$parent) { global.Native.document.updateFinish(docId); }
    },
    updated: function updated () {
      global.Native.document.updateFinish(docId);
    }
  });
  return AppRegistry
}

function createEventCenter (docId) {
  var EventCenter = {
    fireEvent: function (docId, id, type, evt) {
      console.log('2', '触发事件了');
      console.log('2', docId);
      getDoc(docId).fireEvent(getDoc(docId).nodeMap[id], type, evt);
    }
  };
  if (!process.env.TEST) {
    fnBridge.registerCallableModule('EventCenter', EventCenter);
  } else {
    setTimeout(function () {
      console.log('事件测试');
      EventCenter.fireEvent(docId, 5, 'click', {});
    }, 2000);
  }
}

exports.loadNativeModules = loadNativeModules;
exports.createInstance = createInstance;
