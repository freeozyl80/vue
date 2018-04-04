import TextNode from 'plato/runtime/text-node'

// this will be preserved during build
const VueFactory = require('./factory')

const instances = {}
const modules = {}
const components = {}

const renderer = {
  TextNode,
  instances,
  modules,
  components
}

/**
 * Prepare framework config, basically about the virtual-DOM and JS bridge.
 * @param {object} cfg
 */
export function init (cfg) {
  renderer.Document = cfg.Document  /*这个有，其他的再看*/
  renderer.Element = cfg.Element
  renderer.Comment = cfg.Comment
  renderer.compileBundle = cfg.compileBundle
}


/**
 * Reset framework config and clear all registrations.
 */
export function reset () {
  clear(instances)
  clear(modules)
  clear(components)
  delete renderer.Document
  delete renderer.Element
  delete renderer.Comment
  delete renderer.compileBundle
}

/**
 * Delete all keys of an object.
 * @param {object} obj
 */
function clear (obj) {
  for (const key in obj) {
    delete obj[key]
  }
}
