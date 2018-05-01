import {getSimpleCompilerAsync, getSimpleCompilerSync} from './compiler'

describe('simple compiler', () => {
  jest.setTimeout(10000)

  const wpOptions = {}

  test('compilation async', async () => {
    const getModule = await getSimpleCompilerAsync(wpOptions)
    const {compile} = await getModule('../fixtures/basic', __dirname)
    const source = await compile()
    expect(source).toMatchSnapshot()
  })

  test('compilation sync', () => {
    const getModule = getSimpleCompilerSync(wpOptions)
    const {compile} = getModule('../fixtures/basic', __dirname)
    const source = compile()
    expect(source).toMatchSnapshot()
  })
})
