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

`node-webpackify` exposes a `register` function, which you can use by calling it with the following arguments:

```js
const webpackOptions = require('./webpack.config.js')
require('node-webpackify')(
  // webpack options object:
  webpackOptions,

  // (optional) function(request: string, parentPath: string): boolean
  // can be used to limit which requests are run through the resolvers and loaders
  // when left undefined, 
  // 
  // @param request is the string passed into: require(request)
  // @param parentPath is the full, absolute path to the module that the request is located in
  test,

  // (optional) override webpack's target (default = 'node'), useful for Electron
  target,
)
```

I'd recommend creating a `register-webpack.js` file with similar contents to the file above.

Then, you can simply run your code by executing:

```bash
node -r ./register-webpack src/entry 
```

### Output code must be valid NodeJS code

You need to ensure *none* of the output code contains ES6 `import`s (whether static or dynamic).

If using Babel or TypeScript, ensure you set a CommonJS target for the module system.

If you use dynamic `import()`s, you could add a babel plugin to transpile them into promisified `require()`s:
- https://github.com/airbnb/babel-plugin-dynamic-import-node

## Why?

- NodeJS-based testing without mocking non-JS files, 
  e.g. running `jest` or `mocha` under Electron (which is Node + Chromium):
    - no build/rebuild step necessary
    - native watch mode
    - test your (post)CSS/SASS/CSSinJS *with* measuring and rendering, but *without* bundling
- one config to rule them all: why should you need a different config for your testing platform,
and a different one for your production?
- run a Node REPL that uses your webpack configuration (resolvers, loaders, aliases),
and behaves like webpack (supporting inline syntax like `require('!graphql-loader!./schema.graphql')`)
- debug your `serverless` functions without `serverless-webpack`: no bundles, no sourcemap mess, no rebuilding!
- things I didn't even think of 😄.
- [Edit this README](https://github.com/niieani/node-webpackify/edit/master/README.md) if you have an interesting use-case!

## ES6 modules support

`node-webpackify` does not add hooks to the ES6 modules system when the `--experimentalModules` flag is enabled.

It shouldn't be too hard to add, as there are official APIs for hooking into that system.
If you want to give it a go, send me a PR! :-)

## Performance

We're transforming and loading each file on-demand, while all `require` calls are synchronous.
Unfortunately this means any top-level `require`s will cascade down making the boot-up of your application slow.

The way to solve this problem is to delay the `import`s as much as possible, which could be achieved using a babel plugin (explained below).
It's likely not all codepaths in your application will be taken,
meaning some files can be unnecessary, and others could be transformed and loaded just-in-time for their first use.

This is really important in node, because `require` is synchronous, and cannot be parallelized.
If you `require` any file and that contains top-level `require`s or static `import`s,
all of those files, and all of *their* dependencies will have to be resolved and transformed before any other code is executed.

If you're using `babel`, I recommend adding one of these plugins to the config passed into `node-webpackify` (it might not make sense in other cases):
- https://github.com/zertosh/babel-plugin-transform-inline-imports-commonjs
- https://github.com/princjef/babel-plugin-lazy-require

They will make your `require`'s evaluate at the first moment they're used,
rather than all upfront, making the start-up times much, much better.

You could even try experimenting with transpiling the `node_modules` code with these, to get even better boot times!

### Open PRs with improvements!
 
Since loaders can be slow, and `require`'s are synchronous, a lot could still be done to make `node-webpackify` faster:
- long-term caching based on file timestamps (like `babel-register`)
- improving logic for early bailing
- resolve-only before creating the Webpack module
- profile, find and eliminate bottlenecks!

## Debugging

Lunch your app with a `DEBUG=node-webpackify:*` environment variable, e.g.:

```bash
DEBUG=node-webpackify:* node -r ./register-webpack src/entry 
```

## Using the compiler directly

It might be useful for you to just use the extracted compiler,
for example to write a `jest` transform plugin out of it.

See the `src/compiler.test.ts` for details on usage.
