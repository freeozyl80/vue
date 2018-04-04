/* @flow */

import * as nodeOps from './node-ops'
import { createPatchFunction } from 'core/vdom/patch'
import baseModules from 'core/vdom/modules/index'
import platformModules from 'plato/runtime/modules/index'


export const corePatch: Function = createPatchFunction({ nodeOps, modules: [] })

export function patch () {
  corePatch.apply(this, arguments)
  // 这里可以hack一个钩子(jaffezhang)
}
	