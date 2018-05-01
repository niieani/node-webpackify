import {resolve, join} from 'path'
import execa from 'execa'

export function runFixture(name: string) {
  const fixturePath = resolve(__dirname, '..', 'fixtures', name)
  return execa(
    'node',
    ['-r', join(fixturePath, 'register'), fixturePath]
  )
}
