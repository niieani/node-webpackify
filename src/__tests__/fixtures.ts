import {runFixture} from '../util-tests'

describe('uses a loader', () => {
  jest.setTimeout(10000)

  it ('raw-loader', async () => {
    const result = await runFixture('raw')
    expect(result.failed).toBe(false)
    expect(result.stdout).toMatchSnapshot()
  })

  it ('css-loader and style-loader', async () => {
    const result = await runFixture('css')
    expect(result.failed).toBe(false)
    expect(result.stdout).toMatchSnapshot()
  })

  it ('postcss-loader', async () => {
    const result = await runFixture('postcss')
    expect(result.failed).toBe(false)
    expect(result.stdout).toMatchSnapshot()
  })
})
