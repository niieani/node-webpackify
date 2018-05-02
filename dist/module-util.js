"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
// https://github.com/nodejs/node/blob/254058109f469f64b8ca23bb65a206abab380604/lib/internal/modules/cjs/loader.js#L87
const module_1 = tslib_1.__importDefault(require("module"));
const path_1 = require("path");
function updateChildren(parent, child, scan) {
    const children = parent && parent.children;
    if (children && !(scan && children.includes(child)))
        children.push(child);
}
exports.updateChildren = updateChildren;
exports.stripBom = (string /* : string */) => string.charCodeAt(0) === 0xFEFF ? string.slice(1) : string;
// from https://github.com/nodejs/node/blob/254058109f469f64b8ca23bb65a206abab380604/lib/internal/modules/cjs/loader.js#L525
function tryModuleLoad(newModule, filename, content) {
    let threw = true;
    try {
        // from https://github.com/nodejs/node/blob/254058109f469f64b8ca23bb65a206abab380604/lib/internal/modules/cjs/loader.js#L580
        newModule.filename = filename;
        newModule.paths = module_1.default._nodeModulePaths(path_1.dirname(filename));
        newModule._compile(exports.stripBom(content), filename);
        newModule.loaded = true;
        threw = false;
    }
    finally {
        if (threw) {
            delete module_1.default._cache[filename];
        }
    }
}
exports.tryModuleLoad = tryModuleLoad;
exports.getCachedModule = (filename, parentModule) => {
    const cachedModule = module_1.default._cache[filename];
    if (cachedModule) {
        updateChildren(parentModule, cachedModule, true);
        return cachedModule;
    }
    return undefined;
};
function makeModule(filename, fileContents, parentModule) {
    const newModule = new module_1.default(filename, parentModule);
    module_1.default._cache[filename] = newModule;
    tryModuleLoad(newModule, filename, fileContents);
    return newModule;
}
exports.makeModule = makeModule;
//# sourceMappingURL=module-util.js.map