"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const crypto_1 = tslib_1.__importDefault(require("crypto"));
/**
 * @param {string} request
 * @returns {[string, string]}
 */
function buildFilename(request) {
    const loaders = request.split('!');
    const [resource, ...paramsParts] = loaders.pop().split('?');
    const hashFrom = `${loaders.join('!')}${paramsParts.join('?')}`;
    return hashFrom.length > 0
        ? [resource, crypto_1.default.createHash('md4').update(hashFrom).digest('hex')]
        : [resource];
}
exports.buildFilename = buildFilename;
//# sourceMappingURL=util-webpack.js.map