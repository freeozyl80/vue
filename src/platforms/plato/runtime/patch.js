/* @flow */

import * as nodeOps from './node-ops'
import { createPatchFunction } from 'core/vdom/patch'
import baseModules from 'core/vdom/modules/index'
// 暂时注释掉，看看需要的时候。
// import platformModules from 'plato/runtime/modules/index'

export const corePatch: Function = createPatchFunction({ nodeOps, modules: [] })

export function patch () {
  corePatch.apply(this, arguments)
  // 这里可以hack一个钩子(jaffezhang)
}
