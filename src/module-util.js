// https://github.com/nodejs/node/blob/254058109f469f64b8ca23bb65a206abab380604/lib/internal/modules/cjs/loader.js#L87
import Module from "module"
import {dirname} from "path"

export function updateChildren(parent, child, scan) {
  const children = parent && parent.children
  if (children && !(scan && children.includes(child)))
    children.push(child)
}

export const stripBom = (string /* : string */) =>
  string.charCodeAt(0) === 0xFEFF ? string.slice(1) : string

// from https://github.com/nodejs/node/blob/254058109f469f64b8ca23bb65a206abab380604/lib/internal/modules/cjs/loader.js#L525
export function tryModuleLoad(newModule, filename, content) {
  let threw = true
  try {
    // from https://github.com/nodejs/node/blob/254058109f469f64b8ca23bb65a206abab380604/lib/internal/modules/cjs/loader.js#L580
    newModule.filename = filename
    newModule.paths = Module._nodeModulePaths(dirname(filename))
    newModule._compile(stripBom(content), filename)
    newModule.loaded = true
    threw = false
  } finally {
    if (threw) {
      delete Module._cache[filename]
    }
  }
}

export const getCachedModule = (filename, parentModule) => {
  const cachedModule = Module._cache[filename]
  if (cachedModule) {
    updateChildren(parentModule, cachedModule, true)
    return cachedModule
  }
  return undefined
}

export function makeModule(filename, fileContents, parentModule) {
  const newModule = new Module(filename, parentModule)
  Module._cache[filename] = newModule
  tryModuleLoad(newModule, filename, fileContents)
  return newModule
}
