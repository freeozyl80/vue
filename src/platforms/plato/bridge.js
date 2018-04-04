let fnBridge;
global._jsf = fnBridge = {
    _lazyCallableModules : {},
    _callFunctions : [],
    _callbackId : 1,
    _currentFunctionID : 1,
    execute(module, method, params) {
        const callbacks = [];
        this._callFunctions[this._currentFunctionID] = callbacks;
        let prepareParams = JSON.stringify(params, (key, value) => {
            if (typeof value === 'function') {
                callbacks[this._callbackId] = value;
                return this._callbackId++;
            }
            return value;
        });
        return global.callNative(this._currentFunctionID++, module, method, prepareParams);
    },

    cancel(functionID) {
        this._callFunctions[functionID] = null;
    },

    invokeCallback(functionID, callbackID, keepAlive, args) {
        const callbacks = this._callFunctions[functionID];
        if (!callbacks) {
            return;
        }
        if (keepAlive == 0) {
            this._callFunctions[functionID] = null;
        }
        const callback = callbacks[callbackID];
        if (!callback) {
            return;
        }
        callback.apply(null, args);
    },

    registerCallableModule(name, module) {
        this._lazyCallableModules[name] = () => module;
    },

    getCallableModule(name) {
        const getValue = this._lazyCallableModules[name];
        return getValue ? getValue() : null;
    },

    callFunction(moduleName, methodName, args) {
        const module = this.getCallableModule(moduleName);
        if (typeof module === 'undefined' || module == null) {
            return;
        }
        const method = module[methodName]
        if (typeof method === 'undefined' || method == null) {
            return;
        }
        return method.apply(module, args);
    }
}
export fnBridge;