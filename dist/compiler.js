"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const webpack_1 = tslib_1.__importDefault(require("webpack/lib/webpack"));
const fs_1 = tslib_1.__importDefault(require("fs"));
const SingleEntryDependency_1 = tslib_1.__importDefault(require("webpack/lib/dependencies/SingleEntryDependency"));
const SingleEntryPlugin_1 = tslib_1.__importDefault(require("webpack/lib/SingleEntryPlugin"));
const util_1 = require("util");
const util_webpack_1 = require("./util-webpack");
const deasync = require('deasync');
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
 * @returns {function(string, string, function(Error, SimpleCompiler=): void): void}
 */
function getSimpleCompiler(wpOptions, callback) {
    const compiler = webpack_1.default(wpOptions || {});
    compiler.hooks.beforeRun.callAsync(compiler, (err) => {
        if (err)
            return callback(err);
        const params = compiler.newCompilationParams();
        compiler.hooks.beforeCompile.callAsync(params, (err) => {
            if (err)
                return callback(err);
            compiler.hooks.compile.call(params);
            const compilation = compiler.newCompilation(params);
            const moduleFactory = compilation.dependencyFactories.get(SingleEntryDependency_1.default);
            const { options, resolverFactory } = compiler;
            // we never need to parse:
            options.module.noParse = '';
            callback(undefined, (request, context, callback) => {
                moduleFactory.create({
                    context,
                    contextInfo: { issuer: '', compiler: 'webpack-node' },
                    dependencies: [SingleEntryPlugin_1.default.createDependency(request, 'main')]
                }, (err, module) => {
                    if (err)
                        return callback(err);
                    const resolver = resolverFactory.get('normal', module.resolveOptions);
                    const compile = (callback) => {
                        module.build(options, compilation, resolver, fs_1.default, () => {
                            const { _source: sourceObject } = module;
                            if (sourceObject != null)
                                callback(null, sourceObject.source());
                            else
                                callback(new Error('No source returned'));
                        });
                    };
                    const resourceAndQuery = module.request != null
                        ? util_webpack_1.buildFilename(module.request)
                        : undefined;
                    const filename = resourceAndQuery && resourceAndQuery.join('?');
                    callback(null, {
                        compile,
                        module,
                        request: module.request,
                        loaders: module.loaders,
                        resource: module.resource,
                        filename,
                        resourceAndQuery,
                        needsTransforming: resourceAndQuery.length > 1,
                    });
                });
            });
        });
    });
}
exports.getSimpleCompiler = getSimpleCompiler;
const getSimpleCompilerAsyncBase = util_1.promisify(getSimpleCompiler);
const getSimpleCompilerSyncBase = deasync(getSimpleCompiler);
/**
 * @typedef {function(string, string): SimpleCompilerSync} GetModuleSync
 */
/**
 * @type {function(Configuration): GetModuleSync}
 */
exports.getSimpleCompilerSync = (wpOptions) => {
    const getModule = deasync(getSimpleCompilerSyncBase(wpOptions));
    /**
     * @param {string} request
     * @param {string} context
     * @returns {SimpleCompilerSync}
     */
    return function getModuleSync(request, context) {
        const _a = getModule(request, context), { compile } = _a, props = tslib_1.__rest(_a, ["compile"]);
        /** @type {SimpleCompilerSync} */
        return Object.assign({}, props, { compile: deasync(compile) });
    };
};
/**
 * @typedef {function(string, string): Promise<SimpleCompilerAsync>} GetModuleAsync
 */
/**
 * @type {function(Configuration): Promise<GetModuleAsync>}
 */
exports.getSimpleCompilerAsync = async (wpOptions) => {
    const getModule = util_1.promisify(await getSimpleCompilerAsyncBase(wpOptions));
    /**
     * @param {string} request
     * @param {string} context
     * @returns {Promise<GetModuleAsync>}
     */
    return async function getModuleAsync(request, context) {
        const _a = await getModule(request, context), { compile } = _a, props = tslib_1.__rest(_a, ["compile"]);
        /** @type {SimpleCompilerAsync} */
        return Object.assign({}, props, { compile: util_1.promisify(compile) });
    };
};
//# sourceMappingURL=compiler.js.map