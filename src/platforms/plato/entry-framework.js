import {
  fnBridge
} from './bridge.js'
import {
  proxyDocument
} from './document.js'
const VueFactory = require('./factory')

global.Native = {}
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
}]
const instances = {}

function init (cfg) {
  global.Native.document = cfg.document
  global.Native.CanvasModule = cfg.CanvasModule
  global.Native.Timer = cfg.Timer
  global.Native.Networking = cfg.Networking
  global.Native.localStorage = cfg.localStorage

  initNativeLog()
  initTimer()
}

function initNativeLog (argument) {
  if (typeof window !== 'object' && typeof global.nativeLog !== 'undefined') {
    global.console = {
      log: (message) => {
        global.nativeLog(2, message)
      },
      debug: (message) => {
        global.nativeLog(3, message)
      },
      info: (message) => {
        global.nativeLog(4, message)
      },
      warn: (message) => {
        global.nativeLog(5, message)
      },
      error: (message) => {
        global.nativeLog(6, message)
      }
    }
  }
}

function initTimer (argument) {
  let _timerId = 0
  if (typeof setTimeout === 'undefined' || typeof clearTimeout === 'undefined') {
    global.setTimeout = (func, millsSec) => {
      const timerId = _timerId++
      global.Native.Timer.setTimeout(timerId, func, millsSec)
      return timerId
    }
    global.clearTimeout = (timerId) => {
      global.Native.Timer.clearTimeout(timerId)
    }
  }

  if (typeof setInterval === 'undefined' || typeof clearInterval === 'undefined') {
    global.setInterval = (func, millsSec) => {
      const timerId = _timerId++
      global.Native.Timer.setInterval(timerId, func, millsSec)
      return timerId
    }
    global.clearInterval = (timerId) => {
      global.Native.Timer.clearInterval(timerId)
    }
  }
}
// 这里必须提前运行
export function loadNativeModules () {
  let nativeModules
  if (process.env.TEST) {
    nativeModules = global.nativeTestModules
  } else {
    nativeModules = global.loadNativeModules()
    if (!nativeModules) {
      console.log('no 测试环境, no Native')
      return
    }
  }
  if (typeof nativeModules === 'string') {
    nativeModules = JSON.parse(nativeModules)
  }
  for (const moduleIndex in nativeModules) {
    const moduleDesc = nativeModules[moduleIndex]
    const module = {}
    if (typeof moduleDesc.methods !== 'undefined') {
      for (const methodIndex in moduleDesc.methods) {
        const methodDesc = moduleDesc.methods[methodIndex]
        module[methodDesc.method] = (...args) => {
          return fnBridge.execute(moduleDesc.moduleId, methodDesc.methodId, args)
        }
      }
    }
    // 加载module
    init(module)
  }
}

// 这里相当于registerApp
export function createInstance (appKey, appCode) {
  VueFactory(exports, global.Native.document)
  const Vue = exports.Vue
  const instances = {}
  const instanceVars = Object.assign({
    Vue,
    process: {},
    document: proxyDocument(platoDocument)
  })
  const AppRegistry = {
    registerComponent: function (appKey) {
      instances[appKey] = {
        run: function () {
          // 这里直接执行就ok
          const globalKeys = []
          const globalValues = []
          for (const key in globalObjects) {
            globalKeys.push(key)
            globalValues.push(globalObjects[key])
          }
          const fn = new Function(...globalKeys, appCode)
          fn(...globalValues)
        }
      }
      return appKey
    },
    runApplication: function (appKey) {
      const instance = instances[appKey]
      instance.run()
    }
  }
  if (process.env.TEST) {
    AppRegistry.registerComponent(appKey)
    setTimeout(() => {
      const instance = instances[appKey]
      instance.run()
    }, 0)
  } else {
    fnBridge.registerCallableModule('AppRegistry', AppRegistry)
  }

  Vue.mixin({
    beforeCreate () {
    },
    mounted () {
      global.Native.document.createFinish(appKey, options.doc.body.toJSON())
    }
  })
}

