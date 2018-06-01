import App from './src/App.vue'

const compile = require('compile').compile
const VueFrameWork = require('VueFrameWork')

process.env.TEST = false

function compileApp (app) {
  app.el = 'body'
  return new Promise((resolve, reject) => {
    const code = `new Vue(app);`
    resolve({
      code,
      app
    })
  })
}

compileApp(App).then(obj => {
  const id = 'App'
  const docId = 1
  VueFrameWork.loadNativeModules()
  const instance = VueFrameWork.createInstance(id, docId, obj.app)
  instance.registerComponent(id, obj.code)
})
