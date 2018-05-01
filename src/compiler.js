import webpack from 'webpack/lib/webpack'
import fs from 'fs'
import SingleEntryDependency from 'webpack/lib/dependencies/SingleEntryDependency'
import SingleEntryPlugin from 'webpack/lib/SingleEntryPlugin'
import {promisify} from 'util'
import {buildFilename} from './util-webpack'
const deasync = require('deasync')

/** @typedef {import("webpack").Configuration} Configuration */

/**
 * @typedef {{
 *   compile: function(callback : function(Error, string) : void): void,
 *   filename: string,
 *   request: string,
 *   needsTransforming: boolean,
 *   loaders: Array<Object>,
 * }} SimpleCompiler
 */

/**
 * @typedef {{
 *   compile: function(): Promise<string>,
 *   filename: string,
 *   request: string,
 *   needsTransforming: boolean,
 *   loaders: Array<Object>,
 * }} SimpleCompilerAsync
 */

/**
 * @typedef {{
 *   compile: function(): string,
 *   filename: string,
 *   request: string,
 *   needsTransforming: boolean,
 *   loaders: Array<Object>,
 * }} SimpleCompilerSync
 */

/**
 * @param {Configuration} wpOptions
 * @param {function(Error, function(Error, SimpleCompiler=): void): void} callback
 * @returns {function(request: string, context: string, callback: function(Error, SimpleCompiler=): void): void}
 */
export function getSimpleCompiler(wpOptions, callback) {
  const compiler = webpack(wpOptions || {})
  compiler.hooks.beforeRun.callAsync(compiler, (err) => {
    if (err) return callback(err)

    const params = compiler.newCompilationParams()
    compiler.hooks.beforeCompile.callAsync(params, (err) => {
      if (err) return callback(err)

      compiler.hooks.compile.call(params)
      const compilation = compiler.newCompilation(params)
      const moduleFactory = compilation.dependencyFactories.get(SingleEntryDependency)
      const {options, resolverFactory} = compiler

      // we never need to parse:
      options.module.noParse = ''

      callback(undefined, (request, context, callback) => {
        moduleFactory.create({
          context,
          contextInfo: {issuer: '', compiler: 'webpack-node'},
          dependencies: [SingleEntryPlugin.createDependency(request, 'main')]
        }, (err, module) => {
          if (err) return callback(err)

          const resolver = resolverFactory.get('normal', module.resolveOptions)
          const compile = (callback) => {
            module.build(options, compilation, resolver, fs, () => {
              const {_source: sourceObject} = module
              if (sourceObject != null) callback(null, sourceObject.source())
              else callback(new Error('No source returned'))
            })
          }

          const resourceAndQuery = module.request != null
            ? buildFilename(module.request)
            : undefined

          const filename = resourceAndQuery && resourceAndQuery.join('?')

          callback(null, {
            compile,
            module,
            request: module.request,
            loaders: module.loaders,
            resource: module.resource,
            filename,
            resourceAndQuery,
            needsTransforming: resourceAndQuery.length > 1,
          })
        })
      })
    })
  })
}

const getSimpleCompilerAsyncBase = promisify(getSimpleCompiler)
const getSimpleCompilerSyncBase = deasync(getSimpleCompiler)

/**
 * @typedef {function(request: string, context: string): SimpleCompilerSync} GetModuleSync
 */

/**
 * @type {function(Configuration): GetModuleSync}
 */
export const getSimpleCompilerSync = (wpOptions) => {
  const getModule = deasync(getSimpleCompilerSyncBase(wpOptions))
  /**
   * @param {string} request
   * @param {string} context
   * @returns {SimpleCompilerSync}
   */
  return function getModuleSync(request, context) {
    const {compile, ...props} = getModule(request, context)
    /** @type {SimpleCompilerSync} */
    return {...props, compile: deasync(compile)}
  }
}

/**
 * @typedef {function(request: string, context: string): Promise<SimpleCompilerAsync>} GetModuleAsync
 */

/**
 * @type {function(Configuration): Promise<GetModuleAsync>}
 */
export const getSimpleCompilerAsync = async (wpOptions) => {
  const getModule = promisify(await getSimpleCompilerAsyncBase(wpOptions))
  /**
   * @param {string} request
   * @param {string} context
   * @returns {Promise<GetModuleAsync>}
   */
  return async function getModuleAsync(request, context) {
    const {compile, ...props} = await getModule(request, context)
    /** @type {SimpleCompilerAsync} */
    return {...props, compile: promisify(compile)}
  }
}
