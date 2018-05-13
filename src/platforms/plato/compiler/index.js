/* @flow */

import { genStaticKeys } from 'shared/util'
import { createCompiler } from 'compiler/index'

import modules from './modules/index'
import directives from './directives/index'

import {
  isUnaryTag,
  mustUseProp,
  isReservedTag,
  canBeLeftOpenTag,
  getTagNamespace
} from '../util/index'

export const baseOptions: PlatoCompilerOptions = {
  modules,
  directives,
  isUnaryTag,
  mustUseProp,
  canBeLeftOpenTag,
  isReservedTag,
  getTagNamespace,
  preserveWhitespace: false,
  recyclable: false,
  staticKeys: genStaticKeys(modules)
}

const compiler = createCompiler(baseOptions)

export function compile (
  template: string,
  options?: PlatoCompilerOptions
): PlatoCompiledResult {
  const result = compiler.compile(template, options)
  return result
}
