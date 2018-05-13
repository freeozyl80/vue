var fs = require('fs')
var path = require('path')
var compile = require('../../packages/plato-template-compiler/build.js').compile
var VueFrameWork = require('../../packages/plato-vue-framework')
process.env.TEST = true
const styleRE = /<\s*style\s*\w*>([^(<\/)]*)<\/\s*style\s*>/g
const scriptRE = /<\s*script.*>([^]*)<\/\s*script\s*>/
const templateRE = /<\s*template\s*([^>]*)>([^]*)<\/\s*template\s*>/
function readFile (filename) {
  return fs.readFileSync(path.resolve(__dirname, './', filename), 'utf8')
}

function parseStatic (fns) {
  return '[' + fns.map(fn => `function () { ${fn} }`).join(',') + ']'
}
function compileAndStringify (template) {
  const { render, staticRenderFns } = compile(template)
  return {
    renderComponent: `function () { ${render} }`,
    staticRenderFnsComponent: parseStatic(staticRenderFns)
  }
}
function compileVue (source, componentName) {
  return new Promise((resolve, reject) => {
  	const { renderComponent, staticRenderFnsComponent } = compileAndStringify(`<text>Hello {{x}}</text>`)
	const Components = `{
        sub: {
          data: function () {
            return { x: 'Sub' }
          },
          render: ${renderComponent},
          staticRenderFns: ${staticRenderFnsComponent}
        }
      }`
	source = source.replace('COMPONENTS', Components);

    const scriptMatch = scriptRE.exec(source)
    const script = scriptMatch ? scriptMatch[1] : ''
    const templateMatch = templateRE.exec(source)
    const compileOptions = {}
    // 超大渲染列表暂时不要
    /* if (/\s*recyclable\=?/i.test(templateMatch[1])) {
		  compileOptions.recyclable = true
		}*/
    const res = compile(templateMatch[2], compileOptions)

    const name = 'test_case_' + (Math.random() * 99999999).toFixed(0)
    
    const generateCode = styles => (`
      var ${name} = Object.assign({
        _scopeId: "${name}",
        style: ${JSON.stringify(styles)},
        render: function () { ${res.render} },
        ${res['@render'] ? ('"@render": function () {' + res['@render'] + '},') : ''}
        staticRenderFns: ${parseStatic(res.staticRenderFns)},
      }, (function(){
        var module = { exports: {} };
        ${script};
        return module.exports;
      })());
    ` + (componentName
      ? `Vue.component('${componentName}', ${name});\n`
      : `${name}.el = 'body';new Vue(${name});`))
    // 暂时先不支持class吧，内联的css能解决就好了
    // let cssText = ''
    // let styleMatch = null
    // while ((styleMatch = styleRE.exec(source))) {
    // 	cssText += `\n${styleMatch[1]}\n`
    // }
    // styler.parse(cssText, (error, result) => {
    // 	if (error) {
    // 		return reject(error)
    // 	}
    // 	resolve(generateCode(result.jsonStyle))
    // })
    resolve(generateCode({}))
  })
}

/* function createInstance(id, code, ...args) {
	// 自己尝试代码
	VueFrameWork.loadNativeModules();
	const instance = VueFrameWork.createInstance(id, `// { "framework": "Vue" }\n${code}`, ...args) || {}

	//
	WeexRuntime.config.frameworks = {
		Vue
	}
	const context = WeexRuntime.init(WeexRuntime.config)
	context.registerModules({
		timer: ['setTimeout', 'setInterval']
	})
	const instance = context.createInstance(id, `// { "framework": "Vue" }\n${code}`, ...args) || {}
	instance.document = context.getDocument(id)
	instance.$getRoot = () => context.getRoot(id)
	instance.$refresh = (data) => context.refreshInstance(id, data)
	instance.$destroy = () => {
		delete instance.document
		context.destroyInstance(id)
	}
	instance.$triggerHook = (id, hook, args) => {
		instance.document.taskCenter.triggerHook(id, 'lifecycle', hook, {
			args
		})
	}
	return instance
}*/

const source = readFile('sample.vue')

compileVue(source).then(code => {
  const id = String(Date.now() * Math.random())
  const docId = id
  VueFrameWork.loadNativeModules()
  const instance = VueFrameWork.createInstance(id, docId);
  instance.registerComponent(id, code);
}).catch((e) => {
  console.log(e)
})
