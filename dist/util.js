"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deasync = require("deasync");
const util_1 = require("util");
const path_1 = require("path");
function deasyncAsyncFn(asyncFn) {
    return deasync(util_1.callbackify(asyncFn));
}
exports.deasyncAsyncFn = deasyncAsyncFn;
exports.getPrettyPath = (filename) => filename
    .split(`${process.cwd()}${path_1.sep}`)
    .pop()
    .split(`node_modules${path_1.sep}`)
    .pop();
//# sourceMappingURL=util.js.map