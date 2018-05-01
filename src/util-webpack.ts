import crypto from 'crypto'

/**
 * @param {string} request
 * @returns {[string, string]}
 */
export function buildFilename(request: string) {
  const loaders = request.split('!')
  const [resource, ...paramsParts] = loaders.pop()!.split('?')
  const hashFrom = `${loaders.join('!')}${paramsParts.join('?')}`
  return hashFrom.length > 0
    ? [resource, crypto.createHash('md4').update(hashFrom).digest('hex')]
    : [resource]
}