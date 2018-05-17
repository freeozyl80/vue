import { App } from './src/prd/bundler.js'

const compile = require('compile').compile
const VueFrameWork = require('VueFrameWork')

const source =
	`<template>
	  <div v-bind:style="{ width: '800px', height: '400px', backgroundColor: color}">
	    <div v-on:click="test(1)" style="width:100px;height:100px;backgroundColor:#00FFFF"></div>
	    <sub></sub>
	    <text>{{testData}}</text>
	    <div v-for="item in list">
	      <text>{{ item.txt }}</text>
	    </div>
	  </div>
	</template>

	<script>
	  module.exports = {
	    methods: {
	      test: function() {
	        this.testData = 'lol'
	      }
	    },
	    data() {
	      return {
	        color: '#DC143C',
	        testData: 'wow',
	        list: [{
	          'txt': '这里是for循环第一位'
	        }, {
	          'txt': '这里是for循环第二位'
	        }]
	      }
	    },
	    components: COMPONENTS
	  }
	</script>
	`
const styleRE = /<\s*style\s*\w*>([^(<\/)]*)<\/\s*style\s*>/g
const scriptRE = /<\s*script.*>([^]*)<\/\s*script\s*>/
const templateRE = /<\s*template\s*([^>]*)>([^]*)<\/\s*template\s*>/

function parseStatic (fns) {
  return '[' + fns.map(fn => `function () { ${fn} }`).join(',') + ']'
}

function compileAndStringify (template) {
  const {
    render,
    staticRenderFns
  } = compile(template)
  return {
    renderComponent: `function () { ${render} }`,
    staticRenderFnsComponent: parseStatic(staticRenderFns)
  }
}
function compileApp (app) {
  return new Promise((resolve, reject) => {
    const generateCode = `${app}.el = 'body';new Vue(${app});`
    resolve(generateCode)
  })
}

function compileVue (source, componentName) {
  return new Promise((resolve, reject) => {
    const {
      renderComponent,
      staticRenderFnsComponent
    } = compileAndStringify(`<text style="fontSize: 24px">Hello, {{x}}</text>`)
    const Components = `{
	        sub: {
	          data: function () {
	            return { x: 'This is child Componets' }
	          },
	          render: ${renderComponent},
	          staticRenderFns: ${staticRenderFnsComponent}
	        }
	      }`
    source = source.replace('COMPONENTS', Components)

    const scriptMatch = scriptRE.exec(source)
    const script = scriptMatch ? scriptMatch[1] : ''
    const templateMatch = templateRE.exec(source)
    const compileOptions = {}

    const res = compile(templateMatch[2], compileOptions)

    const name = 'test_case_' + (Math.random() * 99999999).toFixed(0)

    const generateCode = styles => (`
			const ${name} = Object.assign({
			  _scopeId: "${name}",
			  style: ${JSON.stringify(styles)},
			  render: function () { ${res.render} },
			  ${res['@render'] ? ('"@render": function () {' + res['@render'] + '},') : ''}
			  staticRenderFns: ${parseStatic(res.staticRenderFns)},
			}, (function(){
			  const module = { exports: {} };
			  ${script};
			  return module.exports;
			})());
		` + (componentName
      ? `Vue.component('${componentName}', ${name});\n`
      : `${name}.el = 'body';new Vue(${name});`))
    resolve(generateCode({}))
  })
}

// compileVue(source).then(code => {
//   const id = 'App'
//   const docId = 1
//   VueFrameWork.loadNativeModules()
//   nativeLog('2', '初始化完成')
//   const instance = VueFrameWork.createInstance(id, docId)
//   nativeLog('2', '注册完成')
//   instance.registerComponent(id, code)
// }).catch((e) => {
//   global.nativeLog('2', e)
// })
compileApp(App).then(code => {
  const id = 'App'
  const docId = 1
  VueFrameWork.loadNativeModules()
  nativeLog('2', '初始化完成')
  const instance = VueFrameWork.createInstance(id, docId)
  nativeLog('2', '注册完成')
  instance.registerComponent(id, code)
})
