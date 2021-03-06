"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
// noinspection NpmUsedModulesInstalled
const module_1 = tslib_1.__importDefault(require("module"));
const path_1 = require("path");
const compiler_1 = require("./compiler");
const module_util_1 = require("./module-util");
const util_1 = require("./util");
const debug_1 = tslib_1.__importDefault(require("debug"));
const { _load: load } = module_1.default;
const logLoad = debug_1.default('webpack-node:load');
const logResolve = debug_1.default('webpack-node:resolve');
const logError = debug_1.default('webpack-node:error');
const logCompilationStart = debug_1.default('webpack-node:compile:start');
const logCompilationEnd = debug_1.default('webpack-node:compile:end');
const anyLogEnabled = logLoad.enabled || logResolve.enabled || logError.enabled || logCompilationStart.enabled || logCompilationEnd.enabled;
function register(wpOptions = {}, options = {}) {
    module_1.default._load = makeLoad(wpOptions, options);
}
exports.register = register;
function makeLoad(wpOptions = {}, { test, testTransform, blacklistBuiltin = true, target = 'node', } = {}) {
    const getModule = compiler_1.getSimpleCompilerSync(Object.assign({}, wpOptions, { target }));
    return function _load(request, parentModule, isMain) {
        const { filename: parentFilename = '' } = parentModule || {};
        const shouldBail = isMain
            || parentFilename === ''
            || (blacklistBuiltin && module_1.default.builtinModules.some((builtIn) => request.startsWith(builtIn)))
            || (test && !test(request, parentFilename));
        if (!shouldBail) {
            try {
                const context = path_1.dirname(parentFilename);
                const prettyContext = anyLogEnabled ? util_1.getPrettyPath(context) : '';
                logLoad('loading %o', { request, context: prettyContext });
                const { compile, filename, needsTransforming, loaders } = getModule(request, context);
                const prettyFilename = anyLogEnabled ? util_1.getPrettyPath(filename) : '';
                logResolve('resolved %o', { filename: prettyFilename, needsTransforming });
                const wantsTransforming = testTransform
                    && testTransform(filename, loaders, request, parentFilename, needsTransforming);
                if (wantsTransforming || needsTransforming) {
                    const cachedModule = module_util_1.getCachedModule(filename, parentModule);
                    if (cachedModule)
                        return cachedModule.exports;
                    logCompilationStart('compiling %s', prettyFilename);
                    let compiled = '';
                    try {
                        compiled = compile();
                    }
                    catch (error) {
                        logError('error transforming %o', { filename: prettyFilename, request });
                        console.error(error);
                        return {};
                    }
                    if (logCompilationEnd.enabled) {
                        logCompilationEnd('compiled %O', {
                            filename: prettyFilename,
                            loaders: loaders.map(({ loader }) => util_1.getPrettyPath(loader)),
                        });
                    }
                    try {
                        const newModule = module_util_1.makeModule(filename, compiled, parentModule);
                        return newModule.exports;
                    }
                    catch (error) {
                        logError('error executing %o', { filename: prettyFilename, request });
                        console.error(error);
                        throw error;
                    }
                }
                else {
                    // we bailed, but we might already have resolved the filename - let's use it:
                    request = filename != null ? filename : request;
                }
            }
            catch (err) {
                logError('error resolving %o', { request, parent: util_1.getPrettyPath(parentFilename), err });
            }
        }
        if (anyLogEnabled)
            logLoad('passing to native loader %s', util_1.getPrettyPath(request));
        return load(request, parentModule, isMain);
    };
}
exports.makeLoad = makeLoad;
//# sourceMappingURL=hook.js.map