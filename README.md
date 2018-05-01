# node-webpackify

Redirects all your Node `require()` calls to Webpack's module compiler,
making it into a JIT (just-in-time) compiler.

It can serve as a replacement for `babel-register` or `ts-node`.

Based on the provided `webpack` config, `node-webpackify` will use:
- `webpack`'s resolvers (including resolving of aliases, resolve plugins, etc.)
- `webpack`'s rules (loaders)

But NOT webpack's plugins (or at least that remains untested)!
The reason is that `node-webpackify` will only run a handful of hooks required to setup the resolvers and loaders.

Yes, this means you can use things like `css-loader` with Node or Electron.
Think: ditching `karma-webpack` in place of `electron-mocha` for much faster testing.

## Usage

`node-webpackify` exposes a `register` function, which you can use as follows:

```js
const webpackOptions = require('./webpack.config.js')
require('node-webpackify')(
  webpackOptions,
  // (optional) RegExp to skip the file based on the parent's module path
  originBlacklist,
  // (optional) RegExp to skip the file based on the request: require(request)
  requestBlacklist,
  // (optional) skip on node builtins (default = true):
  blacklistBuiltin,
  // (optional) override webpack's target (default = 'node'), useful for Electron
  target,
)
```

I'd recommend create a `register-webpack.js` file with similar contents to the ones above.

Then, you can simply run your code by executing:

```bash
node -r ./register-webpack src/entry 
```

## Performance

Since loaders can be slow, and `require`'s are synchronous, a lot could still be done to make `node-webpackify` faster:
- long-term caching based on file timestamps (like `babel-register`)
- improving logic for early bailing

If you're using babel, I recommend adding one of these plugins to your code (you could also try experimenting with the `node_modules` code):
- https://github.com/zertosh/babel-plugin-transform-inline-imports-commonjs
- https://github.com/princjef/babel-plugin-lazy-require

They will make your `require`'s evaluate at the first moment they're used, rather than all upfront, making the start-up times much, much better.


## Debugging

Lunch your app with a `DEBUG=node-webpackify:*` environment variable, e.g.:

```bash
DEBUG=node-webpackify:* node -r ./register-webpack src/entry 
```

## Using the compiler directly

It might be useful for you to just use the extracted compiler,
for example to write a `jest` transform plugin out of it.

See the `src/compiler.test.ts` for details on usage.
