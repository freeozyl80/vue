import fnBridge from './bridge.js';

let Native;

const instances = {}

function init(cfg) {
	Native.document = cfg.document;
	Native.CanvasModule = cfg.CanvasModule;
	Native.Timer = cfg.Timer;
	Native.Networking = cfg.Networking;
	Native.localStorage = cfg.localStorage;

	initNativeLog();
	initTimer();
}

function initNativeLog(argument) {
	if (typeof window != 'object' && global.nativeLog !== 'undefined') {
		global.console = {
			log: (message) => {
				global.nativeLog(2, message);
			},
			debug: (message) => {
				global.nativeLog(3, message);
			},
			info: (message) => {
				global.nativeLog(4, message);
			},
			warn: (message) => {
				global.nativeLog(5, message);
			},
			error: (message) => {
				global.nativeLog(6, message);
			}
		}
	}
}

function initTimer(argument) {
	let _timerId = 0;
	if (typeof setTimeout === 'undefined' || typeof clearTimeout === 'undefined') {
		global.setTimeout = (func, millsSec) => {
			const timerId = _timerId++;
			Native.Timer.setTimeout(timerId, func, millsSec);
			return timerId;
		};
		global.clearTimeout = (timerId) => {
			Native.Timer.clearTimeout(timerId);
		};
	}

	if (typeof setInterval === 'undefined' || typeof clearInterval === 'undefined') {
		global.setInterval = (func, millsSec) => {
			const timerId = _timerId++;
			Native.Timer.setInterval(timerId, func, millsSec);
			return timerId;
		};
		global.clearInterval = (timerId) => {
			Native.Timer.clearInterval(timerId);
		};
	}
}

function loadNativeModules() {
	let nativeModules = global.loadNativeModules();
	if (typeof nativeModules === 'string') {
		nativeModules = JSON.parse(nativeModules);
	}
	for (const moduleIndex in nativeModules) {
		const moduleDesc = nativeModules[moduleIndex];
		const module = {};
		if (typeof moduleDesc.methods !== "undefined") {
			for (const methodIndex in moduleDesc.methods) {
				const methodDesc = moduleDesc.methods[methodIndex];
				module[methodDesc.method] = (...args) => {
					return fnBridge.execute(moduleDesc.moduleId, methodDesc.methodId, args);
				};
			}
		}
		// 加载module
		init(module);
	}
}

// 这里相当于registerApp
function createInstance(appKey, appCode) {
	const instanceVars = Object.assign({
		Vue,
		process: {},
		document: {}
	})
	const AppRegistry = {
		registerComponent: function(appKey) {
			instances[appKey] = {
				run: function() {
					// 这里直接执行就ok
					const globalKeys = []
					const globalValues = []
					for (const key in globalObjects) {
						globalKeys.push(key)
						globalValues.push(globalObjects[key])
					}
					let fn = new Function(...globalKeys, appCode);
					fn(...globalValues);
				}
			}
			return appKey;
		},

		runApplication: function(appKey) {
			const instance = instances[appKey];
			instance.run();
		}
	}
	fnBridge.registerCallableModule('AppRegistry', AppRegistry)
}