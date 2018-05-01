// noinspection NpmUsedModulesInstalled
import Module from 'module'
import {dirname, extname} from 'path'
import {getSimpleCompilerSync} from './compiler'
import {makeModule, getCachedModule} from './module-util'
import {getPrettyPath} from './util'
import makeDebug from 'debug'
const {_load: load} = Module

const logLoad = makeDebug('webpack-node:load')
const logResolve = makeDebug('webpack-node:resolve')
const logError = makeDebug('webpack-node:error')
const logCompilationStart = makeDebug('webpack-node:compile:start')
const logCompilationEnd = makeDebug('webpack-node:compile:end')

const anyLogEnabled = logLoad.enabled || logResolve.enabled || logError.enabled || logCompilationStart.enabled || logCompilationEnd.enabled

export function register(
  wpOptions = {},
  originBlacklist,
  requestBlacklist,
  blacklistBuiltin = true,
  target = 'node',
) {
  const getModule = getSimpleCompilerSync({...wpOptions, target})

  Module._load = function _load(request, parentModule, isMain) {
    const {filename: parentFilename = ''} = parentModule || {}

    const shouldBail = isMain
      || (!request.startsWith('!') && extname(request) === '.json')
      || (blacklistBuiltin && Module.builtinModules.some((builtIn) => request.startsWith(builtIn)))
      || (originBlacklist && parentFilename.match(originBlacklist))
      || (requestBlacklist && request.match(requestBlacklist))
      || parentFilename === ''

    if (!shouldBail) {
      try {
        const context = dirname(parentFilename)
        const prettyContext = anyLogEnabled ? getPrettyPath(context) : ''
        logLoad('loading %o', {request, context: prettyContext})

        const {compile, filename, needsTransforming, loaders} = getModule(request, context)
        const prettyFilename = anyLogEnabled ? getPrettyPath(filename) : ''
        logResolve('resolved %o', {filename: prettyFilename, needsTransforming})

        if (needsTransforming) {
          const cachedModule = getCachedModule(filename, parentModule)
          if (cachedModule) return cachedModule.exports

          try {
            logCompilationStart('compiling %s', prettyFilename)
            const compiled = compile()
            if (logCompilationEnd.enabled) {
              logCompilationEnd('compiled %O', {
                filename: prettyFilename,
                loaders: loaders.map(({loader}) => getPrettyPath(loader)),
              })
            }
            const newModule = makeModule(filename, compiled, parentModule)
            return newModule.exports
          } catch (error) {
            logError('error transforming %o', {filename: prettyFilename, request})
            console.error(error)
            return {}
          }
        } else {
          // we bailed, but we might already have resolved the filename - let's use it:
          request = filename != null ? filename : request
        }
      } catch (err) {
        logError('error resolving %o', {request, parent: getPrettyPath(parentFilename), err})
      }
    }
    if (anyLogEnabled) logLoad('passing to native loader %s', getPrettyPath(request))
    return load(request, parentModule, isMain)
  }
}
