"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const compiler_1 = require("./compiler");
describe('simple compiler', () => {
    jest.setTimeout(10000);
    const wpOptions = {};
    test('compilation async', async () => {
        const getModule = await compiler_1.getSimpleCompilerAsync(wpOptions);
        const { compile } = await getModule('../fixtures/basic', __dirname);
        const source = await compile();
        expect(source).toMatchSnapshot();
    });
    test('compilation sync', () => {
        const getModule = compiler_1.getSimpleCompilerSync(wpOptions);
        const { compile } = getModule('../fixtures/basic', __dirname);
        const source = compile();
        expect(source).toMatchSnapshot();
    });
});
//# sourceMappingURL=compiler.test.js.map