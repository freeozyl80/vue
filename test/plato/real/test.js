(function (global) {
  global.nativeLog('2', '开始运行了')
  /*
   *** start
   */
  let fnBridge
  global._jsf = fnBridge = {
    _lazyCallableModules: {},
    _callFunctions: [],
    _callbackId: 1,
    _currentFunctionID: 1,
    execute (module, method, params) {
      const callbacks = []
      this._callFunctions[this._currentFunctionID] = callbacks
      const prepareParams = JSON.stringify(params, (key, value) => {
        if (typeof value === 'function') {
          callbacks[this._callbackId] = value
          return this._callbackId++
        }
        return value
      })
      return global.callNative(this._currentFunctionID++, module, method, prepareParams)
    },

    cancel (functionID) {
      this._callFunctions[functionID] = null
    },

    invokeCallback (functionID, callbackID, keepAlive, args) {
      const callbacks = this._callFunctions[functionID]
      if (!callbacks) {
        return
      }
      if (keepAlive == 0) {
        this._callFunctions[functionID] = null
      }
      const callback = callbacks[callbackID]
      if (!callback) {
        return
      }
      callback.apply(null, args)
    },

    registerCallableModule (name, module) {
      this._lazyCallableModules[name] = () => module
    },

    getCallableModule (name) {
      const getValue = this._lazyCallableModules[name]
      return getValue ? getValue() : null
    },

    callFunction (moduleName, methodName, args) {
      const module = this.getCallableModule(moduleName)
      if (typeof module === 'undefined' || module == null) {
        return
      }
      const method = module[methodName]
      if (typeof method === 'undefined' || method == null) {
        return
      }
      return method.apply(module, args)
    }
  }
  /*
   *** end
   */

  global.Native = {}

  function init (cfg) {
    global.Native.document = cfg.document
    global.Native.CanvasModule = cfg.CanvasModule
    global.Native.Timer = cfg.Timer
    global.Native.Networking = cfg.Networking
    global.Native.localStorage = cfg.localStorage
  }

  (function () {
    const res = {}
    if (global.loadNativeModules) {
      let nativeModules = global.loadNativeModules()
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
        res[moduleDesc.module] = module
      }
      init(res)
    }
  })()
  /*
   *** end
   */
  const runnables = {}

  const AppRegistry = {
    registerComponent: function (appKey) {
      runnables[appKey] = {
        run: function () {
          global.Native.document.createBody(1, {
            'type': 'view',
            'docId': 1,
            'id': 1,
            'attributes': {},
            'children': [{
              'id': 3,
              'type': 'view',
              'docId': 1,
              'attributes': {
                'style': {
                  'backgroundColor': '#000000',
                  'width': '100px',
                  'height': '100px'
                }
              }
            }]

          })

          global.Native.document.addElement(1, 3, {
            'type': 'view',
            'docId': 1,
            'id': 4,
            'attributes': {
              'style': {
                'backgroundColor': '#DC143C',
                'width': '30px',
                'height': '30px'
              }
            },
            'children': []
          }, -1)

          global.Native.document.updateFinish(1)
        }
      }
      return appKey
    },

    runApplication: function (appKey) {
      global.nativeLog('2', 'runApplication')
      const component = runnables[appKey]
      component.run()
    }
  }

  fnBridge.registerCallableModule('AppRegistry', AppRegistry)
  global.nativeLog('2', 'register成功')
  AppRegistry.registerComponent('App')
})(this)
