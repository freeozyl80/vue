/* @flow */

import Vue from 'core/index'
import { patch } from 'plato/runtime/patch'
import { mountComponent } from 'core/instance/lifecycle'
import platformDirectives from 'plato/runtime/directives/index'
import platformComponents from 'plato/runtime/components/index'

import {
  query,  /* 这个看下需要还是不需要(jaffezhang) */
  mustUseProp,
  isReservedTag,
  // isReservedAttr, /* 新增(jaffezhang) */
  isUnknownElement
} from 'plato/util/index'

// install platform specific utils
Vue.config.mustUseProp = mustUseProp
Vue.config.isReservedTag = isReservedTag
// Vue.config.isReservedAttr = isReservedAttr
Vue.config.isUnknownElement = isUnknownElement

// install platform patch function
Vue.prototype.__patch__ = patch

// wrap mount
Vue.prototype.$mount = function (
  el?: any,
  hydrating?: boolean
): Component {
  return mountComponent(
    this,
    undefined,
    undefined
  )
}

export default Vue
