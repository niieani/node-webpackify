module.exports = {
  resolve: {
    extensions: ['.js', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader', options: { modules: true, importLoaders: 1 } },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: (loader) => [
                require('postcss-import')({ root: loader.resourcePath }),
                require('autoprefixer')(),
              ]
            },
          },
        ]
      }
    ],
  },
}
