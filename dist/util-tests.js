"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path_1 = require("path");
const execa_1 = tslib_1.__importDefault(require("execa"));
function runFixture(name) {
    const fixturePath = path_1.resolve(__dirname, '..', 'fixtures', name);
    return execa_1.default('node', ['-r', path_1.join(fixturePath, 'register'), fixturePath]);
}
exports.runFixture = runFixture;
//# sourceMappingURL=util-tests.js.map