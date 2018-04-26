'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var fnBridge;
global._jsf = fnBridge = {
    _lazyCallableModules : {},
    _callFunctions : [],
    _callbackId : 1,
    _currentFunctionID : 1,
    execute: function execute(module, method, params) {
        var this$1 = this;

        var callbacks = [];
        this._callFunctions[this._currentFunctionID] = callbacks;
        var prepareParams = JSON.stringify(params, function (key, value) {
            if (typeof value === 'function') {
                callbacks[this$1._callbackId] = value;
                return this$1._callbackId++;
            }
            return value;
        });
        return global.callNative(this._currentFunctionID++, module, method, prepareParams);
    },

    cancel: function cancel(functionID) {
        this._callFunctions[functionID] = null;
    },

    invokeCallback: function invokeCallback(functionID, callbackID, keepAlive, args) {
        var callbacks = this._callFunctions[functionID];
        if (!callbacks) {
            return;
        }
        if (keepAlive == 0) {
            this._callFunctions[functionID] = null;
        }
        var callback = callbacks[callbackID];
        if (!callback) {
            return;
        }
        callback.apply(null, args);
    },

    registerCallableModule: function registerCallableModule(name, module) {
        this._lazyCallableModules[name] = function () { return module; };
    },

    getCallableModule: function getCallableModule(name) {
        var getValue = this._lazyCallableModules[name];
        return getValue ? getValue() : null;
    },

    callFunction: function callFunction(moduleName, methodName, args) {
        var module = this.getCallableModule(moduleName);
        if (typeof module === 'undefined' || module == null) {
            return;
        }
        var method = module[methodName];
        if (typeof method === 'undefined' || method == null) {
            return;
        }
        return method.apply(module, args);
    }
};

function proxyDocument(document) {

}

var VueFactory = require('./factory');

global.Native = {};
// 测试专用
global.nativeTestModules = [{
	"module": "document",
	"moduleId": 0,
	"methods": [{
		"method": "removeElement",
		"methodId": 0
	}, {
		"method": "moveElement",
		"methodId": 1
	}, {
		"method": "addElement",
		"methodId": 2
	}, {
		"method": "setStyles",
		"methodId": 3
	}, {
		"method": "removeEvent",
		"methodId": 4
	}, {
		"method": "setAttr",
		"methodId": 5
	}, {
		"method": "updateFinish",
		"methodId": 6
	}, {
		"method": "removeAttr",
		"methodId": 7
	}, {
		"method": "addKeyframe",
		"methodId": 8
	}, {
		"method": "addElementById",
		"methodId": 9
	}, {
		"method": "scrollTo",
		"methodId": 10
	}, {
		"method": "createElement",
		"methodId": 11
	}, {
		"method": "createBody",
		"methodId": 12
	}, {
		"method": "addEvent",
		"methodId": 13
	}, {
		"method": "addKeyframeMap",
		"methodId": 14
	}, {
		"method": "createFinish",
		"methodId": 15
	}]
}, {
	"module": "CanvasModule",
	"moduleId": 1,
	"methods": [{
		"method": "unlockCanvas",
		"methodId": 0
	}, {
		"method": "lockCanvas",
		"methodId": 1
	}, {
		"method": "clearRect",
		"methodId": 2
	}, {
		"method": "drawImage",
		"methodId": 3
	}, {
		"method": "fillText",
		"methodId": 4
	}]
}, {
	"module": "Timer",
	"moduleId": 2,
	"methods": [{
		"method": "setInterval",
		"methodId": 0
	}, {
		"method": "clearInterval",
		"methodId": 1
	}, {
		"method": "setTimeout",
		"methodId": 2
	}, {
		"method": "clearTimeout",
		"methodId": 3
	}]
}, {
	"module": "Networking",
	"moduleId": 3,
	"methods": [{
		"method": "clearCookies",
		"methodId": 0
	}, {
		"method": "abortRequest",
		"methodId": 1
	}, {
		"method": "request",
		"methodId": 2
	}]
}, {
	"module": "localStorage",
	"moduleId": 4,
	"methods": [{
		"method": "getItem",
		"methodId": 0
	}, {
		"method": "setItem",
		"methodId": 1
	}]
}];
function init(cfg) {
	global.Native.document = cfg.document;
	global.Native.CanvasModule = cfg.CanvasModule;
	global.Native.Timer = cfg.Timer;
	global.Native.Networking = cfg.Networking;
	global.Native.localStorage = cfg.localStorage;

	initNativeLog();
	initTimer();
}

function initNativeLog(argument) {
	if (typeof window != 'object' && typeof global.nativeLog !== 'undefined') {
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

function initTimer(argument) {
	var _timerId = 0;
	if (typeof setTimeout === 'undefined' || typeof clearTimeout === 'undefined') {
		global.setTimeout = function (func, millsSec) {
			var timerId = _timerId++;
			global.Native.Timer.setTimeout(timerId, func, millsSec);
			return timerId;
		};
		global.clearTimeout = function (timerId) {
			global.Native.Timer.clearTimeout(timerId);
		};
	}

	if (typeof setInterval === 'undefined' || typeof clearInterval === 'undefined') {
		global.setInterval = function (func, millsSec) {
			var timerId = _timerId++;
			global.Native.Timer.setInterval(timerId, func, millsSec);
			return timerId;
		};
		global.clearInterval = function (timerId) {
			global.Native.Timer.clearInterval(timerId);
		};
	}
}
// 这里必须提前运行
function loadNativeModules() {
	var nativeModules;
	if (process.env.TEST) {
		nativeModules = global.nativeTestModules;
	} else {
		nativeModules = global.loadNativeModules();
		if(!nativeModules) {
			console.log("no 测试环境, no Native");
			return;
		}
	}
	if (typeof nativeModules === 'string') {
		nativeModules = JSON.parse(nativeModules);
	}
	var loop = function ( moduleIndex ) {
		var moduleDesc = nativeModules[moduleIndex];
		var module = {};
		if (typeof moduleDesc.methods !== "undefined") {
			var loop$1 = function ( methodIndex ) {
				var methodDesc = moduleDesc.methods[methodIndex];
				module[methodDesc.method] = function () {
					var args = [], len = arguments.length;
					while ( len-- ) args[ len ] = arguments[ len ];

					return fnBridge.execute(moduleDesc.moduleId, methodDesc.methodId, args);
				};
			};

			for (var methodIndex in moduleDesc.methods) loop$1( methodIndex );
		}
		// 加载module
		init(module);
	};

	for (var moduleIndex in nativeModules) loop( moduleIndex );
}

// 这里相当于registerApp
function createInstance(appKey, appCode) {
	VueFactory(exports, global.Native.document);
	var Vue = exports.Vue;
	var instances = {};
	var instanceVars = Object.assign({
		Vue: Vue,
		process: {},
		document: proxyDocument(platoDocument)
	});
	var AppRegistry = {
		registerComponent: function(appKey) {
			instances[appKey] = {
				run: function() {
					// 这里直接执行就ok
					var globalKeys = [];
					var globalValues = [];
					for (var key in globalObjects) {
						globalKeys.push(key);
						globalValues.push(globalObjects[key]);
					}
					var fn = new (Function.prototype.bind.apply( Function, [ null ].concat( globalKeys, [appCode]) ));
					fn.apply(void 0, globalValues);
				}
			};
			return appKey;
		},
		runApplication: function(appKey) {
			var instance = instances[appKey];
			instance.run();
		}
	};
	if(process.env.TEST) {

		AppRegistry.registerComponent(appKey);
		setTimeout(function () {
			var instance = instances[appKey];
			instance.run();
		},0);
	} else {
		fnBridge.registerCallableModule('AppRegistry', AppRegistry);
	}
	
	Vue.mixin({
		beforeCreate: function beforeCreate() {
		},
		mounted: function mounted() {
			global.Native.document.createFinish(appKey, options.doc.body.toJSON());
		}
	});
}

exports.loadNativeModules = loadNativeModules;
exports.createInstance = createInstance;
