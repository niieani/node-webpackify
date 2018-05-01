import deasync = require('deasync')
import {callbackify} from 'util'
import {sep} from 'path'

type DeasyncAsyncFn<T, U> = (<T, U extends (...args : Array<any>) => any>(
  asyncFn: (arg : T) => Promise<U>
) => (arg: T) => U)

export function deasyncAsyncFn<T, U>(
  asyncFn: (arg : T) => Promise<U>
): (arg: T) => U
export function deasyncAsyncFn<T, T2, U>(
  asyncFn: (arg : T, arg2: T2) => Promise<U>
): (arg: T, arg2: T2) => U
export function deasyncAsyncFn<U>(
  asyncFn: (...args : Array<any>) => Promise<U>
): (...args: Array<any>) => U {
  return deasync(callbackify(asyncFn))
}

export const getPrettyPath = (filename: string) => filename
  .split(`${process.cwd()}${sep}`)
  .pop()!
  .split(`node_modules${sep}`)
  .pop()!
