"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_tests_1 = require("../util-tests");
describe('uses a loader', () => {
    jest.setTimeout(10000);
    it('raw-loader', async () => {
        const result = await util_tests_1.runFixture('raw');
        expect(result.failed).toBe(false);
        expect(result.stdout).toMatchSnapshot();
    });
    it('css-loader and style-loader', async () => {
        const result = await util_tests_1.runFixture('css');
        expect(result.failed).toBe(false);
        expect(result.stdout).toMatchSnapshot();
    });
    it('postcss-loader', async () => {
        const result = await util_tests_1.runFixture('postcss');
        expect(result.failed).toBe(false);
        expect(result.stdout).toMatchSnapshot();
    });
});
//# sourceMappingURL=fixtures.js.map